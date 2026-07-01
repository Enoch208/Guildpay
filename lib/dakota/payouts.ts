import "server-only";
import { randomUUID } from "node:crypto";
import type {
  DakotaClient,
  CryptoDestinationRequest,
  FiatUSDestinationRequest,
} from "@dakota-xyz/ts-sdk";
import { NETWORK_ID, type PayoutView } from "./types";

type C = Pick<
  DakotaClient,
  "recipients" | "destinations" | "transactions" | "accounts" | "sandbox"
>;

export type Player = {
  name: string;
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  routingNumber: string;
};

/** Fiat recipients require an address; the payout form doesn't collect one, so we use a
 *  default US address (sandbox — no real funds move). */
const DEFAULT_ADDRESS = {
  street1: "1 Esports Way",
  city: "Austin",
  region: "Texas",
  postal_code: "78701",
  country: "US",
} as const;

const idOf = (r: { id?: string; destination_id?: string }): string =>
  r.id ?? r.destination_id!;

/**
 * Pay a player (Part C recipe — no wallet signing required):
 *   recipient(+address) -> fiat_us destination -> one-off USDC->USD ACH transfer,
 *   then fund the transfer by routing a USD on-ramp into its temporary crypto_address.
 * Poll `getPayoutStatus` until it reaches `completed`.
 */
export async function sendPayout(
  client: C,
  input: { customerId: string; player: Player; amount: string },
): Promise<PayoutView> {
  const { customerId, player, amount } = input;

  const recipient = await client.recipients.create(customerId, {
    name: player.name,
    address: { ...DEFAULT_ADDRESS },
  });

  const fiatDest: FiatUSDestinationRequest = {
    destination_type: "fiat_us",
    name: `${player.name} Bank`,
    bank_name: player.bankName,
    account_holder_name: player.accountHolderName,
    account_number: player.accountNumber,
    aba_routing_number: player.routingNumber,
    account_type: "checking",
  };
  const dest = await client.destinations.create(recipient.id, fiatDest);

  const tx = await client.transactions.create({
    customer_id: customerId,
    amount,
    source_asset: "USDC",
    source_network_id: NETWORK_ID,
    destination_id: idOf(dest),
    destination_asset: "USD",
    destination_payment_rail: "ach",
    payment_reference: "Guild payout",
  });

  // Fund the one-off transfer: deliver USDC to its temporary address via an on-ramp.
  const fundingDest: CryptoDestinationRequest = {
    destination_type: "crypto",
    name: "Payout funding",
    crypto_address: tx.crypto_address,
    network_id: NETWORK_ID,
  };
  const fundDest = await client.destinations.create(recipient.id, fundingDest);
  const fundOnramp = await client.accounts.create({
    account_type: "onramp",
    crypto_destination_id: idOf(fundDest),
    source_asset: "USD",
    destination_asset: "USDC",
    destination_network_id: NETWORK_ID,
    rail: "us_bank_account",
    capabilities: ["ach"],
  });
  await client.sandbox.simulateInbound({
    simulation_id: `fund_${randomUUID()}`,
    type: "ach_inbound",
    account_id: fundOnramp.id,
    amount,
    currency: "USD",
  });

  return {
    id: tx.id,
    status: tx.status,
    amount,
    playerName: player.name,
    sendAmount: tx.send_amount,
  };
}

export async function getPayoutStatus(client: C, txId: string): Promise<PayoutView> {
  const t = await client.transactions.get(txId);
  return {
    id: t.id,
    status: t.status,
    amount: t.amount ?? "",
    playerName: t.destination_account_holder_name ?? "",
    sendAmount: t.send_amount,
  };
}
