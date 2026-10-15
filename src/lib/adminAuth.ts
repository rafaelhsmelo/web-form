import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_SESSION_COOKIE = "adminSession";

function getAdminToken(): string | null {
  const token = process.env.ADMIN_TOKEN;
  return token?.trim() ? token.trim() : null;
}

function valuesMatch(first: string, second: string): boolean {
  const firstBuffer = Buffer.from(first);
  const secondBuffer = Buffer.from(second);
  return (
    firstBuffer.length === secondBuffer.length &&
    timingSafeEqual(firstBuffer, secondBuffer)
  );
}

export function isValidAdminToken(token: string): boolean {
  const configuredToken = getAdminToken();
  return configuredToken !== null && valuesMatch(token, configuredToken);
}

function createAdminSessionValue(token: string): string {
  return createHmac("sha256", token)
    .update("web-form-admin-session")
    .digest("hex");
}

export function isValidAdminSession(value: string | undefined): boolean {
  const token = getAdminToken();
  return token !== null && value !== undefined &&
    valuesMatch(value, createAdminSessionValue(token));
}

export async function hasAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  return isValidAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
}

export function getNewAdminSessionValue(): string {
  const token = getAdminToken();
  if (!token) {
    throw new Error("A variável ADMIN_TOKEN não está configurada.");
  }
  return createAdminSessionValue(token);
}
