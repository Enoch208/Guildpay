import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkBadge01Icon,
  ArrowDownLeft01Icon,
  Coins01Icon,
  SentIcon,
} from "@hugeicons/core-free-icons";

import { BentoCard } from "@/components/ui/bento-card";
import { IconWrapper } from "@/components/ui/icon-wrapper";

const steps = [
  {
    icon: CheckmarkBadge01Icon,
    tone: "emerald" as const,
    title: "Onboard the guild",
    body: "Submit your business details. KYB runs and your guild is driven to active — the gate for everything else.",
  },
  {
    icon: ArrowDownLeft01Icon,
    tone: "sky" as const,
    title: "Fund the treasury",
    body: "Sponsor and prize money arrives over a USD ACH on-ramp and settles to USDC in your treasury.",
  },
  {
    icon: Coins01Icon,
    tone: "violet" as const,
    title: "Hold USD + USDC",
    body: "One treasury, both rails. Watch a live balance and a reconciled activity feed of every movement.",
  },
  {
    icon: SentIcon,
    tone: "amber" as const,
    title: "Pay your players",
    body: "Send a player their winnings as a USDC → USD ACH payout and watch it settle to completed.",
  },
];

export function HowItWorks() {
  return (
    <BentoCard id="how" className="p-6 sm:p-10 scroll-mt-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10 items-end">
        <h2 className="lg:col-span-7 text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-zinc-900 leading-[1.05]">
          From signup to payout,
          <br />
          in one flow.
        </h2>
        <p className="lg:col-span-5 text-sm sm:text-base font-medium text-gray-500 leading-relaxed max-w-md">
          The polished product flow and the real money flow are the same flow — nothing is
          faked, and nothing moves until KYB clears.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {steps.map((s, i) => (
          <div
            key={s.title}
            className="group relative rounded-[1.5rem] bg-[#F3F4F6] border border-gray-100/80 p-6 transition-all duration-300 hover:bg-white hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
          >
            <div className="flex items-center justify-between mb-5">
              <IconWrapper size="lg" tone={s.tone}>
                <HugeiconsIcon icon={s.icon} size={22} strokeWidth={2} />
              </IconWrapper>
              <span className="text-sm font-semibold tracking-[0.14em] text-gray-300 group-hover:text-gray-400 transition-colors">
                0{i + 1}
              </span>
            </div>
            <h3 className="text-lg font-semibold tracking-tight text-zinc-900">{s.title}</h3>
            <p className="mt-2 text-sm font-medium text-gray-500 leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>
    </BentoCard>
  );
}
