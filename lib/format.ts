/** Format a decimal string / number as USD, e.g. "1234.5" -> "$1,234.50". */
export function fmtUsd(v: string | number): string {
  const n = Number(v);
  return `$${(Number.isFinite(n) ? n : 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Format a decimal string / number as a USDC amount, e.g. "3" -> "3.00 USDC". */
export function fmtUsdc(v: string | number): string {
  const n = Number(v);
  return `${(Number.isFinite(n) ? n : 0).toFixed(2)} USDC`;
}

/** Map a ledger/transaction status onto the three StatusPill states. */
export function toPillStatus(status: string): "completed" | "pending" | "failed" {
  if (status === "completed" || status === "confirmed") return "completed";
  if (["failed", "cancelled", "reversed", "returned"].includes(status)) return "failed";
  return "pending";
}

export function shortAddress(addr?: string | null): string {
  if (!addr) return "—";
  return addr.length > 14 ? `${addr.slice(0, 8)}…${addr.slice(-4)}` : addr;
}
