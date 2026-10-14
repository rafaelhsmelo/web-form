import { cookies } from "next/headers";
import { findToken } from "@/lib/storage";

export async function getAuthenticatedToken(): Promise<string | null> {
  const token = (await cookies()).get("questionnaireToken")?.value;
  if (!token) {
    return null;
  }
  return (await findToken(token)) ? token : null;
}
