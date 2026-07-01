import "server-only";
import bcrypt from "bcryptjs";

export const hashPassword = (pw: string): Promise<string> => bcrypt.hash(pw, 10);
export const verifyPassword = (pw: string, hash: string): Promise<boolean> =>
  bcrypt.compare(pw, hash);
