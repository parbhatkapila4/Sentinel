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

	if printReport(results) > 0 {
		return 1
	}
	return 0
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
func printReport(results []result) int64 {
	fmt.Print("CRM gate audit (read-only)\n\n")
	var total int64
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
		total += r.unmatched
	}
	if total > 0 {
		fmt.Printf("\nFAIL: %d records have no participant matching a contact of their user.\n", total)
	} else {
		fmt.Println("\nOK: every audited record matches a contact of its user.")
	}
	return total
}
