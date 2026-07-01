import { payoutSchema } from "@/lib/validation";
import { getDakota } from "@/lib/dakota/client";
import { sendPayout } from "@/lib/dakota/payouts";
import { SANDBOX_MAX_TRANSFER } from "@/lib/dakota/types";
import { checkPayoutPolicy } from "@/lib/compliance";
import { requireActiveGuild } from "@/lib/auth/session";
import { addLedgerEntry, getBalance, listLedger } from "@/lib/db/ledger";
import { ApiError, jsonError, ok } from "@/lib/http";

/** Pay a player: compliance gate + balance check, then a one-off USDC -> USD ACH transfer. */
export async function POST(req: Request) {
  try {
    const guild = await requireActiveGuild();
    const input = payoutSchema.parse(await req.json());

    const policy = checkPayoutPolicy(input.amount);
    if (!policy.allowed) {
      throw new ApiError(policy.reason ?? "Payout blocked by compliance policy", 422);
    }
    if (Number(input.amount) > SANDBOX_MAX_TRANSFER) {
      throw new ApiError(`Sandbox caps a single transfer at $${SANDBOX_MAX_TRANSFER}`, 422);
    }
    if (Number(input.amount) > Number(getBalance(guild.id).usdc)) {
      throw new ApiError("Insufficient treasury balance", 422);
    }

    const view = await sendPayout(getDakota(), {
      customerId: guild.customerId,
      amount: input.amount,
      player: {
        name: input.playerName,
        bankName: input.bankName,
        accountHolderName: input.accountHolderName,
        accountNumber: input.accountNumber,
        routingNumber: input.routingNumber,
      },
    });

    addLedgerEntry({
      guildId: guild.id,
      kind: "payout",
      amount: input.amount,
      currency: "USDC",
      txId: view.id,
      status: "pending",
      reference: `Payout to ${input.playerName}`,
    });

    return ok(view);
  } catch (e) {
    return jsonError(e);
  }
}

/** Recent payouts for the activity list. */
export async function GET() {
  try {
    const guild = await requireActiveGuild();
    const payouts = listLedger(guild.id).filter((e) => e.kind === "payout");
    return ok({ payouts });
  } catch (e) {
    return jsonError(e);
  }
}
