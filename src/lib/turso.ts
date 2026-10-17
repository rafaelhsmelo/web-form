import { createClient } from "@libsql/client";
import path from "node:path";

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

const databaseUrl = process.env.TURSO_DATABASE_URL;
const authKey =
  process.env.TURSO_AUTH_KEY?.trim() ||
  process.env.TURSO_AUTH_TOKEN?.trim();

if (!databaseUrl) {
  throw new Error("Variável TURSO_DATABASE_URL ausente no arquivo de ambiente.");
}

if (!authKey) {
  throw new Error(
    "Variável TURSO_AUTH_KEY (ou TURSO_AUTH_TOKEN) ausente no arquivo de ambiente.",
  );
}

export const turso = createClient({
  url: databaseUrl,
  authToken: authKey,
});