import "server-only";

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

export function getServerEnv() {
  return {
    dakotaApiKey: required("DAKOTA_API_KEY"),
    sessionSecret: required("SESSION_SECRET"),
    dbPath: process.env.DATABASE_PATH ?? "./guildpay.db",
  };
}
