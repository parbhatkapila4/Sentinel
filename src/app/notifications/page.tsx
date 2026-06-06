import { unstable_noStore as noStore } from "next/cache";
import { redirect } from "next/navigation";
import { isToday } from "date-fns";

import { getAuthenticatedUserId } from "@/lib/auth";
import {
  getUserNotifications,
  getUnreadCount,
} from "@/lib/notifications";
import { prisma } from "@/lib/prisma";
import { getAllDeals } from "@/app/actions/deals";
import { getAllIntegrationStatuses } from "@/app/actions/integrations";
import {
  calculatePipelineMetrics,
  getStageDistribution,
} from "@/lib/analytics";

import { SentinelShell } from "@/components/sentinel/shell/SentinelShell";
import {
  buildSentinelShellContext,
  mapRawDealsToSentinel,
} from "@/components/sentinel/shell-context";
import {
  NotificationsWorkspace,
  type NotificationRow,
} from "@/components/sentinel/notifications/NotificationsWorkspace";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

const normalizeStage = (s: string) => s.toLowerCase().replace(/\s+/g, "_");
const isClosedWon = (s: string) => {
  const n = normalizeStage(s);
  return n === "closed_won" || n === "closed";
};

export default async function NotificationsPage() {
  noStore();

  let userId: string;
  try {
    userId = await getAuthenticatedUserId();
  } catch {
    redirect("/sign-in?redirect=/notifications");
  }

  const [
    notificationsRaw,
    unreadCount,
    todayCount,
    totalCount,
    dealsRaw,
    integrationStatuses,
  ] = await Promise.all([
    safeCall(
      () =>
        getUserNotifications(userId, {
          limit: PAGE_SIZE,
          skip: 0,
          unreadOnly: false,
        }),
      []
    ),
    safeCall(() => getUnreadCount(userId), 0),
    safeCall(
      () =>
        prisma.notification.count({
          where: {
            userId,
            createdAt: { gte: startOfToday() },
          },
        }),
      0
    ),
    safeCall(
      () => prisma.notification.count({ where: { userId } }),
      0
    ),
    safeCall(() => getAllDeals(), []),
    safeCall(() => getAllIntegrationStatuses(), null),
  ]);

  const hasAnyDeals = dealsRaw.length > 0;
  const isDemoMode = hasAnyDeals && dealsRaw.every((d) => d.isDemo);
  const deals = mapRawDealsToSentinel(dealsRaw);

  const { totalDeals } = calculatePipelineMetrics(dealsRaw);
  const stageDist = getStageDistribution(dealsRaw);
  const closedWonCount = Object.entries(stageDist).reduce(
    (sum, [stage, count]) => sum + (isClosedWon(stage) ? count : 0),
    0
  );
  const coveragePercent =
    totalDeals > 0 ? (closedWonCount / totalDeals) * 100 : 0;

  const now = new Date();
  const shellContext = buildSentinelShellContext({
    deals,
    integrationStatuses,
    coveragePercent,
    hasAnyDeals,
    isDemoMode,
    now,
  });

  const initialItems: NotificationRow[] = notificationsRaw.map((n) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    message: n.message,
    dealId: n.dealId,
    teamId: n.teamId,
    read: n.read,
    emailSent: n.emailSent,
    createdAt: n.createdAt.toISOString(),
  }));

  const derivedToday = initialItems.filter((n) => isToday(new Date(n.createdAt)))
    .length;
  const todayFinal = todayCount > 0 ? todayCount : derivedToday;

  return (
    <SentinelShell
      syncTime={shellContext.syncTime}
      coveragePercent={shellContext.coveragePercent}
      sourceLabels={shellContext.sourceLabels}
      alertCount={shellContext.alertCount}
      tickerItems={shellContext.tickerItems}
      onboarding={shellContext.onboarding}
    >
      <div
        style={{
          minHeight: "calc(100vh - 140px)",
          background: "var(--ink)",
          color: "var(--cream)",
        }}
      >
        <NotificationsWorkspace
          initialItems={initialItems}
          initialUnread={unreadCount}
          initialHasMore={initialItems.length === PAGE_SIZE}
          totalCount={totalCount}
          todayCount={todayFinal}
          pageSize={PAGE_SIZE}
          nowISO={now.toISOString()}
        />
      </div>
    </SentinelShell>
  );
}

async function safeCall<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}

function startOfToday(): Date {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
