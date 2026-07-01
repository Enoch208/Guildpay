import { describe, it, expect } from "vitest";
import { z } from "zod";
import { statusForError, ApiError } from "@/lib/http";
import { UnauthorizedError, KybNotActiveError } from "@/lib/auth/session";

describe("statusForError", () => {
  it("maps auth errors to 401/403", () => {
    expect(statusForError(new UnauthorizedError())).toBe(401);
    expect(statusForError(new KybNotActiveError())).toBe(403);
  });
  it("maps zod validation errors to 400", () => {
    const err = z.object({ a: z.string() }).safeParse({}).error;
    expect(statusForError(err)).toBe(400);
  });
  it("honors an explicit ApiError status", () => {
    expect(statusForError(new ApiError("Email already registered", 409))).toBe(409);
    expect(statusForError(new ApiError("Insufficient balance", 422))).toBe(422);
  });
  it("defaults to 500", () => {
    expect(statusForError(new Error("boom"))).toBe(500);
  });
});
