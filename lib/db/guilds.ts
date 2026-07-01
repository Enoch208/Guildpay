import "server-only";
import { randomUUID } from "node:crypto";
import { getDb } from "./index";

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

type Row = {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  customer_id: string;
  application_id: string;
  kyb_status: string;
  wallet_id: string | null;
  wallet_address: string | null;
  usd_account_id: string | null;
  created_at: number;
};

const toGuild = (r: Row): Guild => ({
  id: r.id,
  email: r.email,
  passwordHash: r.password_hash,
  name: r.name,
  customerId: r.customer_id,
  applicationId: r.application_id,
  kybStatus: r.kyb_status,
  walletId: r.wallet_id,
  walletAddress: r.wallet_address,
  usdAccountId: r.usd_account_id,
  createdAt: r.created_at,
});

export function createGuild(input: {
  email: string;
  passwordHash: string;
  name: string;
  customerId: string;
  applicationId: string;
  kybStatus: string;
}): Guild {
  const id = randomUUID();
  getDb()
    .prepare(
      `INSERT INTO guilds (id, email, password_hash, name, customer_id, application_id, kyb_status, wallet_id, wallet_address, usd_account_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NULL, NULL, NULL, ?)`,
    )
    .run(
      id,
      input.email.toLowerCase(),
      input.passwordHash,
      input.name,
      input.customerId,
      input.applicationId,
      input.kybStatus,
      Date.now(),
    );
  return findGuildById(id)!;
}

export function findGuildByEmail(email: string): Guild | undefined {
  const r = getDb()
    .prepare(`SELECT * FROM guilds WHERE email = ?`)
    .get(email.toLowerCase()) as Row | undefined;
  return r && toGuild(r);
}

export function findGuildById(id: string): Guild | undefined {
  const r = getDb().prepare(`SELECT * FROM guilds WHERE id = ?`).get(id) as
    | Row
    | undefined;
  return r && toGuild(r);
}

export function updateGuild(
  id: string,
  patch: Partial<
    Pick<Guild, "kybStatus" | "walletId" | "walletAddress" | "usdAccountId">
  >,
): void {
  const cols: Record<string, string> = {
    kybStatus: "kyb_status",
    walletId: "wallet_id",
    walletAddress: "wallet_address",
    usdAccountId: "usd_account_id",
  };
  const sets: string[] = [];
  const vals: unknown[] = [];
  for (const [key, col] of Object.entries(cols)) {
    const v = patch[key as keyof typeof patch];
    if (v !== undefined) {
      sets.push(`${col} = ?`);
      vals.push(v);
    }
  }
  if (!sets.length) return;
  vals.push(id);
  getDb()
    .prepare(`UPDATE guilds SET ${sets.join(", ")} WHERE id = ?`)
    .run(...vals);
}
