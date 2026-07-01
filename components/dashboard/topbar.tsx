"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Notification01Icon,
  UserIcon,
  ArrowDown01Icon,
  Logout02Icon,
} from "@hugeicons/core-free-icons";

import { cn } from "@/lib/utils";
import { MobileNav } from "@/components/ui/mobile-nav";
import { PRIMARY_NAV } from "./nav-items";

type TopbarProps = {
  title: string;
  guildName: string;
  email?: string;
};

export function Topbar({ title, guildName, email }: TopbarProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [loggingOut, setLoggingOut] = React.useState(false);
  const ref = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function logout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="flex items-center justify-between gap-3 sm:gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className="lg:hidden">
          <MobileNav items={PRIMARY_NAV.map((i) => ({ label: i.label, href: i.href }))} />
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-zinc-900 truncate">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <button
          type="button"
          aria-label="Notifications"
          className="cursor-pointer relative hidden sm:inline-flex items-center justify-center w-10 h-10 rounded-full bg-white border border-gray-100 text-zinc-700 shadow-[inset_0_1px_0_0_rgba(255,255,255,1),0_2px_10px_rgba(0,0,0,0.02)] hover:bg-gray-50 transition-colors"
        >
          <HugeiconsIcon icon={Notification01Icon} size={18} strokeWidth={2} />
          <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
        </button>

        <div ref={ref} className="relative">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-haspopup="menu"
            aria-expanded={open}
            className={cn(
              "cursor-pointer inline-flex items-center gap-2.5 rounded-full bg-white border border-gray-100 pl-1 pr-3 py-1 transition-all duration-200",
              "shadow-[inset_0_1px_0_0_rgba(255,255,255,1),0_2px_10px_rgba(0,0,0,0.02)] hover:bg-gray-50",
            )}
          >
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#09090B] text-white text-xs font-semibold shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]">
              <HugeiconsIcon icon={UserIcon} size={15} strokeWidth={2.2} />
            </span>
            <span className="hidden sm:flex flex-col items-start leading-tight">
              <span className="text-sm font-semibold tracking-tight text-zinc-900 max-w-[160px] truncate">
                {guildName}
              </span>
              <span className="text-[10px] font-medium tracking-[0.14em] uppercase text-gray-400">
                Guild
              </span>
            </span>
            <HugeiconsIcon
              icon={ArrowDown01Icon}
              size={14}
              strokeWidth={2}
              className={cn("text-gray-400 transition-transform duration-200", open && "rotate-180")}
            />
          </button>

          {open && (
            <div
              role="menu"
              className="absolute right-0 top-[calc(100%+8px)] z-50 w-64 rounded-2xl bg-white border border-gray-100 p-2 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.12)] animate-fade-up"
            >
              <div className="px-3 py-2.5 border-b border-gray-100 mb-1">
                <div className="text-sm font-semibold tracking-tight text-zinc-900 truncate">
                  {guildName}
                </div>
                {email && (
                  <div className="text-[11px] font-medium text-gray-500 truncate">{email}</div>
                )}
              </div>
              <button
                type="button"
                onClick={logout}
                disabled={loggingOut}
                className="cursor-pointer w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50 transition-colors disabled:opacity-60"
              >
                <HugeiconsIcon icon={Logout02Icon} size={15} strokeWidth={2} />
                {loggingOut ? "Logging out…" : "Log out"}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
