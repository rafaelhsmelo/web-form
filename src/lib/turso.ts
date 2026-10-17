import { createClient } from "@libsql/client";

const databaseUrl = process.env.TURSO_DATABASE_URL;
const authKey = process.env.TURSO_AUTH_KEY;

if (!databaseUrl) {
  throw new Error("Variável TURSO_DATABASE_URL ausente no .env.local");
}

if (!authKey) {
  throw new Error("Variável TURSO_AUTH_KEY ausente no .env.local");
}

export const turso = createClient({
  url: databaseUrl,
  authToken: authKey,
});