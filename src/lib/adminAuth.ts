import { createHmac, timingSafeEqual } from "node:crypto";
import path from "node:path";
import { cookies } from "next/headers";

export const ADMIN_SESSION_COOKIE = "adminSession";

let envFileLoaded = false;

function getAdminToken(): string | null {
  if (!envFileLoaded) {
    try {
      process.loadEnvFile(path.join(process.cwd(), "env.local"));
    } catch (error) {
      if (
        !(error instanceof Error) ||
        !("code" in error) ||
        error.code !== "ENOENT"
      ) {
        throw error;
      }
    }
    envFileLoaded = true;
  }

  const token = process.env.ADMIN_KEY;
  return token?.trim() ? token.trim() : null;
}

export function isAdminTokenConfigured(): boolean {
  return getAdminToken() !== null;
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
    throw new Error("A chave ADMIN_KEY não está configurada.");
  }
  return createAdminSessionValue(token);
}
