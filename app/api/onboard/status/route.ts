import { getDakota } from "@/lib/dakota/client";
import { requireGuild } from "@/lib/auth/session";
import { refreshKyb } from "@/lib/guild-service";
import { jsonError, ok } from "@/lib/http";

/** Poll target for the onboarding wizard: re-checks KYB live and provisions on first active. */
export async function GET() {
  try {
    const guild = await requireGuild();
    const fresh = await refreshKyb(getDakota(), guild);
    return ok({ kybStatus: fresh.kybStatus, provisioned: Boolean(fresh.walletId) });
  } catch (e) {
    return jsonError(e);
  }
}
