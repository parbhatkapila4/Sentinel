package main

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type source struct {
	name, rows string
	note       string 
}

var sources = []source{
	{

		name: "email messages",
		note: "flagged rows may have passed on a Cc/Bcc match, which can't be checked from stored data",
		rows: `
SELECT e.id, e."createdAt" AS created_at, e."userId" AS user_id, u.email AS self_email,
       ARRAY[coalesce(substring(e."fromEmail" from '<([^>]+)>'),
                      regexp_replace(e."fromEmail", '\([^)]*\)', '', 'g'))]
         || e."toEmails" AS emails, false AS skipped
FROM "EmailMessage" e
JOIN "User" u ON u.id = e."userId"`,
	},
	{
		name: "slack messages",
		rows: `
SELECT m.id, m."receivedAt" AS created_at, m."userId" AS user_id, s."selfEmail" AS self_email,
       ARRAY[m."senderEmail"] || m."matchedCrmContacts" AS emails, false AS skipped
FROM "SlackMessage" m
JOIN "SlackEventsSubscription" s ON s.id = m."subscriptionId"`,
	},
	{
		name: "calendar events",
		rows: `
SELECT ce.id, ce."createdAt" AS created_at, ce."userId" AS user_id, ci.email AS self_email,
       ARRAY[ce."organizerEmail"] || ARRAY(
         SELECT a ->> 'email'
         FROM jsonb_array_elements(CASE WHEN jsonb_typeof(ce.attendees) = 'array' THEN ce.attendees END) AS a
       ) AS emails, false AS skipped
FROM "CalendarEvent" ce
LEFT JOIN "CalendarIntegration" ci ON ci."userId" = ce."userId"`,
	},
	{
		name: "meetings",
		note: "flagged rows may have passed on an organizer match, which can't be checked from stored data",
		rows: `
SELECT mt.id, mt."createdAt" AS created_at, mt."userId" AS user_id, u.email AS self_email,
       mt.attendees AS emails, mt.source = 'manual' AS skipped
FROM "Meeting" mt
JOIN "User" u ON u.id = mt."userId"`,
	},
}

func auditSQL(rows string) string {
	email := emailSQL("p.email")
	return `
WITH r AS (` + rows + `
), audited AS (
  SELECT id, created_at, skipped, NOT skipped AND NOT EXISTS (
    SELECT 1
    FROM unnest(r.emails) AS p(email)
    JOIN "Contact" c ON c."userId" = r.user_id AND c.email = ` + email + `
    WHERE ` + email + ` IS DISTINCT FROM ` + emailSQL("r.self_email") + `
  ) AS unmatched
  FROM r
)
SELECT count(*) FILTER (WHERE NOT skipped),
       count(*) FILTER (WHERE unmatched),
       count(*) FILTER (WHERE skipped),
       ARRAY(SELECT id FROM audited WHERE unmatched ORDER BY created_at DESC, id LIMIT 10),
       ARRAY(SELECT created_at FROM audited WHERE unmatched ORDER BY created_at DESC, id LIMIT 10)
FROM audited`
}

type result struct {
	name, note                  string
	checked, unmatched, skipped int64
	ids                         []string
	createdAt                   []time.Time
}
func audit(ctx context.Context, pool *pgxpool.Pool, src source) (result, error) {
	r := result{name: src.name, note: src.note}
	err := pgx.BeginTxFunc(ctx, pool, pgx.TxOptions{AccessMode: pgx.ReadOnly}, func(tx pgx.Tx) error {
		return tx.QueryRow(ctx, auditSQL(src.rows)).
			Scan(&r.checked, &r.unmatched, &r.skipped, &r.ids, &r.createdAt)
	})
	if err != nil {
		return r, fmt.Errorf("%s: %w", src.name, err)
	}
	return r, nil
}
