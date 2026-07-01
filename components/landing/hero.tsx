import Image from "next/image";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, CheckmarkBadge01Icon } from "@hugeicons/core-free-icons";

import { BentoCard } from "@/components/ui/bento-card";
import { buttonClasses } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { Nav } from "./nav";

export function Hero({ loggedIn }: { loggedIn: boolean }) {
  return (
    <BentoCard className="relative overflow-hidden p-6 sm:p-10">
      {/* Decorative background — dot grid + soft color washes (no assets). */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(15,23,42,0.07) 1px, transparent 0)",
            backgroundSize: "22px 22px",
            maskImage:
              "radial-gradient(ellipse 60% 50% at 50% 28%, black 30%, transparent 70%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 60% 50% at 50% 28%, black 30%, transparent 70%)",
          }}
        />
        <div
          className="absolute -top-40 -left-32 w-[34rem] h-[34rem] rounded-full opacity-50"
          style={{
            background:
              "radial-gradient(circle, rgba(16,185,129,0.16) 0%, rgba(16,185,129,0) 60%)",
          }}
        />
        <div
          className="absolute -top-40 -right-32 w-[34rem] h-[34rem] rounded-full opacity-45"
          style={{
            background:
              "radial-gradient(circle, rgba(139,92,246,0.14) 0%, rgba(139,92,246,0) 60%)",
          }}
        />
      </div>

      <div className="relative">
        <Nav loggedIn={loggedIn} />

        <div className="mt-16 sm:mt-24 flex flex-col items-center text-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full bg-white border border-gray-200/70 px-3 py-1 text-xs font-medium text-zinc-700 shadow-[inset_0_1px_0_0_rgba(255,255,255,1),0_2px_8px_-2px_rgba(0,0,0,0.04)]">
              <HugeiconsIcon icon={CheckmarkBadge01Icon} size={13} strokeWidth={2.2} className="text-emerald-600" />
              On Dakota&rsquo;s real sandbox rails
            </span>
            <h1 className="mt-6 text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight text-zinc-900 leading-[1.02] max-w-4xl">
              The neobank for
              <br className="hidden sm:block" /> esports guilds.
            </h1>
            <p className="mt-6 max-w-xl mx-auto text-base sm:text-lg font-medium text-gray-500 leading-relaxed">
              Pass KYB once, fund a treasury with sponsor and prize money, hold USD and USDC,
              and pay your players — every transfer settling on real rails, not a mock.
            </p>
          </Reveal>

          <Reveal delay={160}>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {loggedIn ? (
                <Link href="/dashboard" className={buttonClasses({ variant: "primary", size: "lg" })}>
                  Go to dashboard
                  <HugeiconsIcon icon={ArrowRight01Icon} size={16} strokeWidth={2} />
                </Link>
              ) : (
                <>
                  <Link href="/onboard" className={buttonClasses({ variant: "primary", size: "lg" })}>
                    Get started
                    <HugeiconsIcon icon={ArrowRight01Icon} size={16} strokeWidth={2} />
                  </Link>
                  <Link href="/login" className={buttonClasses({ variant: "secondary", size: "lg" })}>
                    Log in
                  </Link>
                </>
              )}
            </div>
          </Reveal>
        </div>

        {/* Product preview — the real dashboard. */}
        <Reveal delay={260}>
          <div className="mt-12 sm:mt-16">
            <div className="relative rounded-[1.75rem] overflow-hidden border border-gray-100 bg-white shadow-[inset_0_1px_0_0_rgba(255,255,255,1),0_30px_80px_-30px_rgba(0,0,0,0.28)]">
              <Image
                src="/dashboard.png"
                alt="Guildpay treasury dashboard — USD + USDC balance and a completed player payout"
                width={2880}
                height={1826}
                className="w-full h-auto"
                priority
              />
              <div className="pointer-events-none absolute inset-0 rounded-[1.75rem] ring-1 ring-inset ring-black/[0.03]" />
            </div>
          </div>
        </Reveal>
      </div>
    </BentoCard>
  );
}
