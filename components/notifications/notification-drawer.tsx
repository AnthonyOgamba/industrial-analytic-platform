"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Bell, Bot, ShieldAlert, X } from "lucide-react";
import type { AiNotification } from "@/lib/backend-dtos";
import { apiRequest } from "@/lib/api-client";
import { useOliveEvents } from "@/lib/olive-events";

export function NotificationDrawer({open,onClose}:{open:boolean;onClose:()=>void}){
  const router=useRouter();const[data,setData]=useState<AiNotification[]>([]);const[error,setError]=useState("");const[criticalOnly,setCriticalOnly]=useState(false);const olive=useOliveEvents();
  const load=async()=>{try{setData(await apiRequest("/api/backend/ai/notifications"));setError("")}catch(cause){setError(cause instanceof Error?cause.message:"Olive notifications are unavailable.")}};
  useEffect(()=>{if(!open)return;const escape=(event:KeyboardEvent)=>event.key==="Escape"&&onClose();window.addEventListener("keydown",escape);return()=>window.removeEventListener("keydown",escape)},[open,onClose]);
  useEffect(()=>{
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if(open)void load()
  },[open,olive.lastEvent]);
  const visible=useMemo(()=>criticalOnly?data.filter(item=>item.severity.toLowerCase()==="critical"):data,[data,criticalOnly]);
  async function markRead(item:AiNotification){await apiRequest(`/api/backend/ai/notifications/${item.notification_id}/read`,{method:"PATCH",body:"{}"});await load()}
  if(!open)return null;
  return <div className="fixed inset-0 z-[70] bg-black/45" onMouseDown={event=>event.target===event.currentTarget&&onClose()}><aside className="ml-auto flex h-full w-[min(32rem,96vw)] flex-col border-l bg-background shadow-2xl"><header className="flex items-start gap-3 border-b p-5"><span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><Bell className="size-5"/></span><div className="flex-1"><h2 className="font-bold">Olive Notifications</h2><p className="mt-1 text-xs text-muted-foreground">Authenticated backend notification records</p></div><button onClick={onClose} className="grid size-9 place-items-center rounded-lg border"><X className="size-4"/></button></header><div className="flex gap-2 border-b p-3"><button onClick={()=>void apiRequest("/api/backend/ai/notifications/mark-all-read",{method:"POST",body:"{}"}).then(load)} className="h-8 rounded-lg border px-3 text-xs">Mark all read</button><button onClick={()=>setCriticalOnly(value=>!value)} className={`h-8 rounded-lg border px-3 text-xs ${criticalOnly?"bg-primary text-primary-foreground":""}`}>Critical only</button></div>{error&&<p role="alert" className="m-3 flex items-center gap-2 text-xs text-destructive"><AlertTriangle className="size-4"/>{error}</p>}<div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">{visible.map(item=>{const read=item.read??item.is_read??false;return <article key={item.notification_id} className={`rounded-xl border p-4 ${read?"bg-card":"border-primary/30 bg-primary/5"}`}><div className="flex gap-3">{item.severity.toLowerCase()==="critical"?<ShieldAlert className="size-4 text-destructive"/>:<Bot className="size-4 text-primary"/>}<div className="min-w-0 flex-1"><div className="flex items-center gap-2"><h3 className="text-xs font-bold">{item.title}</h3><span className="rounded bg-muted px-2 py-0.5 font-mono text-[8px] uppercase">{item.severity}</span></div><p className="mt-2 text-[11px] leading-5">{item.message}</p><p className="mt-2 text-[9px] text-muted-foreground">{new Date(item.created_at).toLocaleString()}</p><div className="mt-3 flex gap-2">{!read&&<button onClick={()=>void markRead(item)} className="h-7 rounded-md border px-2 text-[9px]">Mark Read</button>}<button onClick={()=>{router.push(item.route||"/local-ai");onClose()}} className="h-7 rounded-md border px-2 text-[9px]">Open Olive</button></div></div></div></article>})}{!visible.length&&<p className="py-16 text-center text-xs text-muted-foreground">No Olive notifications are available.</p>}</div></aside></div>
}
