"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Bell, Bot, Check, CircleAlert, FileText, ShieldAlert, X } from "lucide-react";
import type { DivuNotification, NotificationSeverity } from "./notification-types";
import type { AiNotification } from "@/lib/backend-dtos";
import { apiRequest } from "@/lib/api-client";

type Tab = "All" | "Critical" | "Olive" | "Approvals" | "Reports" | "Security" | "Operations";
const tabs: Tab[] = ["All", "Critical", "Olive", "Approvals", "Reports", "Security", "Operations"];
const severityStyle: Record<NotificationSeverity, string> = {
  Critical: "border-red-500/35 bg-red-500/10 text-red-600 dark:text-red-300",
  High: "border-amber-500/35 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  Medium: "border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300",
  Low: "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300",
};

export function NotificationDrawer({ open, notifications, onClose, onChange }: { open: boolean; notifications: DivuNotification[]; onClose: () => void; onChange: (items: DivuNotification[]) => void }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("All");
  const [message, setMessage] = useState("");
  const [assigning, setAssigning] = useState<string | null>(null);
  const [manager, setManager] = useState("Admin User");
  const [aiNotifications, setAiNotifications] = useState<AiNotification[]>([]);
  const [aiError, setAiError] = useState("");

  const loadAi = async () => { try { setAiNotifications(await apiRequest<AiNotification[]>("/api/backend/ai/notifications")); setAiError(""); } catch (cause) { setAiError(cause instanceof Error ? cause.message : "Olive notifications are unavailable."); } };

  useEffect(() => { if (!open) return; const escape = (event: KeyboardEvent) => event.key === "Escape" && onClose(); window.addEventListener("keydown", escape); return () => window.removeEventListener("keydown", escape); }, [open, onClose]);
  useEffect(() => { if (!open) return;
    // Loading occurs in response to the drawer becoming visible.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadAi(); const source = new EventSource("/api/backend/ai/events"); source.addEventListener("notification.created", () => void loadAi()); source.addEventListener("notification.read", () => void loadAi()); source.addEventListener("notifications.read_all", () => void loadAi()); return () => source.close();
  }, [open]);
  const mappedAi = useMemo<DivuNotification[]>(() => aiNotifications.map((item) => ({ id:`ai-${item.notification_id}`, title:item.title, type:"Olive", severity: item.severity.toLowerCase()==="critical"?"Critical":item.severity.toLowerCase()==="high"?"High":item.severity.toLowerCase()==="warning"?"Medium":"Low", read:item.read??item.is_read??false, message:item.message, time:new Date(item.created_at).toLocaleString(), source:"Olive", route:item.route||"/local-ai", actions:[...(item.read??item.is_read?[]:["Mark Read"]),"View Olive"] })), [aiNotifications]);
  const combined = useMemo(() => [...mappedAi, ...notifications], [mappedAi, notifications]);
  const counts = useMemo(() => Object.fromEntries(tabs.map((item) => [item, combined.filter((n) => item === "All" || (item === "Critical" && n.severity === "Critical") || (item === "Approvals" && n.type === "Approval") || (item === "Reports" && n.type === "Report") || n.type === item.replace(/s$/, "")).length])), [combined]);
  const filtered = combined.filter((n) => tab === "All" || (tab === "Critical" && n.severity === "Critical") || (tab === "Approvals" && n.type === "Approval") || (tab === "Reports" && n.type === "Report") || n.type === tab.replace(/s$/, ""));
  const markRead = async (id: string) => { if(id.startsWith("ai-")){await apiRequest(`/api/backend/ai/notifications/${id.slice(3)}/read`,{method:"PATCH",body:"{}"});await loadAi();return}onChange(notifications.map((n) => n.id === id ? { ...n, read: true } : n)); };
  function action(notification: DivuNotification, label: string) {
    if (label === "Mark Read" || label === "Acknowledge") { void markRead(notification.id); return; }
    if (label === "View Olive") { router.push(notification.route || "/local-ai"); onClose(); return; }
    if (label === "Restore Action") { setMessage("Action restored to pending review."); markRead(notification.id); return; }
    if (label === "Assign Manager") { setAssigning(notification.id); return; }
    if (label === "Download") { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob(["DIVU Analytics report export"])); a.download = "scrap-analysis.pdf"; a.click(); URL.revokeObjectURL(a.href); return; }
    router.push(notification.route); onClose();
  }
  if (!open) return null;
  return <div className="fixed inset-0 z-[70] bg-black/45 backdrop-blur-[1px]" onMouseDown={(e) => e.target === e.currentTarget && onClose()}><aside role="dialog" aria-modal="true" aria-labelledby="notifications-title" className="ml-auto flex h-full w-[min(32rem,96vw)] flex-col border-l bg-background shadow-2xl">
    <header className="flex items-start gap-3 border-b p-4 sm:p-5"><span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><Bell className="size-5"/></span><div className="min-w-0 flex-1"><h2 id="notifications-title" className="font-bold">Notifications</h2><p className="mt-1 text-xs text-muted-foreground">System alerts, approvals, reports, and AI-detected events</p></div><button type="button" onClick={onClose} className="grid size-9 place-items-center rounded-lg border hover:bg-muted" aria-label="Close notifications"><X className="size-4"/></button></header>
    <div className="flex flex-wrap items-center gap-2 border-b p-3"><button type="button" onClick={() => {onChange(notifications.map((n) => ({...n, read: true})));void apiRequest("/api/backend/ai/notifications/mark-all-read",{method:"POST",body:"{}"}).then(loadAi).catch(cause=>setAiError(cause instanceof Error?cause.message:"Olive notifications could not be updated."))}} className="h-8 rounded-lg border px-3 text-xs hover:bg-muted">Mark all as read</button><button type="button" onClick={() => onChange(notifications.filter((n) => !n.read))} className="h-8 rounded-lg border px-3 text-xs hover:bg-muted">Clear read</button>{message && <span className="text-xs text-emerald-600">{message}</span>}{aiError&&<span role="alert" className="text-xs text-destructive">{aiError}</span>}</div>
    <nav className="overflow-x-auto border-b" aria-label="Notification filters"><div className="flex min-w-max" role="tablist">{tabs.map((item) => <button type="button" role="tab" aria-selected={tab === item} key={item} onClick={() => setTab(item)} className={`h-11 border-b-2 px-3 text-[10px] font-medium ${tab === item ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}>{item} <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5">{counts[item]}</span></button>)}</div></nav>
    <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3 sm:p-4">{filtered.map((n) => <article key={n.id} className={`rounded-xl border p-3.5 ${!n.read ? severityStyle[n.severity] : "bg-card"}`}><div className="flex items-start gap-3"><span className="mt-0.5 shrink-0">{n.severity === "Critical" ? <ShieldAlert className="size-4"/> : n.type === "Report" ? <FileText className="size-4"/> : n.title.startsWith("AI") ? <Bot className="size-4"/> : n.severity === "High" ? <AlertTriangle className="size-4"/> : <CircleAlert className="size-4"/>}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-1.5"><h3 className="text-xs font-bold">{n.title}</h3><span className="rounded bg-background/60 px-1.5 py-0.5 font-mono text-[8px]">{n.severity}</span><span className="rounded bg-background/60 px-1.5 py-0.5 font-mono text-[8px]">{n.type}</span>{!n.read && <span className="size-2 rounded-full bg-primary" aria-label="Unread"/>}</div><p className="mt-2 text-[11px] leading-5 text-foreground/85">{n.message}</p><p className="mt-2 text-[9px] text-muted-foreground">{n.source} · {n.time}</p><div className="mt-3 flex flex-wrap gap-1.5">{n.actions.map((label) => <button type="button" key={label} onClick={() => action(n,label)} className="h-7 rounded-md border bg-background/70 px-2 text-[9px] font-medium hover:bg-muted">{label}</button>)}</div>{assigning === n.id && <div className="mt-3 flex gap-2"><select aria-label="Assign manager" value={manager} onChange={(e) => setManager(e.target.value)} className="h-8 min-w-0 flex-1 rounded-lg border bg-background px-2 text-[10px]">{["Admin User","Carlos Rivera","Anna Müller","James Okafor","Elena Vasquez"].map((name) => <option key={name}>{name}</option>)}</select><button type="button" onClick={() => { setMessage(`Assigned to ${manager}.`); markRead(n.id); setAssigning(null); }} className="h-8 rounded-lg bg-primary px-3 text-[10px] text-primary-foreground"><Check className="mr-1 inline size-3"/>Save</button></div>}</div></div></article>)}{filtered.length === 0 && <p className="py-16 text-center text-xs text-muted-foreground">No notifications in this view.</p>}</div>
    <footer className="flex items-center justify-between border-t p-4 text-[9px] text-muted-foreground"><span>Backend notifications refresh while open</span><span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-emerald-500"/>Olive · secured gateway</span></footer>
  </aside></div>;
}
