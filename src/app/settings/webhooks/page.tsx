import { unstable_noStore as noStore } from "next/cache";
import { redirect } from "next/navigation";
import { format } from "date-fns";

import { getAuthenticatedUserId } from "@/lib/auth";
import { getMyWebhooks } from "@/app/actions/webhooks";

import { DaylightShell } from "@/components/sentinel/daylight/DaylightShell";
import { WebhooksView } from "@/components/sentinel/daylight/webhooks/WebhooksView";
import type { WebhookListItem } from "@/components/sentinel/daylight/webhooks/model";
import { buildShellContextForPage } from "@/components/sentinel/shell/buildContextForPage";

export const dynamic = "force-dynamic";

export default async function WebhooksSettingsPage() {
  noStore();
  try {
    await getAuthenticatedUserId();
  } catch {
    redirect("/sign-in?redirect=/settings/webhooks");
  }

  const [shellContext, webhooks] = await Promise.all([
    buildShellContextForPage(),
    getMyWebhooks().catch((): WebhookListItem[] | null => null),
  ]);

  return (
    <DaylightShell
      title="Webhooks"
      dateLabel={format(new Date(), "EEEE, MMMM d")}
      syncTime={shellContext.syncTime}
      sourceLabels={shellContext.sourceLabels}
      alertCount={shellContext.alertCount}
      onboarding={shellContext.onboarding}
    >
      <WebhooksView initialWebhooks={webhooks ?? []} loadError={webhooks === null} />
    </DaylightShell>
  );
}
