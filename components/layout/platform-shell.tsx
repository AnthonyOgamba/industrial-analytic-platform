"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Activity,
  BarChart3,
  Bell,
  ChevronDown,
  CircleUserRound,
  ClipboardList,
  Cpu,
  Database,
  DollarSign,
  FileClock,
  FileText,
  LayoutDashboard,
  Menu,
  Moon,
  Radio,
  Settings,
  Settings2,
  ShieldCheck,
  ShieldEllipsis,
  ShieldUser,
  Sun,
  Users,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";

type NavigationItem = {
  label: string;
  href: string;
  icon: React.ElementType;
};

type NavigationGroup = {
  label: string;
  items: NavigationItem[];
};

const navigation: NavigationGroup[] = [
  {
    label: "Workspace",
    items: [
      { label: "Dashboard", href: "/", icon: LayoutDashboard },
    ],
  },
  {
    label: "Data",
    items: [
      { label: "Data Input", href: "/data-input", icon: Database },
      { label: "Data Governance", href: "/governance", icon: ShieldCheck },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Facilities", href: "/operations", icon: Settings2 },
      { label: "Assets", href: "/assets", icon: Cpu },
      { label: "Sensors", href: "/sensors", icon: Radio },
      { label: "Downtime", href: "/downtime", icon: FileClock },
    ],
  },
  {
    label: "Analytics",
    items: [
      { label: "Financial", href: "/financial", icon: DollarSign },
      { label: "Reports", href: "/reports", icon: FileText },
    ],
  },
  {
    label: "Administration",
    items: [
      { label: "Users", href: "/users", icon: Users },
      { label: "Roles", href: "/roles", icon: ShieldUser },
      { label: "Activity", href: "/activity", icon: Activity },
    ],
  },
  {
    label: "Security Center",
    items: [
      { label: "Security Operations", href: "/security-ops", icon: ShieldEllipsis },
      { label: "API Security", href: "/api-security", icon: BarChart3 },
      { label: "Audit Log", href: "/audit", icon: ClipboardList },
    ],
  },
];

const pageTitles = new Map(
  navigation.flatMap((group) => group.items.map((item) => [item.href, item.label])),
);
pageTitles.set("/settings", "Settings");
pageTitles.set("/profile", "Profile");

function isActivePath(pathname: string, href: string) {
  return href === "/"
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
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

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full min-h-0 flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-sidebar-border px-5">
        <Image src="/assets/divu-logo.png" alt="DIVU" width={38} height={31} priority />
        <div className="min-w-0">
          <p className="truncate text-sm font-bold tracking-tight">DIVU Analytics</p>
          <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
            Industrial IoT
          </p>
        </div>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-4" aria-label="Platform navigation">
        <div className="space-y-5">
          {navigation.map((group) => (
            <div key={group.label}>
              <p className="mb-1.5 px-3 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{group.label}</p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActivePath(pathname, item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
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
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>

      <div className="shrink-0 border-t border-sidebar-border p-3">
        <Link
          href="/settings"
          onClick={onNavigate}
          className={cn(
            "mb-2 flex min-h-9 items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors",
            isActivePath(pathname, "/settings")
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          <Settings className="size-4" />
          Settings
        </Link>

        <Link
          href="/profile"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-lg border border-sidebar-border bg-background/60 p-3 transition-colors hover:bg-muted"
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">
            A
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-semibold">Admin User</span>
            <span className="block truncate text-[11px] text-muted-foreground">Administrator</span>
          </span>
          <ChevronDown className="size-4 text-muted-foreground" />
        </Link>
      </div>
    </div>
  );
}

export function PlatformShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pageTitle = pageTitles.get(pathname) ?? "DIVU Analytics";

  return (
    <div className="flex h-dvh min-h-[36rem] overflow-hidden bg-background">
      <aside className="hidden w-64 shrink-0 border-r border-sidebar-border lg:block">
        <SidebarContent />
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
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
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
              className="relative grid size-9 place-items-center rounded-lg border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Notifications"
            >
              <Bell className="size-4" />
              <span className="absolute right-2 top-2 size-1.5 rounded-full bg-destructive" />
            </button>
            <Link
              href="/profile"
              className="hidden size-9 place-items-center rounded-lg border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:grid"
              aria-label="Open profile"
            >
              <CircleUserRound className="size-4" />
            </Link>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-[96rem]">{children}</div>
        </main>
      </div>
    </div>
  );
}
