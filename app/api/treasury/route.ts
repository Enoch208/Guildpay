import { requireActiveGuild } from "@/lib/auth/session";
import { getBalance, listLedger } from "@/lib/db/ledger";
import { getDakota } from "@/lib/dakota/client";
import { reconcilePendingPayouts } from "@/lib/guild-service";
import { jsonError, ok } from "@/lib/http";

/** Treasury overview: ledger-derived USD + USDC balance, wallet address, and activity feed. */
export async function GET() {
  try {
    const guild = await requireActiveGuild();
    // Reconcile any payouts that settled since the last load so activity is never stale.
    await reconcilePendingPayouts(getDakota(), guild.id);
    const [balance, activity] = await Promise.all([
      getBalance(guild.id),
      listLedger(guild.id),
    ]);
    return ok({ balance, walletAddress: guild.walletAddress, activity });
  } catch (e) {
    return jsonError(e);
  }
}
