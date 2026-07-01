import "server-only";
import { DakotaClient, Environment } from "@dakota-xyz/ts-sdk";
import { getServerEnv } from "@/lib/env";

let client: DakotaClient | undefined;

/** Singleton Dakota sandbox client. Server-only — the API key never reaches the browser. */
export function getDakota(): DakotaClient {
  if (!client) {
    client = new DakotaClient({
      apiKey: getServerEnv().dakotaApiKey,
      environment: Environment.Sandbox,
    });
  }
  return client;
}
