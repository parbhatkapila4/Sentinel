import { unstable_noStore as noStore } from "next/cache";
import { redirect } from "next/navigation";
import { format } from "date-fns";

import { getAuthenticatedUserId } from "@/lib/auth";
import { getWebhookById } from "@/app/actions/webhooks";

import { DaylightShell } from "@/components/sentinel/daylight/DaylightShell";
import { WebhookDetailView } from "@/components/sentinel/daylight/webhooks/WebhookDetailView";
import type { WebhookDetail } from "@/components/sentinel/daylight/webhooks/model";
import { buildShellContextForPage } from "@/components/sentinel/shell/buildContextForPage";

export const dynamic = "force-dynamic";

export default async function WebhookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  noStore();
  const { id } = await params;
  try {
    await getAuthenticatedUserId();
  } catch {
    redirect("/sign-in?redirect=/settings/webhooks");
  }

  const [shellContext, webhook] = await Promise.all([
    buildShellContextForPage(),
    getWebhookById(id).catch((): WebhookDetail | null => null),
  ]);
  // Outside any try/catch: redirect() works by throwing.
  if (!webhook) redirect("/settings/webhooks");

  const now = new Date();
  return (
    <DaylightShell
      title="Webhooks"
      dateLabel={format(now, "EEEE, MMMM d")}
      syncTime={shellContext.syncTime}
      sourceLabels={shellContext.sourceLabels}
      alertCount={shellContext.alertCount}
      onboarding={shellContext.onboarding}
    >
      <WebhookDetailView initialWebhook={webhook} nowMs={now.getTime()} />
    </DaylightShell>
  );
}
