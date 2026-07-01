import { HugeiconsIcon } from "@hugeicons/react";
import {
  ShieldKeyIcon,
  Wallet01Icon,
  SentIcon,
  JusticeScale01Icon,
  ArrowDataTransferHorizontalIcon,
  ReceiptDollarIcon,
} from "@hugeicons/core-free-icons";

import { BentoCard, BentoCardTitle } from "@/components/ui/bento-card";
import { IconWrapper } from "@/components/ui/icon-wrapper";

const features = [
  {
    icon: ShieldKeyIcon,
    tone: "emerald" as const,
    title: "KYB-gated onboarding",
    body: "A guild becomes a verified business customer. Nothing moves until KYB is active.",
  },
  {
    icon: Wallet01Icon,
    tone: "violet" as const,
    title: "USD + USDC treasury",
    body: "One treasury holds both. Sponsor deposits settle on-chain; the balance is always current.",
  },
  {
    icon: SentIcon,
    tone: "amber" as const,
    title: "One-click player payouts",
    body: "Pay a player as a USDC → USD ACH transfer that settles to completed — no wallet signing.",
  },
  {
    icon: JusticeScale01Icon,
    tone: "sky" as const,
    title: "In-line compliance gate",
    body: "An amount-threshold policy runs before a payout hits the rails — flag, block, or allow.",
  },
  {
    icon: ArrowDataTransferHorizontalIcon,
    tone: "rose" as const,
    title: "USD ⇄ USDC rails",
    body: "Receive USD over ACH, hold stablecoin, and pay out to any US bank — the rails handle the conversion.",
  },
  {
    icon: ReceiptDollarIcon,
    tone: "neutral" as const,
    title: "Reconciled activity feed",
    body: "Every entry is backed by a real Dakota transaction, and pending payouts self-heal to their true status.",
  },
];

export function Features() {
  return (
    <BentoCard id="features" className="p-6 sm:p-10 scroll-mt-6">
      <div className="max-w-2xl mb-10">
        <BentoCardTitle className="text-4xl sm:text-5xl lg:text-6xl leading-[1.05]">
          Everything a guild
          <br />
          treasury needs.
        </BentoCardTitle>
        <p className="mt-5 text-base sm:text-lg font-medium text-gray-500 leading-relaxed">
          Purpose-built for how esports teams actually move money — sponsor funds in, player
          payouts out, with compliance and provenance in the middle.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {features.map((f) => (
          <div
            key={f.title}
            className="rounded-[1.5rem] bg-white border border-gray-100 p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_40px_rgb(0,0,0,0.05)]"
          >
            <IconWrapper size="lg" tone={f.tone}>
              <HugeiconsIcon icon={f.icon} size={22} strokeWidth={2} />
            </IconWrapper>
            <h3 className="mt-5 text-lg font-semibold tracking-tight text-zinc-900">{f.title}</h3>
            <p className="mt-2 text-sm font-medium text-gray-500 leading-relaxed">{f.body}</p>
          </div>
        ))}
      </div>
    </BentoCard>
  );
}
