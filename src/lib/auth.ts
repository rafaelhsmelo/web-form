import { cookies } from "next/headers";
import { findToken } from "@/lib/storage";
import type { TokenInfo } from "@/lib/types";

export async function getAuthenticatedTokenInfo(): Promise<TokenInfo | null> {
  const token = (await cookies()).get("questionnaireToken")?.value;
  if (!token) {
    return null;
  }
  return findToken(token);
}
