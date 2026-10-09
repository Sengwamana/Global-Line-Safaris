"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/Logo";
import { useCurrentUserRole } from "@/components/admin/useCurrentUserRole";
import {
  LayoutDashboard,
  MessageSquare,
  Briefcase,
  Users,
  Building2,
  HelpCircle,
  Image,
  Globe,
  Search,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  UserCog,
  ShieldCheck,
  Bell,
  Map,
  Package,
  Navigation,
  Newspaper,
  Mail,
  GraduationCap,
} from "lucide-react";

const navGroups = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Leads",
    items: [
      { label: "Inquiries", href: "/admin/inquiries", icon: MessageSquare },
      { label: "All Inquiries", href: "/admin/all-inquiries", icon: MessageSquare },
      { label: "Trip Inquiries", href: "/admin/trip-inquiries", icon: Navigation },
      { label: "Internships", href: "/admin/internship-inquiries", icon: GraduationCap },
      { label: "Subscribers", href: "/admin/subscribers", icon: Mail },
    ],
  },
  {
    label: "Content",
    items: [
      { label: "Destinations", href: "/admin/destinations", icon: Map },
      { label: "Tour Packages", href: "/admin/tour-packages", icon: Package },
      { label: "Services", href: "/admin/services", icon: Briefcase },
      { label: "Team", href: "/admin/team", icon: Users },
      { label: "Industries", href: "/admin/industries", icon: Building2 },
      { label: "FAQs", href: "/admin/faqs", icon: HelpCircle },
      { label: "Blog Posts", href: "/admin/blog-posts", icon: Newspaper },
    ],
  },
  {
    label: "Site",
    items: [
      { label: "Homepage", href: "/admin/homepage", icon: Globe },
      { label: "Media", href: "/admin/media", icon: Image },
      { label: "SEO", href: "/admin/seo", icon: Search },
      { label: "Basic Information", href: "/admin/settings", icon: Settings },
      { label: "Site Images", href: "/admin/site-images", icon: Image },
    ],
  },
  {
    label: "System",
    items: [
      // Listing users and reading the audit trail both require ADMIN+.
      { label: "Users", href: "/admin/users", icon: UserCog, minRole: "ADMIN" as const },
      { label: "Audit Logs", href: "/admin/audit-logs", icon: ShieldCheck, minRole: "ADMIN" as const },
      { label: "Notifications", href: "/admin/notifications", icon: Bell },
    ],
  },
];

interface AdminSidebarProps {
  mobileOpen: boolean;
  onNavigate: () => void;
  collapsed: boolean;
  onToggle: () => void;
}

export function AdminSidebar({ collapsed, onToggle, mobileOpen, onNavigate }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const { atLeast } = useCurrentUserRole();

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await fetch("/api/auth/signout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch {
      setSigningOut(false);
    }
  };

  return (
    <aside id="admin-navigation"
      onKeyDown={(event) => { if (event.key === "Escape") onNavigate(); }}
      className={cn(
        "admin-sidebar fixed left-0 top-0 z-40 flex h-screen flex-col border-r bg-white transition-all duration-300 dark:bg-slate-950/95",
        collapsed ? "w-[68px]" : "w-60",
        mobileOpen && "admin-sidebar-open",
        "border-slate-200/60 dark:border-slate-800/60",
        collapsed ? "admin-sidebar-no-shadow" : "admin-sidebar-shadow"
      )}
    >
      <div className="flex h-14 items-center justify-between border-b border-slate-100 px-3 dark:border-slate-800/50">
        <div className="admin-sidebar-brand"><Logo href="/admin/dashboard" size="sm" showWordmark={false} /></div>
        <button
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={onToggle}
          className="admin-collapse-button flex h-7 w-7 items-center justify-center rounded-lg text-slate-300 hover:bg-slate-100 hover:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors"
        >
          {collapsed ? <ChevronRight className="size-3.5" /> : <ChevronLeft className="size-3.5" />}
        </button>
      </div>

      <nav aria-label="Administration" onClick={onNavigate} className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-5">
        {navGroups.map((group) => {
          const visibleItems = group.items.filter(
            (item) => !item.minRole || atLeast(item.minRole)
          );
          if (visibleItems.length === 0) return null;
          return (
          <div key={group.label}>
            {!collapsed && (
              <p className="px-2.5 mb-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {visibleItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-200",
                      collapsed ? "justify-center px-0 py-2.5" : "px-2.5 py-2",
                      active
                        ? "bg-gradient-to-r from-brand/10 to-transparent text-brand dark:from-brand/15"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200"
                    )}
                    aria-current={active ? "page" : undefined}
                    aria-label={item.label}
                    title={collapsed ? item.label : undefined}
                  >
                    <div className="relative">
                      <Icon className={cn("size-[18px] shrink-0", active && "drop-shadow-sm")} />
                    </div>
                    {!collapsed && <span>{item.label}</span>}
                    {!collapsed && active && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
          );
        })}
      </nav>

      <div className="border-t border-slate-100 p-2 space-y-1 dark:border-slate-800/50">
        <Link
          aria-label="View website"
          href="/"
          className={cn(
            "flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium text-slate-400 hover:bg-slate-50 hover:text-slate-600 dark:hover:bg-slate-800/50 dark:hover:text-slate-300 transition-all",
            collapsed && "justify-center px-0 py-2.5"
          )}
        >
          <Globe className="size-[18px] shrink-0" />
          {!collapsed && <span>View Site</span>}
        </Link>
        <button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all disabled:opacity-50",
            collapsed && "justify-center px-0 py-2.5"
          )}
          title={collapsed ? "Sign Out" : undefined}
        >
          <LogOut className="size-[18px] shrink-0" />
          {!collapsed && <span>{signingOut ? "Signing out..." : "Sign Out"}</span>}
        </button>
      </div>
    </aside>
  );
}
