import { getSession } from "@/lib/auth/session";
import { jsonError, ok } from "@/lib/http";

export async function POST() {
  try {
    const session = await getSession();
    session.destroy();
    return ok({ ok: true });
  } catch (e) {
    return jsonError(e);
  }
}
