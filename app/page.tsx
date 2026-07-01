import { getSession } from "@/lib/auth/session";
import { findGuildById } from "@/lib/db/guilds";

import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Features } from "@/components/landing/features";
import { RealRails } from "@/components/landing/real-rails";
import { Security } from "@/components/landing/security";
import { Stats } from "@/components/landing/stats";
import { Faq } from "@/components/landing/faq";
import { Cta } from "@/components/landing/cta";
import { Footer } from "@/components/landing/footer";
import { Reveal } from "@/components/ui/reveal";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await getSession();
  const guild = session.guildId ? findGuildById(session.guildId) : undefined;
  const loggedIn = Boolean(guild && guild.kybStatus === "active");

  return (
    <main className="relative z-10 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[88rem] flex flex-col gap-5 sm:gap-6">
        <Hero loggedIn={loggedIn} />
        <Reveal>
          <HowItWorks />
        </Reveal>
        <Reveal>
          <Features />
        </Reveal>
        <Reveal>
          <RealRails />
        </Reveal>
        <Reveal>
          <Security />
        </Reveal>
        <Reveal>
          <Stats />
        </Reveal>
        <Reveal>
          <Faq />
        </Reveal>
        <Reveal>
          <Cta loggedIn={loggedIn} />
        </Reveal>
        <Reveal>
          <Footer />
        </Reveal>
      </div>
    </main>
  );
}
