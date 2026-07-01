import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/auth/passwords";
import { checkPayoutPolicy } from "@/lib/compliance";
import { onboardSchema, loginSchema, depositSchema, payoutSchema } from "@/lib/validation";

describe("passwords", () => {
  it("hashes and verifies a password", async () => {
    const h = await hashPassword("hunter2pass");
    expect(h).not.toBe("hunter2pass");
    expect(await verifyPassword("hunter2pass", h)).toBe(true);
    expect(await verifyPassword("wrong", h)).toBe(false);
  });
});

describe("checkPayoutPolicy", () => {
  it("allows small amounts cleanly", () => {
    expect(checkPayoutPolicy("500.00")).toEqual({ allowed: true, requiresReview: false });
  });
  it("flags amounts over 1000 for review", () => {
    expect(checkPayoutPolicy("2500.00")).toMatchObject({ allowed: true, requiresReview: true });
  });
  it("blocks amounts over 10000", () => {
    expect(checkPayoutPolicy("15000.00")).toMatchObject({ allowed: false });
  });
  it("rejects non-positive amounts", () => {
    expect(checkPayoutPolicy("0").allowed).toBe(false);
    expect(checkPayoutPolicy("-5").allowed).toBe(false);
  });
});

describe("validation schemas", () => {
  it("accepts a valid payout", () => {
    expect(
      payoutSchema.safeParse({
        playerName: "Ace",
        amount: "1.00",
        bankName: "Chase",
        accountHolderName: "Ace Carter",
        accountNumber: "000123456789",
        routingNumber: "021000021",
      }).success,
    ).toBe(true);
  });
  it("rejects a bad amount format", () => {
    expect(
      payoutSchema.safeParse({
        playerName: "Ace",
        amount: "abc",
        bankName: "Chase",
        accountHolderName: "Ace",
        accountNumber: "1",
        routingNumber: "1",
      }).success,
    ).toBe(false);
  });
  it("requires guild name + email + password on onboard", () => {
    expect(onboardSchema.safeParse({}).success).toBe(false);
    expect(
      onboardSchema.safeParse({
        guildName: "Team Nova",
        email: "gm@teamnova.gg",
        password: "supersecret",
        ein: "88-1234567",
        line1: "1 Esports Way",
        city: "Austin",
        state: "TX",
        postalCode: "78701",
      }).success,
    ).toBe(true);
  });
  it("validates login + deposit", () => {
    expect(loginSchema.safeParse({ email: "gm@teamnova.gg", password: "x" }).success).toBe(true);
    expect(depositSchema.safeParse({ amount: "2.00" }).success).toBe(true);
    expect(depositSchema.safeParse({ amount: "nope" }).success).toBe(false);
  });
});
