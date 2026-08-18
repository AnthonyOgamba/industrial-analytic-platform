export type PlatformNotificationDetail = {
  title: string;
  message: string;
  correlationId?: string;
  notificationType?: string;
  severity?: string;
  route?: string;
  openPanel?: boolean;
};

export function notifyPlatform(detail: PlatformNotificationDetail) {
  window.dispatchEvent(new CustomEvent<PlatformNotificationDetail>("divu-platform-notification", { detail }));
}

