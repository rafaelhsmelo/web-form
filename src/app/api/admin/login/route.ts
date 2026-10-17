import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  getNewAdminSessionValue,
  isAdminTokenConfigured,
  isValidAdminToken,
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
    !("token" in body) ||
    typeof body.token !== "string" ||
    body.token.trim().length === 0
  ) {
    return Response.json(
      { error: "Informe um token administrativo válido." },
      { status: 400 },
    );
  }

  if (!isAdminTokenConfigured()) {
    return Response.json(
      { error: "A autenticação administrativa não está configurada." },
      { status: 503 },
    );
  }

  if (!isValidAdminToken(body.token.trim())) {
    return Response.json(
      { error: "A autenticação não foi realizada. Verifique o token informado." },
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
