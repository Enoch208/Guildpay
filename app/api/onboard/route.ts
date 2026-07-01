import { randomUUID } from "node:crypto";
import { onboardSchema } from "@/lib/validation";
import { getDakota } from "@/lib/dakota/client";
import { onboardGuild, approveKyb } from "@/lib/dakota/onboarding";
import { createGuild, findGuildByEmail } from "@/lib/db/guilds";
import { hashPassword } from "@/lib/auth/passwords";
import { getSession } from "@/lib/auth/session";
import { refreshKyb, sleep } from "@/lib/guild-service";
import { ApiError, jsonError, ok } from "@/lib/http";

export async function POST(req: Request) {
  try {
    const input = onboardSchema.parse(await req.json());
    if (await findGuildByEmail(input.email)) {
      throw new ApiError("That email is already registered", 409);
    }

    const client = getDakota();
    const externalId = randomUUID();
    // Customer names are unique per client — add a short suffix.
    const uniqueName = `${input.guildName} · ${externalId.slice(0, 6)}`;
    const { customerId, applicationId } = await onboardGuild(client, {
      name: uniqueName,
      externalId,
    });
    await approveKyb(client, applicationId);

    let guild = await createGuild({
      email: input.email,
      passwordHash: await hashPassword(input.password),
      name: input.guildName,
      customerId,
      applicationId,
      kybStatus: "pending",
    });

    // KYB reaches active in seconds; poll briefly and provision on first active.
    for (let i = 0; i < 10; i++) {
      guild = await refreshKyb(client, guild);
      if (guild.kybStatus === "active") break;
      await sleep(1500);
    }

    const session = await getSession();
    session.guildId = guild.id;
    await session.save();

    return ok({ guildId: guild.id, kybStatus: guild.kybStatus });
  } catch (e) {
    return jsonError(e);
  }
}
