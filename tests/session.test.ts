import { describe, it, expect } from "vitest";
import {
  resolveGuard,
  UnauthorizedError,
  KybNotActiveError,
} from "@/lib/auth/session";
import type { Guild } from "@/lib/db/guilds";

const activeGuild = { id: "g1", kybStatus: "active" } as Guild;

describe("resolveGuard", () => {
  it("throws Unauthorized when there is no guild", () => {
    expect(() => resolveGuard(undefined, { requireActive: false })).toThrow(
      UnauthorizedError,
    );
  });

  it("returns the guild when present and active not required", () => {
    expect(resolveGuard(activeGuild, { requireActive: false })).toBe(activeGuild);
  });

  it("throws KybNotActive when inactive and active is required", () => {
    const pending = { id: "g", kybStatus: "pending" } as Guild;
    expect(() => resolveGuard(pending, { requireActive: true })).toThrow(
      KybNotActiveError,
    );
  });

  it("returns the guild when active and active is required", () => {
    expect(resolveGuard(activeGuild, { requireActive: true })).toBe(activeGuild);
  });
});
