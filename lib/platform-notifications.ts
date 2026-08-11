export type PlatformNotificationDetail = {
  title: string;
  message: string;
};

export function notifyPlatform(detail: PlatformNotificationDetail) {
  window.dispatchEvent(new CustomEvent<PlatformNotificationDetail>("divu-platform-notification", { detail }));
}

