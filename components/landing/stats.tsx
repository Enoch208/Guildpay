import { BentoCard } from "@/components/ui/bento-card";

const stats = [
  {
    value: "active",
    title: "KYB in seconds",
    body: "Guilds clear KYB and open a treasury in seconds on the sandbox — the gate for every transfer.",
    gradient: "from-emerald-400/40 to-emerald-200/0",
    halo: "shadow-[0_0_60px_-15px_rgba(16,185,129,0.45)]",
  },
  {
    value: "1:1",
    title: "USD + USDC",
    body: "Hold both in one treasury. Deposits settle USD → USDC; payouts convert USDC → USD ACH.",
    gradient: "from-violet-400/40 to-violet-200/0",
    halo: "shadow-[0_0_60px_-15px_rgba(139,92,246,0.45)]",
  },
  {
    value: "40",
    title: "Tests, green",
    body: "A unit-tested integration layer plus a live end-to-end run verified against the sandbox.",
    gradient: "from-orange-400/40 to-orange-200/0",
    halo: "shadow-[0_0_60px_-15px_rgba(249,115,22,0.45)]",
  },
];

export function Stats() {
  return (
    <BentoCard className="p-6 sm:p-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10 items-end">
        <h2 className="lg:col-span-7 text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-zinc-900 leading-[1.05]">
          Proven end to end,
          <br />
          on real rails.
        </h2>
        <p className="lg:col-span-5 text-sm sm:text-base font-medium text-gray-500 leading-relaxed max-w-md">
          Onboard → KYB active → deposit settles → payout completes — verified live, not
          claimed. These aren&rsquo;t vanity metrics; they&rsquo;re what the build actually does.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {stats.map((s) => (
          <div key={s.title} className="group space-y-4">
            <div
              className={`relative aspect-[4/3] rounded-[1.75rem] overflow-hidden ${s.halo} flex items-center justify-center bg-white border border-gray-100 transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:-translate-y-1`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${s.gradient}`} />
              <div className="absolute inset-3 rounded-[1.5rem] bg-white/85 backdrop-blur-sm shadow-[inset_0_1px_0_0_rgba(255,255,255,1)]" />
              <span className="relative text-4xl sm:text-5xl font-semibold tracking-tight text-zinc-900 transition-transform duration-500 group-hover:scale-105">
                {s.value}
              </span>
            </div>
            <div className="space-y-1.5">
              <div className="text-base font-semibold tracking-tight text-zinc-900">{s.title}</div>
              <p className="text-sm font-medium text-gray-500 leading-snug">{s.body}</p>
            </div>
          </div>
        ))}
      </div>
    </BentoCard>
  );
}
