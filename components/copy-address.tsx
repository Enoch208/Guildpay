"use client";

import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Copy01Icon, CheckmarkCircle01Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

/** Monospace address chip with a copy button. */
export function CopyAddress({ address, className }: { address: string; className?: string }) {
  const [copied, setCopied] = React.useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      title="Copy address"
      className={cn(
        "cursor-pointer group inline-flex items-center gap-2 rounded-full bg-gray-50 border border-gray-100 pl-3 pr-2.5 py-1.5",
        "text-xs font-medium text-zinc-700 hover:bg-gray-100 transition-colors max-w-full",
        className,
      )}
    >
      <span className="font-mono truncate">{address}</span>
      <HugeiconsIcon
        icon={copied ? CheckmarkCircle01Icon : Copy01Icon}
        size={14}
        strokeWidth={2}
        className={cn("shrink-0", copied ? "text-emerald-600" : "text-gray-400 group-hover:text-zinc-700")}
      />
    </button>
  );
}
