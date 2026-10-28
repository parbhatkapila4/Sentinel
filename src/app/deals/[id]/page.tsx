import { notFound, redirect } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { format } from "date-fns";

import { getAllDeals, getDealById } from "@/app/actions/deals";
import {
  getGoogleCalendarStatus,
  getUpcomingMeetings,
} from "@/app/actions/google-calendar";
import { UnauthorizedError } from "@/lib/errors";

import { DaylightShell } from "@/components/sentinel/daylight/DaylightShell";
import { DealDetailView } from "@/components/sentinel/daylight/deal/DealDetailView";
import { buildDealView } from "@/components/sentinel/daylight/deal/model";
import { buildShellContextForPage } from "@/components/sentinel/shell/buildContextForPage";

export const dynamic = "force-dynamic";

export default async function DealDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  noStore();
  const { id } = await params;

  let deal;
  try {
    deal = await getDealById(id);
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      redirect("/sign-in?redirect=" + encodeURIComponent("/deals/" + id));
    }
    notFound();
  }

  const [allDeals, meetings, calendar, shellContext] = await Promise.all([
    getAllDeals().catch(() => [] as Awaited<ReturnType<typeof getAllDeals>>),
    getUpcomingMeetings(deal.id).catch(
      () => [] as Awaited<ReturnType<typeof getUpcomingMeetings>>
    ),
    getGoogleCalendarStatus(),
    buildShellContextForPage(),
  ]);

  const now = new Date();
  const view = buildDealView(
    {
      deal: {
        ...deal,
        riskReasons: deal.riskReasons ?? [],
        team: deal.team ? { id: deal.team.id, name: deal.team.name } : null,
        assignedTo: deal.assignedTo ?? null,
      },
      book: allDeals,
      meetings,
      calendarConnected: calendar.connected,
    },
    now.getTime()
  );

  return (
    <DaylightShell
      title="Deals"
      dateLabel={format(now, "EEEE, MMMM d")}
      syncTime={shellContext.syncTime}
      sourceLabels={shellContext.sourceLabels}
      alertCount={shellContext.alertCount}
      onboarding={shellContext.onboarding}
    >
      <DealDetailView view={view} />
    </DaylightShell>
  );
}
