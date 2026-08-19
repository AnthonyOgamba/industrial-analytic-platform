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

export function notificationsForUser(notifications:CanonicalNotificationDto[],userId:number) {
  return notifications.filter(item=>item.recipientUserId===userId);
}

export function mergeNotificationsForUser(current:CanonicalNotificationDto[],canonical:CanonicalNotificationDto[],userId:number) {
  const ownedCanonical=notificationsForUser(canonical,userId);
  const keys=new Set(ownedCanonical.map(item=>item.correlationId).filter(Boolean));
  const transient=notificationsForUser(current,userId).filter(item=>item.notificationId<0&&(!item.correlationId||!keys.has(item.correlationId)));
  return [...transient,...ownedCanonical];
}

export function dashboardNotificationKey(userId:number,facilityScope:string,period:string,unavailableMetrics:string[]) {
  return `dashboard:${userId}:${facilityScope}:${period}:${unavailableMetrics.toSorted().join(",")||"partial"}`;
}

import type { CanonicalNotificationDto } from "@/lib/backend-dtos";
