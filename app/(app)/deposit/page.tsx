import { redirect } from "next/navigation";
import {
  requireActiveGuild,
  UnauthorizedError,
  KybNotActiveError,
} from "@/lib/auth/session";
import { getBalance } from "@/lib/db/ledger";
import { Topbar } from "@/components/dashboard/topbar";
import { DepositForm } from "@/components/deposit-form";

export const dynamic = "force-dynamic";

export default async function DepositPage() {
  let guild;
  try {
    guild = await requireActiveGuild();
  } catch (e) {
    if (e instanceof UnauthorizedError || e instanceof KybNotActiveError) redirect("/login");
    throw e;
  }

  return (
    <>
      <Topbar title="Deposit" guildName={guild.name} email={guild.email} />
      <DepositForm walletAddress={guild.walletAddress} initialBalance={getBalance(guild.id)} />
    </>
  );
}
