// SENTINEL - read src/components/sentinel/_design-rules.md before editing.
// No text-white / bg-black / bg-neutral-* / text-gray-* allowed in this subtree.

import { unstable_noStore as noStore } from "next/cache";

import { SentinelShell } from "@/components/sentinel/shell/SentinelShell";
import { buildShellContextForPage } from "@/components/sentinel/shell/buildContextForPage";
import { AcceptInviteClient } from "./accept-invite-client";

export const dynamic = "force-dynamic";

export default async function AcceptInvitePage() {
  noStore();
  const shellContext = await buildShellContextForPage();

  return (
    <SentinelShell
      syncTime={shellContext.syncTime}
      coveragePercent={shellContext.coveragePercent}
      sourceLabels={shellContext.sourceLabels}
      alertCount={shellContext.alertCount}
      tickerItems={shellContext.tickerItems}
      onboarding={shellContext.onboarding}
    >
      <AcceptInviteClient />
    </SentinelShell>
  );
}
