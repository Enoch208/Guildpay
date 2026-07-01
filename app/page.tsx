import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { findGuildById } from "@/lib/db/guilds";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await getSession();
  const guild = session.guildId ? findGuildById(session.guildId) : undefined;
  if (guild && guild.kybStatus === "active") redirect("/dashboard");
  redirect("/login");
}
