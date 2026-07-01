"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkCircle01Icon, ArrowDownLeft01Icon } from "@hugeicons/core-free-icons";

import { BentoCard } from "@/components/ui/bento-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconWrapper } from "@/components/ui/icon-wrapper";
import { CopyAddress } from "@/components/copy-address";
import { fmtUsd } from "@/lib/format";

type Balance = { usd: string; usdc: string };

export function DepositForm({
  walletAddress,
  initialBalance,
}: {
  walletAddress: string | null;
  initialBalance: Balance;
}) {
  const router = useRouter();
  const [amount, setAmount] = React.useState("2.00");
  const [balance, setBalance] = React.useState(initialBalance);
  const [busy, setBusy] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setDone(false);
    try {
      const res = await fetch("/api/deposit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Deposit failed");
      setBalance(data.balance);
      setDone(true);
      router.refresh(); // keep the dashboard in sync
    } catch (err) {
      setError(err instanceof Error ? err.message : "Deposit failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <BentoCard className="lg:col-span-2">
        <div className="flex items-center gap-4 mb-6">
          <IconWrapper tone="emerald" size="lg">
            <HugeiconsIcon icon={ArrowDownLeft01Icon} size={22} strokeWidth={2} />
          </IconWrapper>
          <div>
            <h3 className="text-xl font-semibold tracking-tight text-zinc-900">Simulate a sponsor deposit</h3>
            <p className="text-sm font-medium text-gray-500">
              Funds arrive over the USD ACH on-ramp and settle to USDC in the treasury.
            </p>
          </div>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-5">
          <Input
            label="Amount (USD)"
            hint="Sandbox caps a single transfer at $2.00"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          {error && (
            <p className="rounded-2xl bg-rose-50 border border-rose-100 px-4 py-3 text-sm font-medium text-rose-700">
              {error}
            </p>
          )}
          {done && (
            <p className="inline-flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-100 px-4 py-3 text-sm font-medium text-emerald-700">
              <HugeiconsIcon icon={CheckmarkCircle01Icon} size={16} strokeWidth={2.2} />
              Deposit settled — treasury balance updated.
            </p>
          )}

          <Button type="submit" size="lg" disabled={busy} className="w-full sm:w-auto">
            {busy ? "Settling deposit…" : `Deposit ${fmtUsd(amount)}`}
          </Button>
        </form>
      </BentoCard>

      <div className="flex flex-col gap-6">
        <BentoCard variant="inverted" className="flex flex-col justify-between min-h-[140px]">
          <p className="text-sm font-medium text-white/60">Treasury balance</p>
          <div>
            <p className="text-4xl font-semibold tracking-tight">{fmtUsd(balance.usd)}</p>
            <p className="mt-1 text-sm font-medium text-white/50">{balance.usdc} USDC</p>
          </div>
        </BentoCard>

        {walletAddress && (
          <BentoCard>
            <p className="text-sm font-medium text-gray-500 mb-2">USDC deposit address</p>
            <CopyAddress address={walletAddress} />
            <p className="mt-3 text-xs font-medium text-gray-400">
              Ethereum Sepolia · on-chain destination for settled deposits.
            </p>
          </BentoCard>
        )}
      </div>
    </div>
  );
}
