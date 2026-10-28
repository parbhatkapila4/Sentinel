package main

import (
	"context"
	"errors"
	"flag"
	"fmt"
	"os"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/sync/errgroup"
)

func main() {
	os.Exit(run())
}

// run returns the process exit code:
//
//	0  records were checked and every one has a participant who is a contact of its user
//	1  at least one record has no such participant
//	2  the audit did not finish: no DATABASE_URL, bad URL, failed ping, a query error or the timeout
//	3  nothing to audit: 0 records checked, so the run proves nothing about the gate
func run() int {
	timeout := flag.Duration("timeout", 2*time.Minute, "give up after this long")
	flag.Parse()

	ctx, cancel := context.WithTimeout(context.Background(), *timeout)
	defer cancel()

	pool, err := connect(ctx, os.Getenv("DATABASE_URL"))
	if err != nil {
		fmt.Fprintln(os.Stderr, "gate-audit:", err)
		return 2
	}
	defer pool.Close()
	results := make([]result, len(sources))
	g, gctx := errgroup.WithContext(ctx)
	for i, src := range sources {
		g.Go(func() error {
			r, err := audit(gctx, pool, src)
			results[i] = r
			return err
		})
	}
	if err := g.Wait(); err != nil {
		fmt.Fprintln(os.Stderr, "gate-audit:", err)
		return 2
	}

	return printReport(results)
}

func connect(ctx context.Context, dsn string) (*pgxpool.Pool, error) {
	if dsn == "" {
		return nil, errors.New("DATABASE_URL is not set")
	}
	cfg, err := pgxpool.ParseConfig(dsn)
	if err != nil {
		return nil, err
	}
	for _, k := range []string{"pgbouncer", "connection_limit", "pool_timeout", "schema"} {
		delete(cfg.ConnConfig.RuntimeParams, k)
	}
	cfg.ConnConfig.DefaultQueryExecMode = pgx.QueryExecModeSimpleProtocol

	pool, err := pgxpool.NewWithConfig(ctx, cfg)
	if err != nil {
		return nil, err
	}
	if err := pool.Ping(ctx); err != nil {
		pool.Close()
		return nil, err
	}
	return pool, nil
}
func printReport(results []result) int {
	fmt.Print("CRM gate audit (read-only)\n\n")
	for _, r := range results {
		fmt.Printf("%-16s %8d checked %6d unmatched", r.name, r.checked, r.unmatched)
		if r.skipped > 0 {
			fmt.Printf("   (skipped %d manual, never gated)", r.skipped)
		}
		fmt.Println()
		if r.note != "" {
			fmt.Printf("    note: %s\n", r.note)
		}
		for i, id := range r.ids {
			fmt.Printf("    %s  created %s\n", id, r.createdAt[i].UTC().Format("2006-01-02 15:04:05 UTC"))
		}
		if more := r.unmatched - int64(len(r.ids)); more > 0 {
			fmt.Printf("    ... and %d more\n", more)
		}
	}
	line, code := verdict(results)
	fmt.Println(line)
	return code
}
func verdict(results []result) (string, int) {
	var checked, unmatched int64
	for _, r := range results {
		checked += r.checked
		unmatched += r.unmatched
	}
	switch {
	case unmatched > 0:
		return fmt.Sprintf("\nFAIL: %d records have no participant matching a contact of their user.", unmatched), 1
	case checked == 0:
		return "\nNOTHING TO AUDIT: 0 records checked, so this run proves nothing about the gate.", 3
	}
	return "\nOK: every audited record matches a contact of its user.", 0
}
