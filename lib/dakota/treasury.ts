import "server-only";
import { generateKeyPairSync, randomUUID } from "node:crypto";
import type {
  DakotaClient,
  CryptoDestinationRequest,
} from "@dakota-xyz/ts-sdk";
import { NETWORK_ID, type TreasuryProvision } from "./types";

type C = Pick<
  DakotaClient,
  "signers" | "signerGroups" | "wallets" | "recipients" | "destinations" | "accounts" | "sandbox"
>;

/** ES256 (ECDSA P-256) public key as base64 SPKI/DER — the shape Dakota signers expect. */
function generateSignerPublicKey(): string {
  const { publicKey } = generateKeyPairSync("ec", { namedCurve: "prime256v1" });
  return (publicKey.export({ type: "spki", format: "der" }) as Buffer).toString("base64");
}

/**
 * Provision the guild's treasury (Part C recipe):
 *   signer -> signer group -> non-custodial EVM wallet,
 *   then a USD ACH on-ramp whose crypto destination is the wallet address
 *   (deposits arrive as USD and settle to USDC in the wallet).
 * `wallets.getBalances()` is Privy-gated in sandbox, so balance is tracked in our ledger.
 */
export async function provisionTreasury(client: C, customerId: string): Promise<TreasuryProvision> {
  const memberKey = generateSignerPublicKey();
  await client.signers.create({ name: "Treasury Signer", public_key: memberKey, key_type: "ES256" });
  const group = await client.signerGroups.create({ name: "Treasury Signers", member_keys: [memberKey] });
  const wallet = await client.wallets.create({
    customer_id: customerId,
    signer_groups: [group.id],
    policies: [],
    family: "evm",
    name: "Guild Treasury",
  });

  // The treasury recipient is auto-created when KYB is approved.
  const recipients = await client.recipients.list(customerId).toArray();
  const treasuryRecipientId = recipients[0].id;

  const cryptoDest: CryptoDestinationRequest = {
    destination_type: "crypto",
    name: "Treasury USDC",
    crypto_address: wallet.address,
    network_id: NETWORK_ID,
  };
  const dest = await client.destinations.create(treasuryRecipientId, cryptoDest);

  const onramp = await client.accounts.create({
    account_type: "onramp",
    crypto_destination_id: dest.id,
    source_asset: "USD",
    destination_asset: "USDC",
    destination_network_id: NETWORK_ID,
    rail: "us_bank_account",
    capabilities: ["ach"],
  });

  return { walletId: wallet.id, walletAddress: wallet.address, usdAccountId: onramp.id };
}

/** Simulate a sponsor/prize deposit: an ACH inbound into the guild's on-ramp account. */
export async function simulateDeposit(
  client: C,
  input: { usdAccountId: string; amount: string },
): Promise<void> {
  await client.sandbox.simulateInbound({
    simulation_id: `dep_${randomUUID()}`,
    type: "ach_inbound",
    account_id: input.usdAccountId,
    amount: input.amount,
    currency: "USD",
  });
}
