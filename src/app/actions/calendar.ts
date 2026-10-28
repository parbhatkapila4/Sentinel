"use server";

import { getAuthenticatedUserId } from "@/lib/auth";
import {
  syncCalendarForUser,
  type CalendarSyncResult,
} from "@/lib/sync/calendar-sync";
import { SYNC_IN_PROGRESS_MESSAGE } from "@/lib/sync/lock";

export async function syncCalendar(): Promise<CalendarSyncResult> {
  const userId = await getAuthenticatedUserId();
  const result = await syncCalendarForUser(userId);
  if (result.lockSkipped) {
    throw new Error(SYNC_IN_PROGRESS_MESSAGE);
  }
  return result;
}
