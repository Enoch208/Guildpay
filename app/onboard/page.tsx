"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Shield01Icon } from "@hugeicons/core-free-icons";

import { AuthShell } from "@/components/auth/auth-shell";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";

const INITIAL = {
  guildName: "",
  email: "",
  password: "",
  ein: "88-1234567",
  line1: "1 Esports Way",
  city: "Austin",
  state: "TX",
  postalCode: "78701",
};

export default function OnboardPage() {
  const router = useRouter();
  const [form, setForm] = React.useState(INITIAL);
  const [phase, setPhase] = React.useState<"form" | "verifying">("form");
  const [error, setError] = React.useState<string | null>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function pollUntilActive() {
    for (let i = 0; i < 20; i++) {
      const res = await fetch("/api/onboard/status");
      if (res.ok) {
        const data = await res.json();
        if (data.kybStatus === "active") {
          router.push("/dashboard");
          router.refresh();
          return;
        }
      }
      await new Promise((r) => setTimeout(r, 2000));
    }
    setError("KYB is taking longer than expected. Try signing in shortly.");
    setPhase("form");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPhase("verifying");
    try {
      const res = await fetch("/api/onboard", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Onboarding failed");
      if (data.kybStatus === "active") {
        router.push("/dashboard");
        router.refresh();
        return;
      }
      await pollUntilActive();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Onboarding failed");
      setPhase("form");
    }
  }

  return (
    <main className="min-h-screen flex flex-col p-4 sm:p-6 lg:p-8">
      <AuthShell
        brand="Guildpay"
        panelHeadline="Onboard your guild in minutes, not weeks."
        title="Create your guild"
        subtitle="Submit your business details — we'll run KYB and open your treasury."
        footer={
          <p className="text-sm font-medium text-gray-500">
            Already onboarded?{" "}
            <Link href="/login" className="text-zinc-900 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        }
      >
        {phase === "verifying" ? (
          <div className="flex flex-col items-center text-center gap-4 py-6">
            <span className="flex items-center justify-center w-14 h-14 rounded-[1.25rem] bg-emerald-50 text-emerald-700 animate-pulse">
              <HugeiconsIcon icon={Shield01Icon} size={26} strokeWidth={2} />
            </span>
            <div>
              <p className="text-lg font-semibold tracking-tight text-zinc-900">Verifying KYB…</p>
              <p className="text-sm font-medium text-gray-500">
                Approving your business application and provisioning the treasury. This takes a few seconds.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-4">
            <Input label="Guild name" placeholder="Team Nova" value={form.guildName} onChange={set("guildName")} required />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Email" type="email" placeholder="gm@teamnova.gg" value={form.email} onChange={set("email")} required />
              <PasswordInput label="Password" placeholder="At least 8 characters" value={form.password} onChange={set("password")} required />
            </div>
            <Input label="EIN" value={form.ein} onChange={set("ein")} required />
            <Input label="Street address" value={form.line1} onChange={set("line1")} required />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input label="City" value={form.city} onChange={set("city")} required />
              <Input label="State" value={form.state} onChange={set("state")} required />
              <Input label="ZIP" value={form.postalCode} onChange={set("postalCode")} required />
            </div>

            {error && (
              <p className="rounded-2xl bg-rose-50 border border-rose-100 px-4 py-3 text-sm font-medium text-rose-700">
                {error}
              </p>
            )}

            <Button type="submit" size="lg" className="w-full">
              Create guild & run KYB
            </Button>
          </form>
        )}
      </AuthShell>
    </main>
  );
}
