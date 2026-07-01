import "server-only";
import Database from "better-sqlite3";
import { getServerEnv } from "@/lib/env";

let db: Database.Database | undefined;

export function getDb(): Database.Database {
  if (db) return db;
  db = new Database(getServerEnv().dbPath);
  db.pragma("journal_mode = WAL");
  db.exec(`
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
      kind       TEXT NOT NULL,       -- 'deposit' | 'payout'
      amount     TEXT NOT NULL,       -- decimal string, USDC-equivalent
      currency   TEXT NOT NULL,       -- 'USDC' | 'USD'
      tx_id      TEXT,                -- backing Dakota transaction/movement id
      status     TEXT NOT NULL,       -- 'pending' | 'confirmed' | 'completed' | 'failed'
      reference  TEXT,
      created_at INTEGER NOT NULL
    );
  `);
  return db;
}

/** Test-only: drop the cached connection so the next getDb() opens a fresh db. */
export function closeDb(): void {
  db?.close();
  db = undefined;
}
