import "server-only";
import { randomUUID } from "node:crypto";
import type { Row } from "@libsql/client";
import { db } from "./index";

export type Guild = {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  customerId: string;
  applicationId: string;
  kybStatus: string;
  walletId: string | null;
  walletAddress: string | null;
  usdAccountId: string | null;
  createdAt: number;
};

const toGuild = (r: Row): Guild => ({
  id: r.id as string,
  email: r.email as string,
  passwordHash: r.password_hash as string,
  name: r.name as string,
  customerId: r.customer_id as string,
  applicationId: r.application_id as string,
  kybStatus: r.kyb_status as string,
  walletId: (r.wallet_id as string | null) ?? null,
  walletAddress: (r.wallet_address as string | null) ?? null,
  usdAccountId: (r.usd_account_id as string | null) ?? null,
  createdAt: Number(r.created_at),
});

export async function createGuild(input: {
  email: string;
  passwordHash: string;
  name: string;
  customerId: string;
  applicationId: string;
  kybStatus: string;
}): Promise<Guild> {
  const id = randomUUID();
  const c = await db();
  await c.execute({
    sql: `INSERT INTO guilds (id, email, password_hash, name, customer_id, application_id, kyb_status, wallet_id, wallet_address, usd_account_id, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, NULL, NULL, NULL, ?)`,
    args: [
      id,
      input.email.toLowerCase(),
      input.passwordHash,
      input.name,
      input.customerId,
      input.applicationId,
      input.kybStatus,
      Date.now(),
    ],
  });
  return (await findGuildById(id))!;
}

export async function findGuildByEmail(email: string): Promise<Guild | undefined> {
  const c = await db();
  const res = await c.execute({
    sql: `SELECT * FROM guilds WHERE email = ?`,
    args: [email.toLowerCase()],
  });
  return res.rows[0] ? toGuild(res.rows[0]) : undefined;
}

export async function findGuildById(id: string): Promise<Guild | undefined> {
  const c = await db();
  const res = await c.execute({ sql: `SELECT * FROM guilds WHERE id = ?`, args: [id] });
  return res.rows[0] ? toGuild(res.rows[0]) : undefined;
}

export async function updateGuild(
  id: string,
  patch: Partial<
    Pick<Guild, "kybStatus" | "walletId" | "walletAddress" | "usdAccountId">
  >,
): Promise<void> {
  const cols: Record<string, string> = {
    kybStatus: "kyb_status",
    walletId: "wallet_id",
    walletAddress: "wallet_address",
    usdAccountId: "usd_account_id",
  };
  const sets: string[] = [];
  const args: (string | null)[] = [];
  for (const [key, col] of Object.entries(cols)) {
    const v = patch[key as keyof typeof patch];
    if (v !== undefined) {
      sets.push(`${col} = ?`);
      args.push(v);
    }
  }
  if (!sets.length) return;
  args.push(id);
  const c = await db();
  await c.execute({ sql: `UPDATE guilds SET ${sets.join(", ")} WHERE id = ?`, args });
}
