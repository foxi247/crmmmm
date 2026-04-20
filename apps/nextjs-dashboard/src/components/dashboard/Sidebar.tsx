"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  MessageSquare,
  Settings,
  Plug,
  Bot,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/orders", label: "Orders", icon: ShoppingCart },
  { href: "/dashboard/catalog", label: "Catalog", icon: Package },
  { href: "/dashboard/customers", label: "Customers", icon: Users },
  { href: "/dashboard/chat", label: "Chat Sessions", icon: MessageSquare },
  { href: "/dashboard/bot-config", label: "Bot Config", icon: Bot },
  { href: "/dashboard/integrations", label: "Integrations", icon: Plug },
];

const bottomItems = [
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  function isActive(href: string, exact?: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  return (
    <aside className="w-60 flex flex-col bg-sidebar-bg border-r border-sidebar-border shrink-0">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm shrink-0">
          F
        </div>
        <span className="text-white font-bold text-base tracking-tight">FoxAi</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        <p className="text-xs font-semibold text-white/25 uppercase tracking-widest px-3 mb-2">
          Main
        </p>
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                active
                  ? "bg-primary text-white"
                  : "text-sidebar-fg hover:bg-white/8 hover:text-white"
              )}
            >
              <span className="flex items-center gap-3">
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </span>
              {active && <ChevronRight className="h-3 w-3 opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 space-y-0.5 border-t border-sidebar-border pt-3">
        {bottomItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
              isActive(href)
                ? "bg-primary text-white"
                : "text-sidebar-fg hover:bg-white/8 hover:text-white"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        ))}
      </div>
    </aside>
  );
}
