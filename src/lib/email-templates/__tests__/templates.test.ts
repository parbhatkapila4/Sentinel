import { describe, expect, it } from "vitest";
import { dealAtRiskEmailHtml } from "../deal-at-risk";
import { actionOverdueEmailHtml } from "../action-overdue";
import { stageChangeEmailHtml } from "../stage-change";
import { dailyDigestEmailHtml } from "../daily-digest";
import { teamInviteEmailHtml } from "../team-invite";

describe("email templates", () => {
  it("escapes HTML in user-supplied deal names (deal-at-risk)", () => {
    const html = dealAtRiskEmailHtml(
      "<script>alert(1)</script>",
      "Champion silent",
      "https://app.sentinel.run/deals/abc"
    );
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("singularizes overdue copy at 1 day", () => {
    const html = actionOverdueEmailHtml("Acme renewal", "Send NDA", 1);
    expect(html).toContain("is 1 day overdue.");
    expect(html).not.toContain("1 days");
  });

  it("uses plural overdue copy beyond 1 day", () => {
    const html = actionOverdueEmailHtml("Acme renewal", "Send NDA", 5);
    expect(html).toContain("is 5 days overdue.");
  });

  it("humanizes snake_case stages in stage-change", () => {
    const html = stageChangeEmailHtml("Acme", "closed_won", "negotiation");
    expect(html).toContain("Closed Won");
    expect(html).toContain("Negotiation");
  });

  it("renders an empty-state row when daily digest has no items", () => {
    const html = dailyDigestEmailHtml([]);
    expect(html).toContain("No new notifications.");
  });

  it("clamps daily digest at 10 entries", () => {
    const items = Array.from({ length: 25 }, (_, i) => ({
      title: `Item ${i}`,
      message: `Body ${i}`,
    }));
    const html = dailyDigestEmailHtml(items);
    expect(html).toContain("Item 9");
    expect(html).not.toContain("Item 10");
  });

  it("renders the role label for known roles in team invites", () => {
    const admin = teamInviteEmailHtml("Anna", "anna@x.com", "https://x", "admin");
    expect(admin).toContain("Administrator");

    const viewer = teamInviteEmailHtml("Anna", "anna@x.com", "https://x", "viewer");
    expect(viewer).toContain("Viewer");

    const fallback = teamInviteEmailHtml("Anna", "anna@x.com", "https://x");
    expect(fallback).toContain("Member");
  });

  it("escapes URLs and names in team invites", () => {
    const html = teamInviteEmailHtml(
      'Mallory<script>',
      "m@x.com",
      "https://x.com/?q=<>&\"'"
    );
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("&amp;");
  });
});
