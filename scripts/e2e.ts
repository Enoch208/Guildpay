/**
 * Live end-to-end happy path against the Dakota sandbox — the contest verification bar,
 * driven headlessly through the same lib/dakota wrappers the app uses.
 *
 * Run:  npm run e2e   (needs DAKOTA_API_KEY in .env.local)
 * It uses the verified recipe (docs/recording-brief.md Part C).
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { DakotaClient, Environment } from "@dakota-xyz/ts-sdk";
import { randomUUID } from "node:crypto";
import { onboardGuild, approveKyb, getKybStatus } from "../lib/dakota/onboarding";
import { provisionTreasury, simulateDeposit } from "../lib/dakota/treasury";
import { sendPayout, getPayoutStatus } from "../lib/dakota/payouts";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const step = (msg: string) => console.log(`\n▶ ${msg}`);
const okLine = (msg: string) => console.log(`  ✅ ${msg}`);

async function main() {
  const apiKey = process.env.DAKOTA_API_KEY;
  if (!apiKey) throw new Error("DAKOTA_API_KEY missing — put your sandbox key in frontend/.env.local");
  const client = new DakotaClient({ apiKey, environment: Environment.Sandbox });

  // 1) KYB-gated onboarding -> active
  step("Onboarding a guild + driving KYB to active");
  const externalId = randomUUID();
  const { customerId, applicationId } = await onboardGuild(client, {
    name: `E2E Guild ${externalId.slice(0, 6)}`,
    externalId,
  });
  okLine(`customer ${customerId}`);
  await approveKyb(client, applicationId);
  let kyb = "pending";
  for (let i = 0; i < 20; i++) {
    kyb = await getKybStatus(client, customerId);
    if (kyb === "active") break;
    await sleep(1500);
  }
  if (kyb !== "active") throw new Error(`KYB never reached active (last: ${kyb})`);
  okLine("KYB active");

  // 2) Provision treasury (signer -> group -> wallet + USD on-ramp)
  step("Provisioning treasury (wallet + USD on-ramp)");
  const treasury = await provisionTreasury(client, customerId);
  okLine(`wallet ${treasury.walletId} @ ${treasury.walletAddress}`);
  okLine(`on-ramp ${treasury.usdAccountId}`);

  // 3) Deposit $2 (USD ACH -> settles to USDC)
  step("Simulating a $2.00 sponsor deposit");
  await simulateDeposit(client, { usdAccountId: treasury.usdAccountId, amount: "2.00" });
  okLine("ach_inbound accepted (USD -> USDC)");
  await sleep(2000);

  // 4) Pay a player $1 and watch it reach completed
  step("Paying a player $1.00 (USDC -> USD ACH) and polling to completed");
  const payout = await sendPayout(client, {
    customerId,
    amount: "1.00",
    player: {
      name: "Ace Carter",
      bankName: "Chase Bank",
      accountHolderName: "Ace Carter",
      accountNumber: "000123456789",
      routingNumber: "021000021",
    },
  });
  okLine(`payout ${payout.id} created (status: ${payout.status})`);

  let status = payout.status;
  for (let i = 0; i < 40; i++) {
    const v = await getPayoutStatus(client, payout.id);
    status = v.status;
    console.log(`  … status[${i}] = ${status}`);
    if (["completed", "failed", "cancelled", "reversed", "returned"].includes(status)) break;
    await sleep(3000);
  }
  if (status !== "completed") throw new Error(`Payout did not complete (last: ${status})`);
  okLine("payout completed");

  console.log("\n🎉 END-TO-END PASS — onboarding→active, deposit settled, payout completed.");
}

main().catch((e) => {
  console.error(`\n❌ E2E FAILED: ${e instanceof Error ? e.message : e}`);
  process.exit(1);
});
