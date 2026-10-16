import { createClient } from "@libsql/client";

const databaseUrl = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!databaseUrl) {
  throw new Error("Variável TURSO_DATABASE_URL ausente no .env.local");
}

if (!authToken) {
  throw new Error("Variável TURSO_AUTH_TOKEN ausente no .env.local");
}

export const turso = createClient({
  url: databaseUrl,
  authToken,
});