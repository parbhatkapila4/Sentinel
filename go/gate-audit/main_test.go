package main

import "testing"

func TestVerdict(t *testing.T) {
	tests := []struct {
		name     string
		results  []result
		wantLine string
		wantCode int
	}{
		{
			"zero records in every source",
			[]result{{name: "email messages"}, {name: "slack messages"}, {name: "calendar events"}, {name: "meetings"}},
			"\nNOTHING TO AUDIT: 0 records checked, so this run proves nothing about the gate.",
			3,
		},
		{
			"only skipped manual meetings, still 0 checked",
			[]result{{name: "email messages"}, {name: "meetings", skipped: 2}},
			"\nNOTHING TO AUDIT: 0 records checked, so this run proves nothing about the gate.",
			3,
		},
		{
			"records checked and all match",
			[]result{{name: "email messages", checked: 5}, {name: "slack messages"}},
			"\nOK: every audited record matches a contact of its user.",
			0,
		},
		{
			"records checked and some unmatched",
			[]result{{name: "email messages", checked: 5, unmatched: 2}, {name: "meetings", checked: 1, unmatched: 1}},
			"\nFAIL: 3 records have no participant matching a contact of their user.",
			1,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			line, code := verdict(tt.results)
			if line != tt.wantLine || code != tt.wantCode {
				t.Errorf("verdict() = %q, %d; want %q, %d", line, code, tt.wantLine, tt.wantCode)
			}
		})
	}
}
