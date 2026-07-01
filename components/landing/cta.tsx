import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";

import { BentoCard } from "@/components/ui/bento-card";
import { buttonClasses } from "@/components/ui/button";

export function Cta({ loggedIn }: { loggedIn: boolean }) {
  return (
    <BentoCard variant="inverted" className="relative overflow-hidden p-10 sm:p-16">
      <div
        className="pointer-events-none absolute -bottom-32 left-1/2 -translate-x-1/2 w-[40rem] h-[40rem] rounded-full opacity-50"
        style={{
          background:
            "radial-gradient(circle, rgba(16,185,129,0.18) 0%, rgba(16,185,129,0) 60%)",
        }}
      />
      <div className="relative flex flex-col items-center text-center">
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.05] max-w-3xl">
          Open your guild treasury.
        </h2>
        <p className="mt-5 max-w-lg text-base sm:text-lg font-medium text-white/60 leading-relaxed">
          Pass KYB, fund your treasury, and pay your first player — all on real rails, in minutes.
        </p>
        <div className="mt-8">
          {loggedIn ? (
            <Link href="/dashboard" className={buttonClasses({ variant: "accent", size: "lg" })}>
              Go to dashboard
              <HugeiconsIcon icon={ArrowRight01Icon} size={16} strokeWidth={2} />
            </Link>
          ) : (
            <Link href="/onboard" className={buttonClasses({ variant: "accent", size: "lg" })}>
              Get started
              <HugeiconsIcon icon={ArrowRight01Icon} size={16} strokeWidth={2} />
            </Link>
          )}
        </div>
      </div>
    </BentoCard>
  );
}
