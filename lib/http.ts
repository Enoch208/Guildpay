import { ZodError } from "zod";
import { UnauthorizedError, KybNotActiveError } from "@/lib/auth/session";

/** A business error carrying an explicit HTTP status (e.g. 409 conflict, 422 rejected). */
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function statusForError(e: unknown): number {
  if (e instanceof ApiError) return e.status;
  if (e instanceof ZodError) return 400;
  if (e instanceof UnauthorizedError) return 401;
  if (e instanceof KybNotActiveError) return 403;
  return 500;
}

export function jsonError(e: unknown): Response {
  const message =
    e instanceof ZodError
      ? e.issues.map((i) => i.message).join("; ")
      : e instanceof Error
        ? e.message
        : "Unexpected error";
  return Response.json({ error: message }, { status: statusForError(e) });
}

export const ok = (data: unknown, status = 200): Response =>
  Response.json(data, { status });
