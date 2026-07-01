/**
 * Guildpay payout compliance gate — an amount-threshold policy enforced in-line
 * before a payout hits Dakota rails. Pure + unit-tested.
 */
export type PolicyResult = {
  allowed: boolean;
  requiresReview: boolean;
  reason?: string;
};

const REVIEW_THRESHOLD = 1_000;
const HARD_CAP = 10_000;

export function checkPayoutPolicy(amount: string): PolicyResult {
  const n = Number(amount);
  if (!Number.isFinite(n) || n <= 0) {
    return { allowed: false, requiresReview: false, reason: "Amount must be a positive number" };
  }
  if (n > HARD_CAP) {
    return { allowed: false, requiresReview: false, reason: `Exceeds the $${HARD_CAP.toLocaleString()} single-payout cap` };
  }
  if (n > REVIEW_THRESHOLD) {
    return { allowed: true, requiresReview: true, reason: `Amounts over $${REVIEW_THRESHOLD.toLocaleString()} are flagged for review` };
  }
  return { allowed: true, requiresReview: false };
}
