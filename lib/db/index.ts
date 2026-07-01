import "server-only";
import { createClient, type Client } from "@libsql/client";
import { getServerEnv } from "@/lib/env";

let client: Client | undefined;
let ready: Promise<unknown> | undefined;

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS guilds (
    id             TEXT PRIMARY KEY,
    email          TEXT UNIQUE NOT NULL,
    password_hash  TEXT NOT NULL,
    name           TEXT NOT NULL,
    customer_id    TEXT NOT NULL,
    application_id TEXT NOT NULL,
    kyb_status     TEXT NOT NULL,
    wallet_id      TEXT,
    wallet_address TEXT,
    usd_account_id TEXT,
    created_at     INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS ledger_entries (
    id         TEXT PRIMARY KEY,
    guild_id   TEXT NOT NULL,
    kind       TEXT NOT NULL,
    amount     TEXT NOT NULL,
    currency   TEXT NOT NULL,
    tx_id      TEXT,
    status     TEXT NOT NULL,
    reference  TEXT,
    created_at INTEGER NOT NULL
  );
`;

function makeClient(): Client {
  // Production/serverless (e.g. Vercel): a hosted Turso database.
  const url = process.env.TURSO_DATABASE_URL;
  if (url) {
    return createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
  }
  // Local dev / tests: libSQL reads a plain SQLite file, or an in-memory db.
  const path = getServerEnv().dbPath;
  return createClient({ url: path === ":memory:" ? ":memory:" : `file:${path}` });
}

/** Get the libSQL client, ensuring the schema exists (idempotent, memoized). */
export async function db(): Promise<Client> {
  if (!client) {
    client = makeClient();
    ready = client.executeMultiple(SCHEMA);
  }
  await ready;
  return client;
}

/** Test-only: drop the cached client so the next db() opens a fresh connection. */
export function closeDb(): void {
  client?.close();
  client = undefined;
  ready = undefined;
}
