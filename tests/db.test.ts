import { describe, it, expect, beforeEach } from "vitest";
import { closeDb } from "@/lib/db";
import {
  createGuild,
  findGuildByEmail,
  findGuildById,
  updateGuild,
} from "@/lib/db/guilds";
import {
  addLedgerEntry,
  updateLedgerStatus,
  listLedger,
  getBalance,
} from "@/lib/db/ledger";

beforeEach(() => {
  process.env.DAKOTA_API_KEY = "k";
  process.env.SESSION_SECRET = "x".repeat(32);
  process.env.DATABASE_PATH = ":memory:";
  delete process.env.TURSO_DATABASE_URL;
  closeDb(); // fresh in-memory db per test
});

function seedGuild() {
  return createGuild({
    email: "a@b.com",
    passwordHash: "h",
    name: "Team Nova",
    customerId: "cus_1",
    applicationId: "app_1",
    kybStatus: "pending",
  });
}

describe("guild repo", () => {
  it("creates and reads a guild by email and id", async () => {
    const g = await seedGuild();
    expect(g.id).toBeTruthy();
    expect(g.walletId).toBeNull();
    expect((await findGuildByEmail("a@b.com"))?.name).toBe("Team Nova");
    expect((await findGuildById(g.id))?.customerId).toBe("cus_1");
  });

  it("lowercases email on write and read", async () => {
    await createGuild({
      email: "MixED@Case.com",
      passwordHash: "h",
      name: "X",
      customerId: "cus_9",
      applicationId: "app_9",
      kybStatus: "pending",
    });
    expect((await findGuildByEmail("mixed@case.com"))?.customerId).toBe("cus_9");
  });

  it("updates kyb status, wallet id + address", async () => {
    const g = await seedGuild();
    await updateGuild(g.id, {
      kybStatus: "active",
      walletId: "wal_1",
      walletAddress: "0xabc",
      usdAccountId: "acc_1",
    });
    const after = (await findGuildById(g.id))!;
    expect(after.kybStatus).toBe("active");
    expect(after.walletId).toBe("wal_1");
    expect(after.walletAddress).toBe("0xabc");
    expect(after.usdAccountId).toBe("acc_1");
  });
});

describe("ledger repo", () => {
  it("computes balance as confirmed deposits minus confirmed payouts", async () => {
    const g = await seedGuild();
    await addLedgerEntry({ guildId: g.id, kind: "deposit", amount: "2.00", txId: "tx_d1", status: "confirmed" });
    await addLedgerEntry({ guildId: g.id, kind: "deposit", amount: "2.00", txId: "tx_d2", status: "confirmed" });
    await addLedgerEntry({ guildId: g.id, kind: "payout", amount: "1.00", txId: "tx_p1", status: "confirmed" });
    const bal = await getBalance(g.id);
    expect(bal.usdc).toBe("3.00");
    expect(bal.usd).toBe("3.00"); // USDC ~ USD 1:1
  });

  it("excludes non-confirmed entries from balance but keeps them in activity", async () => {
    const g = await seedGuild();
    await addLedgerEntry({ guildId: g.id, kind: "deposit", amount: "2.00", txId: "tx_d1", status: "confirmed" });
    await addLedgerEntry({ guildId: g.id, kind: "payout", amount: "1.00", txId: "tx_p1", status: "pending" });
    expect((await getBalance(g.id)).usdc).toBe("2.00");
    expect(await listLedger(g.id)).toHaveLength(2);
  });

  it("confirms a pending payout so it counts against balance", async () => {
    const g = await seedGuild();
    await addLedgerEntry({ guildId: g.id, kind: "deposit", amount: "2.00", txId: "tx_d1", status: "confirmed" });
    const p = await addLedgerEntry({ guildId: g.id, kind: "payout", amount: "1.00", txId: "tx_p1", status: "pending" });
    await updateLedgerStatus(p.id, "completed");
    expect((await getBalance(g.id)).usdc).toBe("1.00");
  });

  it("scopes balance + activity to a single guild", async () => {
    const g1 = await seedGuild();
    const g2 = await createGuild({ email: "c@d.com", passwordHash: "h", name: "Y", customerId: "cus_2", applicationId: "app_2", kybStatus: "active" });
    await addLedgerEntry({ guildId: g1.id, kind: "deposit", amount: "2.00", txId: "tx_a", status: "confirmed" });
    await addLedgerEntry({ guildId: g2.id, kind: "deposit", amount: "2.00", txId: "tx_b", status: "confirmed" });
    expect((await getBalance(g1.id)).usdc).toBe("2.00");
    expect(await listLedger(g2.id)).toHaveLength(1);
  });

  it("lists activity newest first", async () => {
    const g = await seedGuild();
    await addLedgerEntry({ guildId: g.id, kind: "deposit", amount: "2.00", txId: "old", status: "confirmed" });
    await addLedgerEntry({ guildId: g.id, kind: "payout", amount: "1.00", txId: "new", status: "confirmed" });
    const rows = await listLedger(g.id);
    expect(rows[0].txId).toBe("new");
    expect(rows[1].txId).toBe("old");
  });
});
