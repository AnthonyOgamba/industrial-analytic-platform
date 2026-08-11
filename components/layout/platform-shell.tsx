"use client";

// FEATURE: Authenticated platform shell
// COMPONENT: Shared navigation, notifications, theme, language, profile, and accessibility controls.
// SESSION: Protected content uses the authorization provider; navigation is capability-filtered.
// API: Notification and profile preferences use authenticated /api/backend routes.

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  Accessibility,
  Bell,
  ChevronDown,
  CircleUserRound,
  ClipboardList,
  Cpu,
  FileClock,
  FileText,
  LayoutDashboard,
  Languages,
  Menu,
  Moon,
  Bot,
  Radio,
  Settings2,
  ShieldCheck,
  ShieldEllipsis,
  Sun,
  Users,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { NotificationDrawer } from "@/components/notifications/notification-drawer";
import { apiRequest } from "@/lib/api-client";
import { useAccess } from "@/lib/access-control";
import type { CanonicalNotificationDto } from "@/lib/backend-dtos";
import { normalizeNotifications } from "@/lib/normalize-notifications";
import type { PlatformNotificationDetail } from "@/lib/platform-notifications";

type Language = "en"|"fr"|"es"|"pa";
const languageNames:Record<Language,string>={en:"English",fr:"Français",es:"Español",pa:"ਪੰਜਾਬੀ"};
const translations:Record<Language,Record<string,string>>={
  en:{Dashboard:"Dashboard",Operations:"Operations",Facilities:"Facilities",Assets:"Assets",Sensors:"Sensors",Downtime:"Downtime",Analytics:"Analytics",Reports:"Reports",AI:"AI","Olive AI":"Olive AI","Governance & Security":"Governance & Security","Data Governance":"Data Governance","Security Operations":"Security Operations","Audit Log":"Audit Log","User & Access Management":"User & Access Management",Users:"Users",Roles:"Roles",Permissions:"Permissions","Access Assignments":"Access Assignments","Access Requests":"Access Requests",Notifications:"Notifications",Profile:"Profile",Accessibility:"Accessibility"},
  fr:{Dashboard:"Tableau de bord",Operations:"Opérations",Facilities:"Installations",Assets:"Actifs",Sensors:"Capteurs",Downtime:"Temps d’arrêt",Analytics:"Analytique",Reports:"Rapports",AI:"IA","Olive AI":"IA Olive","Governance & Security":"Gouvernance et sécurité","Data Governance":"Gouvernance des données","Security Operations":"Opérations de sécurité","Audit Log":"Journal d’audit","User & Access Management":"Gestion des utilisateurs et accès",Users:"Utilisateurs",Roles:"Rôles",Permissions:"Autorisations","Access Assignments":"Attributions d’accès","Access Requests":"Demandes d’accès",Notifications:"Notifications",Profile:"Profil",Accessibility:"Accessibilité"},
  es:{Dashboard:"Panel",Operations:"Operaciones",Facilities:"Instalaciones",Assets:"Activos",Sensors:"Sensores",Downtime:"Tiempo de inactividad",Analytics:"Analítica",Reports:"Informes",AI:"IA","Olive AI":"IA Olive","Governance & Security":"Gobernanza y seguridad","Data Governance":"Gobernanza de datos","Security Operations":"Operaciones de seguridad","Audit Log":"Registro de auditoría","User & Access Management":"Gestión de usuarios y acceso",Users:"Usuarios",Roles:"Roles",Permissions:"Permisos","Access Assignments":"Asignaciones de acceso","Access Requests":"Solicitudes de acceso",Notifications:"Notificaciones",Profile:"Perfil",Accessibility:"Accesibilidad"},
  pa:{Dashboard:"ਡੈਸ਼ਬੋਰਡ",Operations:"ਕਾਰਜ",Facilities:"ਸਹੂਲਤਾਂ",Assets:"ਸੰਪਤੀਆਂ",Sensors:"ਸੈਂਸਰ",Downtime:"ਬੰਦ ਸਮਾਂ",Analytics:"ਵਿਸ਼ਲੇਸ਼ਣ",Reports:"ਰਿਪੋਰਟਾਂ",AI:"ਏਆਈ","Olive AI":"Olive ਏਆਈ","Governance & Security":"ਸ਼ਾਸਨ ਅਤੇ ਸੁਰੱਖਿਆ","Data Governance":"ਡਾਟਾ ਸ਼ਾਸਨ","Security Operations":"ਸੁਰੱਖਿਆ ਕਾਰਜ","Audit Log":"ਆਡਿਟ ਲੌਗ","User & Access Management":"ਯੂਜ਼ਰ ਅਤੇ ਪਹੁੰਚ ਪ੍ਰਬੰਧਨ",Users:"ਉਪਭੋਗਤਾ",Roles:"ਭੂਮਿਕਾਵਾਂ",Permissions:"ਅਨੁਮਤੀਆਂ","Access Assignments":"ਪਹੁੰਚ ਨਿਯੁਕਤੀਆਂ","Access Requests":"ਪਹੁੰਚ ਬੇਨਤੀਆਂ",Notifications:"ਸੂਚਨਾਵਾਂ",Profile:"ਪ੍ਰੋਫਾਈਲ",Accessibility:"ਪਹੁੰਚਯੋਗਤਾ"},
};

type NavigationItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  capability: string | string[];
};

type NavigationGroup = {
  label: string;
  items: NavigationItem[];
};

const navigation: NavigationGroup[] = [
  {
    label: "",
    items: [
      { label: "Dashboard", href: "/", icon: LayoutDashboard, capability: "dashboard.view" },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Facilities", href: "/operations", icon: Settings2, capability: "facilities.view" },
      { label: "Assets", href: "/assets", icon: Cpu, capability: "assets.view" },
      { label: "Sensors", href: "/sensors", icon: Radio, capability: "sensors.view" },
      { label: "Downtime", href: "/downtime", icon: FileClock, capability: "downtime.view" },
    ],
  },
  {
    label: "Analytics",
    items: [
      { label: "Reports", href: "/reports", icon: FileText, capability: "reports.view" },
    ],
  },
  {
    label: "AI",
    items: [
      { label: "Olive AI", href: "/local-ai", icon: Bot, capability: "olive.use" },
    ],
  },
  {
    label: "Governance & Security",
    items: [
      { label: "Data Governance", href: "/governance", icon: ShieldCheck, capability: "governance.view" },
      { label: "Security Operations", href: "/security-ops", icon: ShieldEllipsis, capability: "security.view" },
      { label: "Audit & Approvals", href: "/audit", icon: ClipboardList, capability: "audit.view" },
    ],
  },
  {
    label: "User & Access Management",
    items: [
      { label: "Users", href: "/users", icon: Users, capability: "users.view" },
    ],
  },
];

const pageTitles = new Map(
  navigation.flatMap((group) => group.items.map((item) => [item.href, item.label])),
);
pageTitles.set("/profile", "Profile");
pageTitles.set("/api-security/logs", "API Audit Log");

function isActivePath(pathname: string, href: string) {
  const hrefPath = href.split("?")[0];
  return href === "/"
    ? pathname === href
    : pathname === hrefPath || pathname.startsWith(`${hrefPath}/`);
}

function ThemeToggle() {
  useEffect(() => {
    const savedTheme = window.localStorage.getItem("divu-theme");
    const initialTheme =
      savedTheme === "dark" || savedTheme === "light"
        ? savedTheme
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";

    document.documentElement.classList.toggle("dark", initialTheme === "dark");
  }, []);

  function toggleTheme() {
    const nextTheme = document.documentElement.classList.contains("dark")
      ? "light"
      : "dark";
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    window.localStorage.setItem("divu-theme", nextTheme);
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="grid size-9 place-items-center rounded-lg border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      aria-label="Toggle color theme"
    >
      <Moon className="size-4 dark:hidden" />
      <Sun className="hidden size-4 dark:block" />
    </button>
  );
}

function SidebarContent({ onNavigate, user, language }: { onNavigate?: () => void; user?:{username:string;displayRole:string;capabilities:string[]};language:Language }) {
  const pathname = usePathname();
  const capabilities = new Set(user?.capabilities ?? []);
  const visibleNavigation = navigation
    .map(group => ({ ...group, items: group.items.filter(item =>
      Array.isArray(item.capability)
        ? item.capability.some(capability => capabilities.has(capability))
        : capabilities.has(item.capability),
    ) }))
    .filter(group => group.items.length);

  return (
    <div className="flex h-full min-h-0 flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border px-4">
        <Link href="/" onClick={onNavigate} className="flex h-16 w-[92px] shrink-0 items-center" aria-label="DIVU dashboard">
          <Image
            src="/assets/divu-auth-logo.png"
            alt="DIVU"
            width={120}
            height={68}
            priority
            className="h-[58px] w-[92px] object-contain dark:hidden"
          />
          <Image
            src="/assets/divu-auth-logo-white.png"
            alt=""
            width={120}
            height={68}
            priority
            aria-hidden="true"
            className="hidden h-[58px] w-[92px] object-contain dark:block"
          />
        </Link>
          <span className="whitespace-nowrap leading-none">
            <strong className="block text-[13px] tracking-tight">DIVU Analytics</strong>
            <span className="mt-1 block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Industrial IoT</span>
          </span>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-4" aria-label="Platform navigation">
        <div className="space-y-5">
          {visibleNavigation.map((group) => (
            <div key={group.label || "dashboard"}>
              {group.label && <p className="mb-1.5 px-3 font-mono text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">{translations[language][group.label]??group.label}</p>}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActivePath(pathname, item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      prefetch={true}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex min-h-9 items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors",
                        active
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      <Icon className="size-4 shrink-0" />
                      <span>{translations[language][item.label]??item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>

      <div className="shrink-0 border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-lg border border-sidebar-border bg-background/60 p-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">
            {user?.username?.[0]?.toUpperCase()??"?"}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-semibold">{user?.username??"Loading…"}</span>
            <span className="block truncate text-[11px] text-muted-foreground">{user?.displayRole??"Authenticated user"}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

export function PlatformShell({ children }: { children: React.ReactNode }) {
  const access = useAccess();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const closeNotifications = useCallback(() => setNotificationsOpen(false), []);
  const [accountOpen, setAccountOpen] = useState(false);
  const [accessibilityOpen,setAccessibilityOpen]=useState(false);
  const [language,setLanguage]=useState<Language>("en");
  const [reducedMotion,setReducedMotion]=useState(false);
  const [increasedContrast,setIncreasedContrast]=useState(false);
  const [largeText,setLargeText]=useState(false);
  const [notifications,setNotifications]=useState<CanonicalNotificationDto[]>([]);
  const [notificationError,setNotificationError]=useState("");
  const sessionUser = access.user;
  const rawPageTitle = pageTitles.get(pathname) ?? "DIVU Analytics";
  const pageTitle = translations[language][rawPageTitle]??rawPageTitle;
  const unreadCount = notifications.filter(item=>!item.readAtUtc).length;

  useEffect(() => {
    const openNotifications = () => setNotificationsOpen(true);
    window.addEventListener("divu-open-notifications", openNotifications);
    return () => window.removeEventListener("divu-open-notifications", openNotifications);
  }, []);
  useEffect(() => {
    const showNotification = (event: Event) => {
      const detail = (event as CustomEvent<PlatformNotificationDetail>).detail;
      if (!detail) return;
      setNotifications(current => [{
        notificationId: -Date.now(),
        notificationType: "warning",
        title: detail.title,
        message: detail.message,
        recipientUserId: sessionUser?.uid ?? 0,
        actorUserId: null,
        actorUsername: null,
        targetType: null,
        targetId: null,
        facilityId: null,
        action: null,
        severity: "warning",
        route: pathname,
        correlationId: null,
        createdAtUtc: new Date().toISOString(),
        readAtUtc: null,
      }, ...current]);
      setNotificationsOpen(true);
    };
    window.addEventListener("divu-platform-notification", showNotification);
    return () => window.removeEventListener("divu-platform-notification", showNotification);
  }, [pathname, sessionUser?.uid]);
  useEffect(()=>{
    const stored=(localStorage.getItem("divu-language")||"en") as Language;
    const motion=localStorage.getItem("divu-reduced-motion")==="true";
    const contrast=localStorage.getItem("divu-increased-contrast")==="true";
    const text=localStorage.getItem("divu-large-text")==="true";
    const frame=requestAnimationFrame(()=>{if(stored in languageNames)setLanguage(stored);setReducedMotion(motion);setIncreasedContrast(contrast);setLargeText(text)});
    document.documentElement.classList.toggle("reduce-motion",motion);
    document.documentElement.classList.toggle("increase-contrast",contrast);
    document.documentElement.classList.toggle("large-interface-text",text);
    apiRequest<unknown>("/api/backend/notifications")
      .then(payload=>setNotifications(normalizeNotifications(payload)))
      .catch(cause=>{setNotifications([]);setNotificationError(cause instanceof Error?cause.message:"Notifications are unavailable.")});
    return()=>cancelAnimationFrame(frame);
  },[]);
  function chooseLanguage(value:Language){
    setLanguage(value);localStorage.setItem("divu-language",value);document.documentElement.lang=value;
    void apiRequest("/api/backend/profile",{method:"PATCH",body:JSON.stringify({language:value})}).catch(()=>undefined);
  }
  function setAccessPreference(key:"motion"|"contrast"|"text",value:boolean){
    const names={motion:["divu-reduced-motion","reduce-motion"],contrast:["divu-increased-contrast","increase-contrast"],text:["divu-large-text","large-interface-text"]} as const;
    localStorage.setItem(names[key][0],String(value));document.documentElement.classList.toggle(names[key][1],value);
    if(key==="motion")setReducedMotion(value);if(key==="contrast")setIncreasedContrast(value);if(key==="text")setLargeText(value);
  }

  return (
    <div className="flex h-dvh min-h-[36rem] overflow-hidden bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-card focus:px-4 focus:py-3 focus:text-foreground focus:shadow-[var(--dv-shadow-m)]"
      >
        Skip to main content
      </a>
      <aside className="hidden w-64 shrink-0 border-r border-sidebar-border lg:block">
        <SidebarContent user={sessionUser} language={language}/>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 cursor-default bg-slate-950/50 backdrop-blur-sm"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative h-full w-[min(20rem,88vw)] border-r border-sidebar-border shadow-2xl">
            <SidebarContent user={sessionUser} language={language} onNavigate={() => setMobileOpen(false)} />
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-3 grid size-9 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Close navigation"
            >
              <X className="size-5" />
            </button>
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between border-b bg-[var(--dv-header)] px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="grid size-9 shrink-0 place-items-center rounded-lg border bg-card text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
              aria-label="Open navigation"
            >
              <Menu className="size-5" />
            </button>
            <div className="min-w-0">
              <p className="truncate text-base font-semibold sm:text-lg">{pageTitle}</p>
              <p className="hidden text-xs text-muted-foreground sm:block">
                Secure-by-design industrial analytics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setNotificationsOpen(true)}
              className="relative grid size-9 place-items-center rounded-lg border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label={notificationError?`Notifications unavailable: ${notificationError}`:`${translations[language].Notifications}, ${unreadCount} unread`}
            >
              <Bell className="size-4" />
              {unreadCount > 0 && <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full border-2 border-[var(--dv-header)] bg-primary px-1 font-mono text-xs font-bold leading-none text-primary-foreground shadow-sm">{unreadCount}</span>}
            </button>
            <div className="relative">
              <button
                type="button"
                onClick={() => setAccountOpen((value) => !value)}
                aria-expanded={accountOpen}
                aria-haspopup="menu"
                className="flex h-9 items-center gap-2 rounded-lg border bg-card px-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Open account menu"
              >
                <CircleUserRound className="size-4" />
                <span className="hidden max-w-28 truncate text-xs font-semibold sm:block">{sessionUser?.username ?? "Account"}</span>
                <ChevronDown className="size-3.5" />
              </button>
              {accountOpen && <div role="menu" className="absolute right-0 top-11 z-40 w-56 rounded-xl border bg-card p-2 shadow-[var(--dv-shadow-m)]">
                <div className="border-b px-3 py-2">
                  <p className="truncate text-xs font-semibold">{sessionUser?.username ?? "Authenticated user"}</p>
                  <p className="truncate text-xs text-muted-foreground">{sessionUser?.displayRole}</p>
                </div>
                <button type="button" role="menuitem" onClick={() => { setAccountOpen(false); setNotificationsOpen(true); }} className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs hover:bg-muted">
                  <Bell className="size-4" /> {translations[language].Notifications}
                  {unreadCount > 0 && <span className="ml-auto rounded-full bg-primary px-1.5 text-xs text-primary-foreground">{unreadCount}</span>}
                </button>
                <Link role="menuitem" href="/profile" onClick={() => setAccountOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs hover:bg-muted">
                  <CircleUserRound className="size-4" /> {translations[language].Profile}
                </Link>
                <label className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs">
                  <Languages className="size-4"/><span className="sr-only">Language</span>
                  <select aria-label="Interface language" value={language} onChange={event=>chooseLanguage(event.target.value as Language)} className="min-w-0 flex-1 bg-transparent">
                    {(Object.keys(languageNames) as Language[]).map(code=><option key={code} value={code}>{languageNames[code]}</option>)}
                  </select>
                </label>
                <button type="button" role="menuitem" onClick={()=>setAccessibilityOpen(value=>!value)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs hover:bg-muted"><Accessibility className="size-4"/>{translations[language].Accessibility}</button>
                {accessibilityOpen&&<fieldset className="m-1 space-y-2 rounded-lg border p-3"><legend className="px-1 text-xs font-semibold">Accessibility</legend>
                  {[["Reduced motion",reducedMotion,(value:boolean)=>setAccessPreference("motion",value)],["Increased contrast",increasedContrast,(value:boolean)=>setAccessPreference("contrast",value)],["Larger interface text",largeText,(value:boolean)=>setAccessPreference("text",value)]].map(([label,checked,change])=><label key={String(label)} className="flex items-center gap-2 text-xs"><input type="checkbox" checked={Boolean(checked)} onChange={event=>(change as (value:boolean)=>void)(event.target.checked)}/>{String(label)}</label>)}
                </fieldset>}
              </div>}
            </div>
          </div>
        </header>

        <main id="main-content" tabIndex={-1} className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-[96rem]">{children}</div>
        </main>
      </div>
      <NotificationDrawer open={notificationsOpen} onClose={closeNotifications} onChange={setNotifications} />
    </div>
  );
}
