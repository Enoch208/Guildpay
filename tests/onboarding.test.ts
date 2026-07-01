import { describe, it, expect, vi } from "vitest";
import { onboardGuild, approveKyb, getKybStatus } from "@/lib/dakota/onboarding";

function fakeClient() {
  return {
    customers: {
      create: vi.fn(async () => ({
        id: "cus_1",
        application_id: "app_1",
        application_url: "https://apply/x",
      })),
      get: vi.fn(async () => ({ id: "cus_1", kyb_status: "active" })),
    },
    sandbox: { simulateOnboarding: vi.fn(async () => ({})) },
  };
}

describe("onboarding wrapper", () => {
  it("creates a business customer and returns ids", async () => {
    const c = fakeClient();
    const r = await onboardGuild(c as never, { name: "Team Nova", externalId: "ext_1" });
    expect(c.customers.create).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Team Nova", customer_type: "business", external_id: "ext_1" }),
    );
    expect(r).toEqual({ customerId: "cus_1", applicationId: "app_1", applicationUrl: "https://apply/x" });
  });

  it("drives KYB via kyb_approve then applicant_activate", async () => {
    const c = fakeClient();
    await approveKyb(c as never, "app_1");
    const types = c.sandbox.simulateOnboarding.mock.calls.map((call) => (call[0] as { type: string }).type);
    expect(types).toEqual(["kyb_approve", "applicant_activate"]);
    // each simulation_id must be unique (idempotency)
    const ids = c.sandbox.simulateOnboarding.mock.calls.map((call) => (call[0] as { simulation_id: string }).simulation_id);
    expect(new Set(ids).size).toBe(2);
  });

  it("reads kyb status", async () => {
    const c = fakeClient();
    expect(await getKybStatus(c as never, "cus_1")).toBe("active");
  });
});
