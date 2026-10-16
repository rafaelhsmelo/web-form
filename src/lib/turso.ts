// src/lib/turso.ts
import { createClient } from "@libsql/client";

export function getTursoClient() {
  if (!process.env.TURSO_DATABASE_URL) {
    throw new Error("Variável TURSO_DATABASE_URL ausente no .env.local");
  }
  
  return createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN as string,
  });
}