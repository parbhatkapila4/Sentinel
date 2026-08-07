import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

const UI_FILE = "src/components/webhook-form.tsx";
const TYPE_FILE = "src/lib/webhooks.ts";

function read(rel: string): string {
  return readFileSync(resolve(process.cwd(), rel), "utf8");
}
function sourceFiles(dir = "src"): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(resolve(process.cwd(), dir), {
    withFileTypes: true,
  })) {
    const rel = `${dir}/${entry.name}`;
    if (entry.isDirectory()) {
      if (entry.name === "__tests__") continue;
      out.push(...sourceFiles(rel));
    } else if (/\.tsx?$/.test(entry.name)) {
      out.push(rel);
    }
  }
  return out;
}

const subscribable = [
  ...read(UI_FILE).matchAll(/value:\s*"([a-z]+\.[a-z_]+)"/g),
].map((m) => m[1]);

const unionMembers = [
  ...(
    read(TYPE_FILE).split("export type WebhookEventType")[1]?.split(";")[0] ??
    ""
  ).matchAll(/"([a-z]+\.[a-z_]+)"/g),
].map((m) => m[1]);

const dispatched = new Set<string>();
for (const file of sourceFiles()) {
  const text = read(file);
  for (const m of text.matchAll(
    /dispatchWebhookEvent\(\s*[^,]+,\s*[^,]+,\s*"([a-z]+\.[a-z_]+)"/g,
  )) {
    dispatched.add(m[1]);
  }
}

describe("webhook events are real", () => {
  it("found the UI option list and the type union", () => {
    expect(subscribable.length).toBeGreaterThan(0);
    expect(unionMembers.length).toBeGreaterThan(0);
    expect(dispatched.size).toBeGreaterThan(0);
  });

  for (const event of subscribable) {
    it(`"${event}" is subscribable and is actually dispatched`, () => {
      expect(
        dispatched.has(event),
        `${UI_FILE} offers "${event}" but no dispatchWebhookEvent(..., "${event}", ...) ` +
          "call exists in src/. A user can subscribe to it and will silently " +
          "receive nothing. Either dispatch it or remove the option.",
      ).toBe(true);
    });
  }

  for (const event of unionMembers) {
    it(`union member "${event}" is dispatched somewhere`, () => {
      expect(
        dispatched.has(event),
        `WebhookEventType declares "${event}" but nothing dispatches it. ` +
          "Dead union members get documented as real events - that is how " +
          "team.member_added ended up in the developer docs without ever firing.",
      ).toBe(true);
    });
  }

  it("every dispatched event is declared in the union", () => {
    const undeclared = [...dispatched].filter((e) => !unionMembers.includes(e));
    expect(
      undeclared,
      "These events are dispatched but missing from WebhookEventType, so they " +
        "cannot be subscribed to and will never reach anyone.",
    ).toEqual([]);
  });

  it("the developer docs list exactly the dispatched events", () => {
    const docs = read("src/app/docs/developers/page.tsx");
    const documented = [...docs.matchAll(/event:\s*"([a-z]+\.[a-z_]+)"/g)].map(
      (m) => m[1],
    );

    expect(documented.length).toBeGreaterThan(0);
    expect(
      documented.filter((e) => !dispatched.has(e)),
      "The developer docs document webhook events that are never dispatched.",
    ).toEqual([]);
  });
});
