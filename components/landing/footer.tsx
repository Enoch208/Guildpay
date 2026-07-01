import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { GithubIcon, ArrowRight01Icon } from "@hugeicons/core-free-icons";

import { buttonClasses } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

const productLinks = [
  { label: "How it works", href: "#how" },
  { label: "Features", href: "#features" },
  { label: "Security", href: "#security" },
  { label: "FAQ", href: "#faq" },
];

const resourceLinks = [
  { label: "GitHub", href: "https://github.com/damishafe/Guildpay" },
  { label: "Dakota docs", href: "https://docs.dakota.xyz" },
  { label: "The Agentic Build", href: "https://dakota.xyz/agentic-build" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      <div className="lg:col-span-4 rounded-[2rem] bg-white border border-gray-100 p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between min-h-[18rem]">
        <div className="flex flex-col gap-4">
          <Logo name="Guildpay" />
          <p className="text-sm font-medium text-gray-500 leading-relaxed max-w-xs">
            A KYB-gated neobank for esports guilds, on Dakota&rsquo;s real sandbox rails.
          </p>
        </div>
        <div className="mt-8">
          <Link href="/onboard" className={buttonClasses({ variant: "primary", size: "md" })}>
            Get started
            <HugeiconsIcon icon={ArrowRight01Icon} size={14} strokeWidth={2} />
          </Link>
        </div>
      </div>

      <div className="lg:col-span-6 rounded-[2rem] bg-white border border-gray-100 p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between min-h-[18rem]">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.18em] text-gray-400 mb-4 uppercase">
              Product
            </p>
            <ul className="space-y-3">
              {productLinks.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm font-medium text-zinc-900 hover:text-zinc-600 transition-colors cursor-pointer">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[11px] font-semibold tracking-[0.18em] text-gray-400 mb-4 uppercase">
              Resources
            </p>
            <ul className="space-y-3">
              {resourceLinks.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-medium text-zinc-900 hover:text-zinc-600 transition-colors cursor-pointer"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-100 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-gray-400">
          <span>Built agentically on Dakota&rsquo;s sandbox rails.</span>
          <span className="ml-auto">© {year} Guildpay</span>
        </div>
      </div>

      <div className="lg:col-span-2 rounded-[2rem] bg-white border border-gray-100 p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col items-center justify-center gap-4 min-h-[18rem]">
        <p className="text-[11px] font-semibold tracking-[0.18em] text-gray-400 uppercase">Source</p>
        <a
          aria-label="GitHub repository"
          href="https://github.com/damishafe/Guildpay"
          target="_blank"
          rel="noreferrer"
          className="cursor-pointer flex items-center justify-center w-12 h-12 rounded-2xl bg-[#09090B] text-white transition-all duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_2px_8px_-2px_rgba(0,0,0,0.2),0_10px_24px_-12px_rgba(0,0,0,0.4)] hover:bg-zinc-800 hover:-translate-y-0.5 active:translate-y-0"
        >
          <HugeiconsIcon icon={GithubIcon} size={20} strokeWidth={2} />
        </a>
      </div>
    </footer>
  );
}
