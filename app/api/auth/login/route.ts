import { loginSchema } from "@/lib/validation";
import { findGuildByEmail } from "@/lib/db/guilds";
import { verifyPassword } from "@/lib/auth/passwords";
import { getSession } from "@/lib/auth/session";
import { ApiError, jsonError, ok } from "@/lib/http";

export async function POST(req: Request) {
  try {
    const { email, password } = loginSchema.parse(await req.json());
    const guild = await findGuildByEmail(email);
    if (!guild || !(await verifyPassword(password, guild.passwordHash))) {
      throw new ApiError("Invalid email or password", 401);
    }
    // Login is gated on KYB being active.
    if (guild.kybStatus !== "active") {
      throw new ApiError("Your guild's KYB is not active yet", 403);
    }
    const session = await getSession();
    session.guildId = guild.id;
    await session.save();
    return ok({ guildId: guild.id });
  } catch (e) {
    return jsonError(e);
  }
}
