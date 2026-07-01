import { cn } from "@/lib/utils";

/**
 * Asset-free wordmark: an ink badge with the brand initial + the name.
 * Swap the badge for a <Image src="/img/logo.png" .../> later if you add a logo asset.
 */
export function Logo({
  className,
  showWordmark = true,
  name = "Rosterpay",
}: {
  className?: string;
  showWordmark?: boolean;
  name?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        aria-hidden
        className="grid place-items-center w-8 h-8 rounded-[8px] bg-[#09090B] text-white text-sm font-bold"
      >
        {name.charAt(0)}
      </span>
      {showWordmark && (
        <span className="text-lg font-semibold tracking-tight text-zinc-900">
          {name}
        </span>
      )}
    </span>
  );
}
