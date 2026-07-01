import { describe, it, expect, beforeEach } from "vitest";
import { getServerEnv } from "@/lib/env";

describe("getServerEnv", () => {
  beforeEach(() => {
    process.env.DAKOTA_API_KEY = "k";
    process.env.SESSION_SECRET = "x".repeat(32);
    process.env.DATABASE_PATH = "./t.db";
  });

  it("returns typed env values", () => {
    expect(getServerEnv()).toEqual({
      dakotaApiKey: "k",
      sessionSecret: "x".repeat(32),
      dbPath: "./t.db",
    });
  });

  it("defaults dbPath when DATABASE_PATH is unset", () => {
    delete process.env.DATABASE_PATH;
    expect(getServerEnv().dbPath).toBe("./guildpay.db");
  });

  it("throws when a required var is missing", () => {
    delete process.env.DAKOTA_API_KEY;
    expect(() => getServerEnv()).toThrow(/DAKOTA_API_KEY/);
  });
});
