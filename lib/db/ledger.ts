import "server-only";
import { randomUUID } from "node:crypto";
import { getDb } from "./index";

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

type Row = {
  id: string;
  guild_id: string;
  kind: LedgerKind;
  amount: string;
  currency: string;
  tx_id: string | null;
  status: LedgerStatus;
  reference: string | null;
  created_at: number;
};

const toEntry = (r: Row): LedgerEntry => ({
  id: r.id,
  guildId: r.guild_id,
  kind: r.kind,
  amount: r.amount,
  currency: r.currency,
  txId: r.tx_id,
  status: r.status,
  reference: r.reference,
  createdAt: r.created_at,
});

/** Statuses that represent settled money and therefore affect the balance. */
const SETTLED: LedgerStatus[] = ["confirmed", "completed"];

const toCents = (amount: string): number => Math.round(Number(amount) * 100);
const fromCents = (cents: number): string => (cents / 100).toFixed(2);

export function addLedgerEntry(input: {
  guildId: string;
  kind: LedgerKind;
  amount: string;
  currency?: string;
  txId?: string | null;
  status: LedgerStatus;
  reference?: string | null;
}): LedgerEntry {
  const id = randomUUID();
  getDb()
    .prepare(
      `INSERT INTO ledger_entries (id, guild_id, kind, amount, currency, tx_id, status, reference, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      id,
      input.guildId,
      input.kind,
      input.amount,
      input.currency ?? "USDC",
      input.txId ?? null,
      input.status,
      input.reference ?? null,
      Date.now(),
    );
  return getEntryById(id)!;
}

export function getEntryById(id: string): LedgerEntry | undefined {
  const r = getDb()
    .prepare(`SELECT * FROM ledger_entries WHERE id = ?`)
    .get(id) as Row | undefined;
  return r && toEntry(r);
}

export function updateLedgerStatus(id: string, status: LedgerStatus): void {
  getDb()
    .prepare(`UPDATE ledger_entries SET status = ? WHERE id = ?`)
    .run(status, id);
}

/** Mark the ledger entry backing a given Dakota tx (used when polling settles it). */
export function updateLedgerStatusByTxId(txId: string, status: LedgerStatus): void {
  getDb()
    .prepare(`UPDATE ledger_entries SET status = ? WHERE tx_id = ?`)
    .run(status, txId);
}

export function listLedger(guildId: string): LedgerEntry[] {
  const rows = getDb()
    .prepare(
      `SELECT * FROM ledger_entries WHERE guild_id = ? ORDER BY rowid DESC`,
    )
    .all(guildId) as Row[];
  return rows.map(toEntry);
}

/**
 * Treasury balance = settled deposits − settled payouts (Part C recipe:
 * `wallets.getBalances()` is Privy-gated and returns $0, so we track it here).
 * USDC ≈ USD 1:1, so both figures are the same number.
 */
export function getBalance(guildId: string): { usdc: string; usd: string } {
  const rows = getDb()
    .prepare(
      `SELECT kind, amount, status FROM ledger_entries WHERE guild_id = ?`,
    )
    .all(guildId) as Pick<Row, "kind" | "amount" | "status">[];
  let cents = 0;
  for (const r of rows) {
    if (!SETTLED.includes(r.status)) continue;
    cents += r.kind === "deposit" ? toCents(r.amount) : -toCents(r.amount);
  }
  const value = fromCents(cents);
  return { usdc: value, usd: value };
}
