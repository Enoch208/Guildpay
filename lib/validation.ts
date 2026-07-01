import { z } from "zod";

const decimal = z
  .string()
  .regex(/^\d+(\.\d{1,2})?$/, "Must be a decimal amount like 100.00");

export const onboardSchema = z.object({
  guildName: z.string().min(2),
  email: z.email(),
  password: z.string().min(8),
  ein: z.string().min(2),
  line1: z.string().min(2),
  city: z.string().min(1),
  state: z.string().min(2),
  postalCode: z.string().min(3),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export const depositSchema = z.object({
  amount: decimal,
  asset: z.enum(["USDC", "USD"]).default("USDC"),
});

export const payoutSchema = z.object({
  playerName: z.string().min(1),
  amount: decimal,
  bankName: z.string().min(1),
  accountHolderName: z.string().min(1),
  accountNumber: z.string().min(1),
  routingNumber: z.string().min(1),
});

export type OnboardInput = z.infer<typeof onboardSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type DepositInput = z.infer<typeof depositSchema>;
export type PayoutInput = z.infer<typeof payoutSchema>;
