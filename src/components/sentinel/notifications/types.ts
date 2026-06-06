export interface NotificationRow {
  id: string;
  type: string;
  title: string;
  message: string;
  dealId: string | null;
  teamId: string | null;
  read: boolean;
  emailSent: boolean;
  createdAt: string;
}

export type NotificationCategory =
  | "RISK"
  | "ACTION"
  | "STAGE"
  | "TEAM"
  | "MENTION"
  | "SYSTEM";

export interface CategoryStyle {
  label: string;
  labelColor: string;
  iconColor: string;
}
