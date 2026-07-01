import { describe, it, expect, vi } from "vitest";
import { provisionTreasury, simulateDeposit } from "@/lib/dakota/treasury";

function fakeClient() {
  return {
    signers: { create: vi.fn(async () => ({ id: "sig_1" })) },
    signerGroups: { create: vi.fn(async () => ({ id: "grp_1" })) },
    wallets: { create: vi.fn(async () => ({ id: "wal_1", address: "0xabc" })) },
    recipients: {
      list: vi.fn(() => ({ toArray: async () => [{ id: "rec_treasury" }] })),
    },
    destinations: { create: vi.fn(async () => ({ id: "dest_1" })) },
    accounts: { create: vi.fn(async () => ({ id: "acc_1" })) },
    sandbox: { simulateInbound: vi.fn(async () => ({ state: "accepted" })) },
  };
}

describe("treasury provisioning", () => {
  it("creates signer -> signer group -> evm wallet, then a USD on-ramp to the wallet", async () => {
    const c = fakeClient();
    const r = await provisionTreasury(c as never, "cus_1");

    // signer (ES256 P-256 key) -> group with that key -> wallet attached to the group
    expect(c.signers.create).toHaveBeenCalledWith(
      expect.objectContaining({ key_type: "ES256", public_key: expect.any(String) }),
    );
    const memberKey = (c.signers.create.mock.calls[0][0] as { public_key: string }).public_key;
    expect(c.signerGroups.create).toHaveBeenCalledWith(
      expect.objectContaining({ member_keys: [memberKey] }),
    );
    expect(c.wallets.create).toHaveBeenCalledWith(
      expect.objectContaining({ customer_id: "cus_1", signer_groups: ["grp_1"], policies: [], family: "evm" }),
    );

    // on-ramp: crypto destination at the wallet address -> onramp account (USD -> USDC)
    expect(c.recipients.list).toHaveBeenCalledWith("cus_1");
    expect(c.destinations.create).toHaveBeenCalledWith(
      "rec_treasury",
      expect.objectContaining({ destination_type: "crypto", crypto_address: "0xabc", network_id: "ethereum-sepolia" }),
    );
    expect(c.accounts.create).toHaveBeenCalledWith(
      expect.objectContaining({
        account_type: "onramp",
        crypto_destination_id: "dest_1",
        source_asset: "USD",
        destination_asset: "USDC",
        destination_network_id: "ethereum-sepolia",
        rail: "us_bank_account",
        capabilities: ["ach"],
      }),
    );

    expect(r).toEqual({ walletId: "wal_1", walletAddress: "0xabc", usdAccountId: "acc_1" });
  });
});

describe("simulateDeposit", () => {
  it("fires an ach_inbound against the guild's on-ramp account (settles USD -> USDC)", async () => {
    const c = fakeClient();
    await simulateDeposit(c as never, { usdAccountId: "acc_1", amount: "2.00" });
    expect(c.sandbox.simulateInbound).toHaveBeenCalledWith(
      expect.objectContaining({ type: "ach_inbound", account_id: "acc_1", amount: "2.00", currency: "USD" }),
    );
    // unique simulation id
    const arg = c.sandbox.simulateInbound.mock.calls[0][0] as { simulation_id: string };
    expect(arg.simulation_id).toBeTruthy();
  });
});
