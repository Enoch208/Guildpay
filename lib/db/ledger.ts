import "server-only";
import { randomUUID } from "node:crypto";
import type { Row } from "@libsql/client";
import { db } from "./index";

export type LedgerKind = "deposit" | "payout";
export type LedgerStatus = "pending" | "confirmed" | "completed" | "failed";

export type LedgerEntry = {
  id: string;
  guildId: string;
  kind: LedgerKind;
  amount: string;
  currency: string;
  txId: string | null;
  status: LedgerStatus;
  reference: string | null;
  createdAt: number;
};

const toEntry = (r: Row): LedgerEntry => ({
  id: r.id as string,
  guildId: r.guild_id as string,
  kind: r.kind as LedgerKind,
  amount: r.amount as string,
  currency: r.currency as string,
  txId: (r.tx_id as string | null) ?? null,
  status: r.status as LedgerStatus,
  reference: (r.reference as string | null) ?? null,
  createdAt: Number(r.created_at),
});

/** Statuses that represent settled money and therefore affect the balance. */
const SETTLED: LedgerStatus[] = ["confirmed", "completed"];

const toCents = (amount: string): number => Math.round(Number(amount) * 100);
const fromCents = (cents: number): string => (cents / 100).toFixed(2);

export async function addLedgerEntry(input: {
  guildId: string;
  kind: LedgerKind;
  amount: string;
  currency?: string;
  txId?: string | null;
  status: LedgerStatus;
  reference?: string | null;
}): Promise<LedgerEntry> {
  const id = randomUUID();
  const c = await db();
  await c.execute({
    sql: `INSERT INTO ledger_entries (id, guild_id, kind, amount, currency, tx_id, status, reference, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      input.guildId,
      input.kind,
      input.amount,
      input.currency ?? "USDC",
      input.txId ?? null,
      input.status,
      input.reference ?? null,
      Date.now(),
    ],
  });
  return (await getEntryById(id))!;
}

export async function getEntryById(id: string): Promise<LedgerEntry | undefined> {
  const c = await db();
  const res = await c.execute({ sql: `SELECT * FROM ledger_entries WHERE id = ?`, args: [id] });
  return res.rows[0] ? toEntry(res.rows[0]) : undefined;
}

export async function updateLedgerStatus(id: string, status: LedgerStatus): Promise<void> {
  const c = await db();
  await c.execute({ sql: `UPDATE ledger_entries SET status = ? WHERE id = ?`, args: [status, id] });
}

/** Mark the ledger entry backing a given Dakota tx (used when polling settles it). */
export async function updateLedgerStatusByTxId(txId: string, status: LedgerStatus): Promise<void> {
  const c = await db();
  await c.execute({ sql: `UPDATE ledger_entries SET status = ? WHERE tx_id = ?`, args: [status, txId] });
}

export async function listLedger(guildId: string): Promise<LedgerEntry[]> {
  const c = await db();
  const res = await c.execute({
    sql: `SELECT * FROM ledger_entries WHERE guild_id = ? ORDER BY rowid DESC`,
    args: [guildId],
  });
  return res.rows.map(toEntry);
}

/**
 * Treasury balance = settled deposits − settled payouts (Part C recipe:
 * `wallets.getBalances()` is Privy-gated and returns $0, so we track it here).
 * USDC ≈ USD 1:1, so both figures are the same number.
 */
export async function getBalance(guildId: string): Promise<{ usdc: string; usd: string }> {
  const c = await db();
  const res = await c.execute({
    sql: `SELECT kind, amount, status FROM ledger_entries WHERE guild_id = ?`,
    args: [guildId],
  });
  let cents = 0;
  for (const r of res.rows) {
    const status = r.status as LedgerStatus;
    if (!SETTLED.includes(status)) continue;
    const amt = toCents(r.amount as string);
    cents += (r.kind as LedgerKind) === "deposit" ? amt : -amt;
  }
  const value = fromCents(cents);
  return { usdc: value, usd: value };
}
