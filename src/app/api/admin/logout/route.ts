import { NextResponse } from "next/server";

// Remove o cookie que mantém o administrador conectado.
import { ADMIN_SESSION_COOKIE } from "@/lib/adminAuth";

export async function POST() {
  const response = NextResponse.json({ message: "Sessão encerrada." });
  response.cookies.delete(ADMIN_SESSION_COOKIE);
  return response;
}
