import { HugeiconsIcon } from "@hugeicons/react";
import {
  ShieldKeyIcon,
  SquareLock02Icon,
  JusticeScale01Icon,
  LockKeyIcon,
} from "@hugeicons/core-free-icons";

import { BentoCard } from "@/components/ui/bento-card";
import { IconWrapper } from "@/components/ui/icon-wrapper";

const items = [
  {
    icon: ShieldKeyIcon,
    tone: "emerald" as const,
    title: "KYB-gated access",
    body: "Login and every money action require an active KYB — enforced server-side on each route.",
  },
  {
    icon: SquareLock02Icon,
    tone: "violet" as const,
    title: "Server-only keys",
    body: "The Dakota API key lives in server env and never reaches the browser. All rails calls run server-side.",
  },
  {
    icon: JusticeScale01Icon,
    tone: "amber" as const,
    title: "In-line compliance",
    body: "An amount-threshold policy evaluates every payout before it hits the network.",
  },
  {
    icon: LockKeyIcon,
    tone: "sky" as const,
    title: "Encrypted sessions",
    body: "Sessions are encrypted, http-only cookies; passwords are hashed with bcrypt.",
  },
];

export function Security() {
  return (
    <BentoCard id="security" className="p-6 sm:p-10 scroll-mt-6">
      <div className="max-w-2xl mb-10">
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-zinc-900 leading-[1.05]">
          Compliance and
          <br />
          custody, by default.
        </h2>
        <p className="mt-5 text-base sm:text-lg font-medium text-gray-500 leading-relaxed">
          Money movement is gated, keys stay server-side, and every payout passes a policy
          check first — the guardrails aren&rsquo;t an afterthought, they&rsquo;re the design.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {items.map((it) => (
          <div
            key={it.title}
            className="rounded-[1.5rem] bg-[#F3F4F6] border border-gray-100/80 p-6 transition-all duration-300 hover:bg-white hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
          >
            <IconWrapper size="lg" tone={it.tone}>
              <HugeiconsIcon icon={it.icon} size={22} strokeWidth={2} />
            </IconWrapper>
            <h3 className="mt-5 text-base font-semibold tracking-tight text-zinc-900">{it.title}</h3>
            <p className="mt-2 text-sm font-medium text-gray-500 leading-relaxed">{it.body}</p>
          </div>
        ))}
      </div>
    </BentoCard>
  );
}
