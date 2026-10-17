import { cookies } from "next/headers";
import { findUser } from "@/lib/storage";
import type { UserInfo } from "@/lib/types";

export async function getAuthenticatedUserInfo(): Promise<UserInfo | null> {
  const userId = (await cookies()).get("userId")?.value;
  if (!userId) {
    return null;
  }
  return findUser(userId);
}
