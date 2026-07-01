import "server-only";
import { randomUUID } from "node:crypto";
import type { DakotaClient } from "@dakota-xyz/ts-sdk";
import type { OnboardResult } from "./types";

/** The narrow slice of the client these functions use, so tests can inject a fake. */
type C = Pick<DakotaClient, "customers" | "sandbox">;

/** Create a guild as a Dakota business customer. Names are unique per client, so callers
 *  should pass a de-duplicated name; `externalId` ties it back to our own record. */
export async function onboardGuild(
  client: C,
  input: { name: string; externalId: string },
): Promise<OnboardResult> {
  const r = await client.customers.create({
    name: input.name,
    customer_type: "business",
    external_id: input.externalId,
  });
  return {
    customerId: r.id,
    applicationId: r.application_id,
    applicationUrl: r.application_url,
  };
}

/** Drive KYB to active in the sandbox: approve the application, then activate the applicant. */
export async function approveKyb(client: C, applicationId: string): Promise<void> {
  await client.sandbox.simulateOnboarding({
    type: "kyb_approve",
    applicant_id: applicationId,
    simulation_id: `kyb_${randomUUID()}`,
  });
  await client.sandbox.simulateOnboarding({
    type: "applicant_activate",
    applicant_id: applicationId,
    simulation_id: `act_${randomUUID()}`,
  });
}

export async function getKybStatus(client: C, customerId: string): Promise<string> {
  return (await client.customers.get(customerId)).kyb_status;
}
