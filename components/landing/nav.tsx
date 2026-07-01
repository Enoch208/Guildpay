import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";

import { buttonClasses } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { MobileNav } from "@/components/ui/mobile-nav";

const navItems = [
  { label: "How it works", href: "#how" },
  { label: "Features", href: "#features" },
  { label: "Security", href: "#security" },
  { label: "FAQ", href: "#faq" },
];

export function Nav({ loggedIn }: { loggedIn: boolean }) {
  return (
    <header className="flex items-center justify-between gap-6">
      <Link href="/" className="cursor-pointer" aria-label="Guildpay home">
        <Logo name="Guildpay" />
      </Link>

      <nav className="hidden md:flex items-center gap-7">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="cursor-pointer text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="hidden md:flex items-center gap-2">
        {loggedIn ? (
          <Link href="/dashboard" className={buttonClasses({ variant: "primary", size: "sm" })}>
            Go to dashboard
            <HugeiconsIcon icon={ArrowRight01Icon} size={14} strokeWidth={2} />
          </Link>
        ) : (
          <>
            <Link href="/login" className={buttonClasses({ variant: "secondary", size: "sm" })}>
              Log in
            </Link>
            <Link href="/onboard" className={buttonClasses({ variant: "primary", size: "sm" })}>
              Get started
            </Link>
          </>
        )}
      </div>

      <div className="flex md:hidden items-center gap-2">
        <Link
          href={loggedIn ? "/dashboard" : "/onboard"}
          className={buttonClasses({ variant: "primary", size: "sm" })}
        >
          {loggedIn ? "Dashboard" : "Get started"}
        </Link>
        <MobileNav items={navItems} />
      </div>
    </header>
  );
}
