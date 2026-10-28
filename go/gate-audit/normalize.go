package main

import "strings"
func normalizeEmail(raw string) (string, bool) {
	email := strings.ToLower(strings.TrimSpace(raw))
	return email, email != ""
}
func emailSQL(expr string) string {
	return `lower(regexp_replace(` + expr + `, '^\s+|\s+$', '', 'g'))`
}
