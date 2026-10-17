import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  getNewAdminSessionValue,
  isAdminKeyConfigured,
  isValidAdminKey,
} from "@/lib/adminAuth";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "O corpo da requisição deve conter um JSON válido." },
      { status: 400 },
    );
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !("adminKey" in body) ||
    typeof body.adminKey !== "string" ||
    body.adminKey.trim().length === 0
  ) {
    return Response.json(
      { error: "Informe uma chave administrativa válida." },
      { status: 400 },
    );
  }

  if (!isAdminKeyConfigured()) {
    return Response.json(
      { error: "A autenticação administrativa não está configurada." },
      { status: 503 },
    );
  }

  if (!isValidAdminKey(body.adminKey.trim())) {
    return Response.json(
      { error: "A autenticação não foi realizada. Verifique a chave informada." },
      { status: 401 },
    );
  }

  const response = NextResponse.json({ message: "Autenticação realizada." });
  response.cookies.set(ADMIN_SESSION_COOKIE, getNewAdminSessionValue(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  return response;
}
