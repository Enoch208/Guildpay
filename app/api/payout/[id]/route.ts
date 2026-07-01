import { getDakota } from "@/lib/dakota/client";
import { getPayoutStatus } from "@/lib/dakota/payouts";
import { requireActiveGuild } from "@/lib/auth/session";
import { updateLedgerStatusByTxId } from "@/lib/db/ledger";
import { jsonError, ok } from "@/lib/http";

const TERMINAL_FAIL = ["failed", "cancelled", "reversed", "returned"];

/** Poll a payout's status; reconcile the ledger entry when it settles. */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireActiveGuild();
    const { id } = await params;
    const view = await getPayoutStatus(getDakota(), id);

    if (view.status === "completed") {
      await updateLedgerStatusByTxId(id, "completed");
    } else if (TERMINAL_FAIL.includes(view.status)) {
      await updateLedgerStatusByTxId(id, "failed");
    }

    return ok(view);
  } catch (e) {
    return jsonError(e);
  }
}
