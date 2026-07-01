"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlusSignIcon, MinusSignIcon } from "@hugeicons/core-free-icons";

import { BentoCard } from "@/components/ui/bento-card";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "What is KYB, and why is it required?",
    a: "KYB (Know Your Business) is the verification a business completes before it can move money on regulated rails. In Guildpay the guild is the business — it can't log in, hold a balance, or pay anyone until its KYB status is active. On the sandbox this clears in seconds.",
  },
  {
    q: "Is the money real?",
    a: "It runs on Dakota's live sandbox — real business verification, real ACH settlement, and real stablecoin, without moving actual funds. Deposits genuinely settle USD → USDC and payouts genuinely reach a completed status on ACH rails.",
  },
  {
    q: "How do deposits and payouts work?",
    a: "A deposit arrives over a USD ACH on-ramp and settles to USDC in the treasury. A payout is a one-off USDC → USD ACH transfer to a player's bank account — funded and polled until it settles to completed, with no wallet signing required.",
  },
  {
    q: "Why is the balance tracked in a ledger?",
    a: "The treasury balance is computed as settled deposits minus settled payouts, where every entry is backed by a real Dakota transaction. This keeps the displayed balance honest and lets pending payouts reconcile to their true status automatically.",
  },
  {
    q: "What is Guildpay built on?",
    a: "Next.js 16 (App Router, RSC) and React 19, with the Dakota TypeScript SDK behind a server-only integration layer, iron-session for auth, and a small SQLite ledger. It's unit-tested and verified end-to-end against the sandbox.",
  },
  {
    q: "Is my API key safe?",
    a: "Yes. The Dakota API key lives only in server environment variables and never reaches the browser — every rails call is made server-side from route handlers.",
  },
];

export function Faq() {
  const [open, setOpen] = useState(0);

  return (
    <BentoCard id="faq" className="p-6 sm:p-10 scroll-mt-6">
      <h2 className="text-center text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-zinc-900 leading-[1.05] mb-10">
        Frequently asked questions
      </h2>

      <div className="max-w-3xl mx-auto space-y-3">
        {faqs.map((item, i) => {
          const expanded = open === i;
          return (
            <div
              key={item.q}
              className={cn(
                "rounded-[1.5rem] transition-all duration-300 overflow-hidden",
                expanded
                  ? "bg-[#09090B] text-white border border-white/5 shadow-[0_20px_60px_-25px_rgba(0,0,0,0.3)]"
                  : "bg-[#F3F4F6] text-zinc-900 border border-gray-100/80",
              )}
            >
              <button
                type="button"
                onClick={() => setOpen(expanded ? -1 : i)}
                className="cursor-pointer w-full flex items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-black/[0.02]"
                aria-expanded={expanded}
              >
                <span className="text-base font-semibold tracking-tight">{item.q}</span>
                <span
                  className={cn(
                    "shrink-0 flex items-center justify-center w-7 h-7 rounded-full border",
                    expanded ? "border-white/15 text-white" : "border-gray-200 text-zinc-700",
                  )}
                >
                  <HugeiconsIcon
                    icon={expanded ? MinusSignIcon : PlusSignIcon}
                    size={14}
                    strokeWidth={2.5}
                  />
                </span>
              </button>
              {expanded && (
                <div className="px-6 pb-6 -mt-1 text-sm font-medium leading-relaxed text-zinc-300 max-w-2xl animate-fade-up">
                  {item.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </BentoCard>
  );
}
