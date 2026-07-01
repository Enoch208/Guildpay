import "server-only";
import type { DakotaClient } from "@dakota-xyz/ts-sdk";
import { getKybStatus } from "@/lib/dakota/onboarding";
import { provisionTreasury } from "@/lib/dakota/treasury";
import { getPayoutStatus } from "@/lib/dakota/payouts";
import { findGuildById, updateGuild, type Guild } from "@/lib/db/guilds";
import { listLedger, updateLedgerStatusByTxId } from "@/lib/db/ledger";

/**
 * Re-check a guild's KYB status against Dakota, persist any change, and — the first time
 * it becomes `active` — provision its treasury (wallet + USD on-ramp). Idempotent: once a
 * wallet exists it is never re-provisioned. Returns the freshest persisted guild.
 */
export async function refreshKyb(client: DakotaClient, guild: Guild): Promise<Guild> {
  const status = await getKybStatus(client, guild.customerId);
  if (status !== guild.kybStatus) {
    updateGuild(guild.id, { kybStatus: status });
  }
  let current = findGuildById(guild.id)!;

  if (status === "active" && !current.walletId) {
    const t = await provisionTreasury(client, guild.customerId);
    updateGuild(guild.id, {
      walletId: t.walletId,
      walletAddress: t.walletAddress,
      usdAccountId: t.usdAccountId,
    });
    current = findGuildById(guild.id)!;
  }
  return current;
}

const TERMINAL_FAIL = ["failed", "cancelled", "reversed", "returned"];

/**
 * Reconcile the guild's still-pending payouts against Dakota and update the ledger.
 * Client polling on the payout page only runs while that page is mounted, so any payout
 * the user navigated away from would otherwise stay `pending` forever. Calling this on
 * every treasury/dashboard load makes the activity feed self-heal. Best-effort per entry.
 */
export async function reconcilePendingPayouts(
  client: DakotaClient,
  guildId: string,
): Promise<void> {
  const pending = listLedger(guildId).filter(
    (e) => e.kind === "payout" && e.status === "pending" && e.txId,
  );
  await Promise.all(
    pending.map(async (e) => {
      try {
        const view = await getPayoutStatus(client, e.txId!);
        if (view.status === "completed") {
          updateLedgerStatusByTxId(e.txId!, "completed");
        } else if (TERMINAL_FAIL.includes(view.status)) {
          updateLedgerStatusByTxId(e.txId!, "failed");
        }
      } catch {
        // best-effort — leave it pending, we'll retry on the next load
      }
    }),
  );
}

export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));
