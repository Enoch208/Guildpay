import "server-only";
import { getIronSession, type IronSession } from "iron-session";
import { getServerEnv } from "@/lib/env";
import { findGuildById, type Guild } from "@/lib/db/guilds";

export type SessionData = { guildId?: string };

export class UnauthorizedError extends Error {
  constructor(message = "Not signed in") {
    super(message);
    this.name = "UnauthorizedError";
  }
}
export class KybNotActiveError extends Error {
  constructor(message = "KYB is not active yet") {
    super(message);
    this.name = "KybNotActiveError";
  }
}

function sessionPassword(): string {
  try {
    return getServerEnv().sessionSecret;
  } catch {
    return "dev-only-insecure-secret-please-set-SESSION_SECRET-32chars!!";
  }
}

export const sessionOptions = {
  password: sessionPassword(),
  cookieName: "guildpay_session",
  cookieOptions: {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  },
};

export async function getSession(): Promise<IronSession<SessionData>> {
  // Lazy import so the pure guard logic below stays unit-testable without a request.
  const { cookies } = await import("next/headers");
  return getIronSession<SessionData>(await cookies(), sessionOptions);
}

/** Pure decision logic — unit-tested. */
export function resolveGuard(
  guild: Guild | undefined,
  opts: { requireActive: boolean },
): Guild {
  if (!guild) throw new UnauthorizedError();
  if (opts.requireActive && guild.kybStatus !== "active") {
    throw new KybNotActiveError();
  }
  return guild;
}

export async function requireGuild(): Promise<Guild> {
  const s = await getSession();
  return resolveGuard(s.guildId ? findGuildById(s.guildId) : undefined, {
    requireActive: false,
  });
}

export async function requireActiveGuild(): Promise<Guild> {
  const s = await getSession();
  return resolveGuard(s.guildId ? findGuildById(s.guildId) : undefined, {
    requireActive: true,
  });
}
