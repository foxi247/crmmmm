"use client";

import { signOut } from "next-auth/react";
import type { User } from "next-auth";
import { LogOut, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface TopBarProps {
  user: User | undefined;
}

export function TopBar({ user }: TopBarProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : user?.email?.[0].toUpperCase() ?? "?";

  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-6">
      <div />

      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2.5 rounded-lg px-3 py-1.5 hover:bg-secondary transition-colors text-sm"
        >
          <div className="w-7 h-7 rounded-full bg-primary/15 text-primary font-bold text-xs flex items-center justify-center">
            {initials}
          </div>
          <span className="text-foreground font-medium max-w-[180px] truncate">
            {user?.name ?? user?.email}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-1 w-52 bg-card border border-border rounded-xl shadow-card-hover z-50 py-1">
            <div className="px-3 py-2 border-b border-border">
              <p className="text-xs font-medium text-foreground truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/5 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
