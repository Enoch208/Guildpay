import { describe, it, expect, beforeEach, vi } from "vitest";
import { closeDb } from "@/lib/db";
import { createGuild } from "@/lib/db/guilds";
import { addLedgerEntry, listLedger, getBalance } from "@/lib/db/ledger";
import { reconcilePendingPayouts } from "@/lib/guild-service";

beforeEach(() => {
  process.env.DAKOTA_API_KEY = "k";
  process.env.SESSION_SECRET = "x".repeat(32);
  process.env.DATABASE_PATH = ":memory:";
  closeDb();
});

function seed() {
  const g = createGuild({
    email: "a@b.com",
    passwordHash: "h",
    name: "Team Nova",
    customerId: "cus_1",
    applicationId: "app_1",
    kybStatus: "active",
  });
  addLedgerEntry({ guildId: g.id, kind: "deposit", amount: "2.00", txId: "dep_1", status: "confirmed" });
  return g;
}

function fakeClient(status: string) {
  return {
    transactions: {
      get: vi.fn(async () => ({ id: "tx_1", status, amount: "1.00", destination_account_holder_name: "Ace" })),
    },
  };
}

describe("reconcilePendingPayouts", () => {
  it("flips a pending payout to completed when Dakota reports completed (and deducts balance)", async () => {
    const g = seed();
    addLedgerEntry({ guildId: g.id, kind: "payout", amount: "1.00", txId: "tx_1", status: "pending" });
    expect(getBalance(g.id).usdc).toBe("2.00"); // pending payout doesn't yet count

    await reconcilePendingPayouts(fakeClient("completed") as never, g.id);

    expect(listLedger(g.id).find((e) => e.txId === "tx_1")!.status).toBe("completed");
    expect(getBalance(g.id).usdc).toBe("1.00");
  });

  it("marks a returned/failed payout as failed (balance untouched)", async () => {
    const g = seed();
    addLedgerEntry({ guildId: g.id, kind: "payout", amount: "1.00", txId: "tx_1", status: "pending" });

    await reconcilePendingPayouts(fakeClient("returned") as never, g.id);

    expect(listLedger(g.id).find((e) => e.txId === "tx_1")!.status).toBe("failed");
    expect(getBalance(g.id).usdc).toBe("2.00");
  });

  it("leaves a still-in-flight payout pending", async () => {
    const g = seed();
    addLedgerEntry({ guildId: g.id, kind: "payout", amount: "1.00", txId: "tx_1", status: "pending" });

    await reconcilePendingPayouts(fakeClient("processing") as never, g.id);

    expect(listLedger(g.id).find((e) => e.txId === "tx_1")!.status).toBe("pending");
  });

  it("only queries pending payouts — ignores deposits and settled payouts", async () => {
    const g = seed();
    addLedgerEntry({ guildId: g.id, kind: "payout", amount: "1.00", txId: "tx_done", status: "completed" });
    const client = fakeClient("completed");

    await reconcilePendingPayouts(client as never, g.id);

    // no pending payouts -> Dakota never queried
    expect(client.transactions.get).not.toHaveBeenCalled();
  });
});
