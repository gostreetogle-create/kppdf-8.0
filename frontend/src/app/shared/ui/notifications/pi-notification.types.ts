/**
 * In-app notification inbox (bell) — local ring, future-ready for manager mail.
 * Canon: docs/pages/ui-notification-center.md
 */

export type NotificationKind = 'toast' | 'system' | 'message';

export type NotificationSeverity = 'default' | 'success' | 'error' | 'warning';

export interface PiNotification {
  id: string;
  kind: NotificationKind;
  severity: NotificationSeverity;
  title: string;
  body?: string;
  createdAt: number;
  read: boolean;
  /** Future: manager display name / system source */
  source?: string;
}

export const NOTIFICATION_RING_SIZE = 20;
