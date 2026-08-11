"use client";

import { apiRequest } from "@/lib/api-client";
import { timedRequest } from "@/lib/request-timing";

export const PAGE_ROUTES={dashboard:"/api/backend/page/dashboard",profile:"/api/backend/page/profile",facilities:"/api/backend/page/facilities",assets:"/api/backend/page/assets",sensors:"/api/backend/page/sensors",downtime:"/api/backend/page/downtime",users:"/api/backend/page/users",roles:"/api/backend/page/users/roles",reports:"/api/backend/page/reports",governance:"/api/backend/page/governance",audit:"/api/backend/page/audit",olive:"/api/backend/page/olive",apiGateway:"/api/backend/page/api-gateway"} as const;
export type PageName=keyof typeof PAGE_ROUTES;

export function pageRequest<T>(page:PageName,options:RequestInit&{query?:URLSearchParams}={}){
  const {query,...init}=options;const route=`${PAGE_ROUTES[page]}${query?.size?`?${query}`:""}`;
  return timedRequest(`page:${page}`,()=>apiRequest<T>(route,init));
}
