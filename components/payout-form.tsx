"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { SentIcon } from "@hugeicons/core-free-icons";

import { BentoCard } from "@/components/ui/bento-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconWrapper } from "@/components/ui/icon-wrapper";
import { StatusPill } from "@/components/dashboard/status-pill";
import { fmtUsd, toPillStatus } from "@/lib/format";

type PayoutView = { id: string; status: string; amount: string; playerName: string };
const TERMINAL = ["completed", "failed", "cancelled", "reversed", "returned"];

export function PayoutForm({ initialBalance }: { initialBalance: { usd: string; usdc: string } }) {
  const router = useRouter();
  const [form, setForm] = React.useState({
    playerName: "",
    amount: "1.00",
    bankName: "Chase Bank",
    accountHolderName: "",
    accountNumber: "000123456789",
    routingNumber: "021000021",
  });
  const [payout, setPayout] = React.useState<PayoutView | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  // Poll a live payout until it reaches a terminal status.
  React.useEffect(() => {
    if (!payout || TERMINAL.includes(payout.status)) return;
    const t = setInterval(async () => {
      const res = await fetch(`/api/payout/${payout.id}`);
      if (!res.ok) return;
      const data: PayoutView = await res.json();
      setPayout(data);
      if (TERMINAL.includes(data.status)) {
        clearInterval(t);
        router.refresh();
      }
    }, 3000);
    return () => clearInterval(t);
  }, [payout, router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setPayout(null);
    try {
      const res = await fetch("/api/payout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...form,
          accountHolderName: form.accountHolderName || form.playerName,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Payout failed");
      setPayout(data);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payout failed");
    } finally {
      setBusy(false);
    }
  }

  const settled = payout && TERMINAL.includes(payout.status);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <BentoCard className="lg:col-span-2">
        <div className="flex items-center gap-4 mb-6">
          <IconWrapper tone="amber" size="lg">
            <HugeiconsIcon icon={SentIcon} size={22} strokeWidth={2} />
          </IconWrapper>
          <div>
            <h3 className="text-xl font-semibold tracking-tight text-zinc-900">Pay a player</h3>
            <p className="text-sm font-medium text-gray-500">
              A one-off USDC → USD ACH transfer, settled on real sandbox rails.
            </p>
          </div>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Player name" placeholder="Ace Carter" value={form.playerName} onChange={set("playerName")} required />
            <Input label="Amount (USD)" hint="Sandbox cap $2.00" inputMode="decimal" value={form.amount} onChange={set("amount")} />
            <Input label="Bank name" value={form.bankName} onChange={set("bankName")} />
            <Input label="Account holder" placeholder="Defaults to player name" value={form.accountHolderName} onChange={set("accountHolderName")} />
            <Input label="Account number" value={form.accountNumber} onChange={set("accountNumber")} />
            <Input label="Routing number" value={form.routingNumber} onChange={set("routingNumber")} />
          </div>

          {error && (
            <p className="rounded-2xl bg-rose-50 border border-rose-100 px-4 py-3 text-sm font-medium text-rose-700">
              {error}
            </p>
          )}

          <Button type="submit" size="lg" disabled={busy || (!!payout && !settled)} className="w-full sm:w-auto">
            {busy ? "Submitting…" : `Send ${fmtUsd(form.amount)}`}
          </Button>
        </form>
      </BentoCard>

      <div className="flex flex-col gap-6">
        <BentoCard variant="inverted" className="flex flex-col justify-between min-h-[140px]">
          <p className="text-sm font-medium text-white/60">Available balance</p>
          <div>
            <p className="text-4xl font-semibold tracking-tight">{fmtUsd(initialBalance.usd)}</p>
            <p className="mt-1 text-sm font-medium text-white/50">{initialBalance.usdc} USDC</p>
          </div>
        </BentoCard>

        {payout && (
          <BentoCard>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-500">Payout status</p>
              <StatusPill status={toPillStatus(payout.status)} />
            </div>
            <p className="text-2xl font-semibold tracking-tight text-zinc-900">{fmtUsd(payout.amount)}</p>
            <p className="text-sm font-medium text-gray-500">to {payout.playerName || form.playerName}</p>
            <p className="mt-4 text-xs font-medium text-gray-400 capitalize">
              {settled
                ? payout.status === "completed"
                  ? "Delivered to the player's bank."
                  : `Ended: ${payout.status}`
                : `On rails — status: ${payout.status}. Watching for completion…`}
            </p>
          </BentoCard>
        )}
      </div>
    </div>
  );
}
