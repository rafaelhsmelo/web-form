import { createHmac, timingSafeEqual } from "node:crypto";
import path from "node:path";
import { cookies } from "next/headers";

export const ADMIN_SESSION_COOKIE = "adminSession";

let envFileLoaded = false;

function getAdminKey(): string | null {
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

  const adminKey = process.env.ADMIN_KEY;
  return adminKey?.trim() ? adminKey.trim() : null;
}

export function isAdminKeyConfigured(): boolean {
  return getAdminKey() !== null;
}

function valuesMatch(first: string, second: string): boolean {
  const firstBuffer = Buffer.from(first);
  const secondBuffer = Buffer.from(second);
  return (
    firstBuffer.length === secondBuffer.length &&
    timingSafeEqual(firstBuffer, secondBuffer)
  );
}

export function isValidAdminKey(adminKey: string): boolean {
  const configuredKey = getAdminKey();
  return configuredKey !== null && valuesMatch(adminKey, configuredKey);
}

function createAdminSessionValue(adminKey: string): string {
  return createHmac("sha256", adminKey)
    .update("web-form-admin-session")
    .digest("hex");
}

export function isValidAdminSession(value: string | undefined): boolean {
  const adminKey = getAdminKey();
  return adminKey !== null && value !== undefined &&
    valuesMatch(value, createAdminSessionValue(adminKey));
}

export async function hasAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  return isValidAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
}

export function getNewAdminSessionValue(): string {
  const adminKey = getAdminKey();
  if (!adminKey) {
    throw new Error("A chave ADMIN_KEY não está configurada.");
  }
  return createAdminSessionValue(adminKey);
}
