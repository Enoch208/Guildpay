/** Domain DTOs returned by the Dakota wrappers (decoupled from raw SDK shapes). */

export type OnboardResult = {
  customerId: string;
  applicationId: string;
  applicationUrl: string;
};

export type TreasuryProvision = {
  walletId: string;
  walletAddress: string;
  usdAccountId: string;
};

export type PayoutView = {
  id: string;
  status: string;
  amount: string;
  playerName: string;
  sendAmount?: string;
};

/** Sandbox constants (Part C verified recipe). */
export const NETWORK_ID = "ethereum-sepolia" as const;
export const STABLECOIN = "USDC" as const;
/** Sandbox caps a single transfer at $2 — deposits use $2, payouts $1. */
export const SANDBOX_MAX_TRANSFER = 2;
