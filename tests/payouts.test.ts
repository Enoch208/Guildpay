import { describe, it, expect, vi } from "vitest";
import { sendPayout, getPayoutStatus } from "@/lib/dakota/payouts";

function fakeClient() {
  return {
    recipients: { create: vi.fn(async () => ({ id: "rec_1", name: "Ace", status: "active" })) },
    destinations: {
      create: vi
        .fn()
        .mockResolvedValueOnce({ id: "dest_fiat" }) // fiat_us bank destination
        .mockResolvedValueOnce({ id: "dest_fund" }), // crypto funding destination
    },
    transactions: {
      create: vi.fn(async () => ({ id: "tx_1", status: "pending", crypto_address: "0xdead", send_amount: "1.01" })),
      get: vi.fn(async () => ({ id: "tx_1", status: "completed", amount: "1.00", destination_account_holder_name: "Ace Carter" })),
    },
    accounts: { create: vi.fn(async () => ({ id: "ona_fund" })) },
    sandbox: { simulateInbound: vi.fn(async () => ({ state: "accepted" })) },
  };
}

const player = {
  name: "Ace Carter",
  bankName: "Chase Bank",
  accountHolderName: "Ace Carter",
  accountNumber: "000123456789",
  routingNumber: "021000021",
};

describe("sendPayout", () => {
  it("creates recipient (with address) -> fiat destination -> one-off USDC->USD ACH tx", async () => {
    const c = fakeClient();
    const r = await sendPayout(c as never, { customerId: "cus_1", player, amount: "1.00" });

    expect(c.recipients.create).toHaveBeenCalledWith(
      "cus_1",
      expect.objectContaining({ name: "Ace Carter", address: expect.objectContaining({ country: "US" }) }),
    );
    expect(c.destinations.create).toHaveBeenNthCalledWith(
      1,
      "rec_1",
      expect.objectContaining({
        destination_type: "fiat_us",
        bank_name: "Chase Bank",
        account_holder_name: "Ace Carter",
        account_number: "000123456789",
        aba_routing_number: "021000021",
        account_type: "checking",
      }),
    );
    expect(c.transactions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        customer_id: "cus_1",
        source_asset: "USDC",
        source_network_id: "ethereum-sepolia",
        destination_id: "dest_fiat",
        destination_asset: "USD",
        destination_payment_rail: "ach",
        amount: "1.00",
      }),
    );
    expect(r).toMatchObject({ id: "tx_1", status: "pending", amount: "1.00", playerName: "Ace Carter", sendAmount: "1.01" });
  });

  it("funds the one-off tx by routing an on-ramp into its crypto_address", async () => {
    const c = fakeClient();
    await sendPayout(c as never, { customerId: "cus_1", player, amount: "1.00" });

    // 2nd destination is the crypto funding address = tx.crypto_address
    expect(c.destinations.create).toHaveBeenNthCalledWith(
      2,
      "rec_1",
      expect.objectContaining({ destination_type: "crypto", crypto_address: "0xdead", network_id: "ethereum-sepolia" }),
    );
    expect(c.accounts.create).toHaveBeenCalledWith(
      expect.objectContaining({ account_type: "onramp", crypto_destination_id: "dest_fund", source_asset: "USD", destination_asset: "USDC" }),
    );
    expect(c.sandbox.simulateInbound).toHaveBeenCalledWith(
      expect.objectContaining({ type: "ach_inbound", account_id: "ona_fund", amount: "1.00", currency: "USD" }),
    );
  });
});

describe("getPayoutStatus", () => {
  it("reads the transaction status", async () => {
    const c = fakeClient();
    const r = await getPayoutStatus(c as never, "tx_1");
    expect(r.status).toBe("completed");
    expect(r.playerName).toBe("Ace Carter");
  });
});
