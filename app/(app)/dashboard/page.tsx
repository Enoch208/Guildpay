import Link from "next/link";
import { redirect } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowDownLeft01Icon,
  SentIcon,
  Coins01Icon,
  DollarCircleIcon,
  Wallet01Icon,
} from "@hugeicons/core-free-icons";

import {
  requireActiveGuild,
  UnauthorizedError,
  KybNotActiveError,
} from "@/lib/auth/session";
import { getBalance, listLedger } from "@/lib/db/ledger";
import { getDakota } from "@/lib/dakota/client";
import { reconcilePendingPayouts } from "@/lib/guild-service";
import { fmtUsd, fmtUsdc, toPillStatus } from "@/lib/format";

import { BentoCard } from "@/components/ui/bento-card";
import { IconWrapper } from "@/components/ui/icon-wrapper";
import { StatusPill } from "@/components/dashboard/status-pill";
import { buttonClasses } from "@/components/ui/button";
import { Topbar } from "@/components/dashboard/topbar";
import { CopyAddress } from "@/components/copy-address";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let guild;
  try {
    guild = await requireActiveGuild();
  } catch (e) {
    if (e instanceof UnauthorizedError || e instanceof KybNotActiveError) redirect("/login");
    throw e;
  }

  // Self-heal any payouts that settled after the user left the payout page.
  await reconcilePendingPayouts(getDakota(), guild.id);

  const balance = getBalance(guild.id);
  const activity = listLedger(guild.id).slice(0, 8);

  return (
    <>
      <Topbar title="Treasury" guildName={guild.name} email={guild.email} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hero: total treasury value */}
        <BentoCard variant="inverted" className="lg:col-span-2 flex flex-col justify-between min-h-[220px]">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-white/60">Treasury balance</p>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/15 text-emerald-300 border border-emerald-300/20 px-3 py-1 text-xs font-semibold">
              KYB active
            </span>
          </div>
          <div>
            <p className="text-5xl sm:text-6xl font-semibold tracking-tight">{fmtUsd(balance.usd)}</p>
            <p className="mt-2 text-sm font-medium text-white/50">{fmtUsdc(balance.usdc)} · settled on-chain</p>
          </div>
          {guild.walletAddress && (
            <div className="flex items-center gap-2 text-white/70">
              <HugeiconsIcon icon={Wallet01Icon} size={16} strokeWidth={2} />
              <span className="text-xs font-mono truncate">{guild.walletAddress}</span>
            </div>
          )}
        </BentoCard>

        {/* Two balance cards */}
        <div className="flex flex-col gap-6">
          <BentoCard className="flex items-center gap-4">
            <IconWrapper tone="emerald" size="lg">
              <HugeiconsIcon icon={DollarCircleIcon} size={22} strokeWidth={2} />
            </IconWrapper>
            <div>
              <p className="text-sm font-medium text-gray-500">USD value</p>
              <p className="text-2xl font-semibold tracking-tight text-zinc-900">{fmtUsd(balance.usd)}</p>
            </div>
          </BentoCard>
          <BentoCard className="flex items-center gap-4">
            <IconWrapper tone="violet" size="lg">
              <HugeiconsIcon icon={Coins01Icon} size={22} strokeWidth={2} />
            </IconWrapper>
            <div>
              <p className="text-sm font-medium text-gray-500">Stablecoin (USDC)</p>
              <p className="text-2xl font-semibold tracking-tight text-zinc-900">{fmtUsdc(balance.usdc)}</p>
            </div>
          </BentoCard>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <BentoCard className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <IconWrapper tone="sky" size="lg">
              <HugeiconsIcon icon={ArrowDownLeft01Icon} size={22} strokeWidth={2} />
            </IconWrapper>
            <div>
              <p className="font-semibold tracking-tight text-zinc-900">Add funds</p>
              <p className="text-sm font-medium text-gray-500">Simulate a sponsor deposit</p>
            </div>
          </div>
          <Link href="/deposit" className={buttonClasses({ variant: "secondary", size: "sm" })}>
            Deposit
          </Link>
        </BentoCard>
        <BentoCard className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <IconWrapper tone="amber" size="lg">
              <HugeiconsIcon icon={SentIcon} size={22} strokeWidth={2} />
            </IconWrapper>
            <div>
              <p className="font-semibold tracking-tight text-zinc-900">Pay a player</p>
              <p className="text-sm font-medium text-gray-500">USDC → USD ACH payout</p>
            </div>
          </div>
          <Link href="/payout" className={buttonClasses({ variant: "primary", size: "sm" })}>
            Send payout
          </Link>
        </BentoCard>
      </div>

      {/* Activity */}
      <BentoCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold tracking-tight text-zinc-900">Recent activity</h3>
          {guild.walletAddress && <CopyAddress address={guild.walletAddress} />}
        </div>

        {activity.length === 0 ? (
          <p className="text-sm font-medium text-gray-500 py-8 text-center">
            No activity yet — make your first deposit to fund the treasury.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {activity.map((e) => (
              <li key={e.id} className="flex items-center justify-between py-3.5">
                <div className="flex items-center gap-3 min-w-0">
                  <IconWrapper tone={e.kind === "deposit" ? "emerald" : "neutral"} size="sm">
                    <HugeiconsIcon
                      icon={e.kind === "deposit" ? ArrowDownLeft01Icon : SentIcon}
                      size={16}
                      strokeWidth={2}
                    />
                  </IconWrapper>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold tracking-tight text-zinc-900 truncate">
                      {e.reference ?? (e.kind === "deposit" ? "Deposit" : "Payout")}
                    </p>
                    <p className="text-xs font-medium text-gray-400 capitalize">{e.kind}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span
                    className={
                      e.kind === "deposit"
                        ? "text-sm font-semibold text-emerald-600"
                        : "text-sm font-semibold text-zinc-900"
                    }
                  >
                    {e.kind === "deposit" ? "+" : "−"}
                    {fmtUsd(e.amount)}
                  </span>
                  <StatusPill status={toPillStatus(e.status)} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </BentoCard>
    </>
  );
}
