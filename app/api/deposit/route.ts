import { depositSchema } from "@/lib/validation";
import { getDakota } from "@/lib/dakota/client";
import { simulateDeposit } from "@/lib/dakota/treasury";
import { SANDBOX_MAX_TRANSFER } from "@/lib/dakota/types";
import { requireActiveGuild } from "@/lib/auth/session";
import { addLedgerEntry, getBalance } from "@/lib/db/ledger";
import { ApiError, jsonError, ok } from "@/lib/http";

/** Simulate a sponsor/prize deposit: ACH inbound into the guild's on-ramp (settles USD -> USDC). */
export async function POST(req: Request) {
  try {
    const guild = await requireActiveGuild();
    const { amount } = depositSchema.parse(await req.json());

    if (Number(amount) > SANDBOX_MAX_TRANSFER) {
      throw new ApiError(`Sandbox caps a single transfer at $${SANDBOX_MAX_TRANSFER}`, 422);
    }
    if (!guild.usdAccountId) {
      throw new ApiError("Treasury is still being provisioned — try again in a moment", 409);
    }

    await simulateDeposit(getDakota(), { usdAccountId: guild.usdAccountId, amount });
    await addLedgerEntry({
      guildId: guild.id,
      kind: "deposit",
      amount,
      currency: "USDC",
      status: "confirmed",
      reference: "Sponsor deposit",
    });

    return ok({ ok: true, balance: await getBalance(guild.id) });
  } catch (e) {
    return jsonError(e);
  }
}
