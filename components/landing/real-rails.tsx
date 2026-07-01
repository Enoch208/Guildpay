import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkCircle01Icon } from "@hugeicons/core-free-icons";

import { BentoCard } from "@/components/ui/bento-card";

const rows = [
  { k: "KYB onboarding", v: "customers.create → simulateOnboarding → kyb_status active" },
  { k: "Deposit", v: "USD ACH on-ramp → ach_inbound settles USD to USDC" },
  { k: "Balance", v: "ledger-tracked, each entry backed by a real Dakota transaction" },
  { k: "Player payout", v: "one-off USDC → USD ACH transfer, funded and settled to completed" },
];

export function RealRails() {
  return (
    <BentoCard id="rails" variant="inverted" className="p-6 sm:p-10 scroll-mt-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-8 items-center">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs font-medium text-white/70">
            Not a mock
          </span>
          <h2 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.05]">
            Every transfer settles
            <br />
            on real rails.
          </h2>
          <p className="mt-5 max-w-md text-base sm:text-lg font-medium text-white/60 leading-relaxed">
            KYB, deposits, and payouts all run on Dakota&rsquo;s live sandbox — real business
            verification, real ACH settlement, real stablecoin. The balance is a ledger of
            genuine transactions, so what you see is what actually happened.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {rows.map((r) => (
            <div
              key={r.k}
              className="rounded-[1.25rem] bg-white/[0.04] border border-white/10 px-5 py-4 flex items-start gap-3"
            >
              <HugeiconsIcon
                icon={CheckmarkCircle01Icon}
                size={18}
                strokeWidth={2}
                className="mt-0.5 shrink-0 text-emerald-400"
              />
              <div className="min-w-0">
                <div className="text-sm font-semibold tracking-tight text-white">{r.k}</div>
                <div className="mt-0.5 text-[13px] font-medium text-white/50 leading-snug break-words">
                  {r.v}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </BentoCard>
  );
}
