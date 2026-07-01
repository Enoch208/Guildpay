import { redirect } from "next/navigation";
import {
  requireActiveGuild,
  UnauthorizedError,
  KybNotActiveError,
} from "@/lib/auth/session";
import { getBalance } from "@/lib/db/ledger";
import { Topbar } from "@/components/dashboard/topbar";
import { PayoutForm } from "@/components/payout-form";

export const dynamic = "force-dynamic";

export default async function PayoutPage() {
  let guild;
  try {
    guild = await requireActiveGuild();
  } catch (e) {
    if (e instanceof UnauthorizedError || e instanceof KybNotActiveError) redirect("/login");
    throw e;
  }

  const balance = await getBalance(guild.id);

  return (
    <>
      <Topbar title="Pay a player" guildName={guild.name} email={guild.email} />
      <PayoutForm initialBalance={balance} />
    </>
  );
}
