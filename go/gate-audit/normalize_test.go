package main

import "testing"

func TestNormalizeEmail(t *testing.T) {
	tests := []struct {
		name   string
		in     string
		want   string
		wantOK bool
	}{
		{"already normalized", "jane@acme.com", "jane@acme.com", true},
		{"mixed case", "Jane.Doe@ACME.com", "jane.doe@acme.com", true},
		{"extra spaces", "   jane@acme.com  ", "jane@acme.com", true},
		{"tabs and newlines", "\tJane@Acme.com\r\n", "jane@acme.com", true},
		{"invalid: empty", "", "", false},
		{"invalid: only whitespace", " \t\n ", "", false},
		{"invalid: malformed passes through", "  Not An Email ", "not an email", true},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, ok := normalizeEmail(tt.in)
			if got != tt.want || ok != tt.wantOK {
				t.Errorf("normalizeEmail(%q) = %q, %v; want %q, %v", tt.in, got, ok, tt.want, tt.wantOK)
			}
		})
	}
}
