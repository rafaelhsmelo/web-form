import { NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/adminAuth";
import { turso } from "@/lib/turso";
import { validateUserId, validateUserName } from "@/lib/validation";
import { loadFormIdsFromCSV } from "@/utils/loadQuestions";

type RouteContext = {
  params: Promise<{ formId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  if (!(await hasAdminSession())) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { formId } = await context.params;
  if (!loadFormIdsFromCSV().includes(formId)) {
    return NextResponse.json(
      { error: "Formulário não encontrado." },
      { status: 404 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "O corpo da requisição deve conter um JSON válido." },
      { status: 400 },
    );
  }

  if (
    typeof body !== "object" ||
    body === null ||
    Array.isArray(body)
  ) {
    return NextResponse.json(
      { error: "Informe um userId válido." },
      { status: 400 },
    );
  }

  const payload = body as Record<string, unknown>;
  if (
    typeof payload.userId !== "string" ||
    (payload.name !== undefined && typeof payload.name !== "string")
  ) {
    return NextResponse.json(
      { error: "Informe um userId válido e, opcionalmente, um nome." },
      { status: 400 },
    );
  }

  const userId = payload.userId.trim();
  const name = typeof payload.name === "string" ? payload.name.trim() : null;
  const userIdError = validateUserId(userId);
  if (userIdError) {
    return NextResponse.json(
      { error: userIdError },
      { status: 400 },
    );
  }
  const nameError = name === null ? null : validateUserName(name);
  if (nameError) {
    return NextResponse.json(
      { error: nameError },
      { status: 400 },
    );
  }

  const existingUser = await turso.execute({
    sql: "SELECT userId FROM users WHERE userId = ? AND formId = ?",
    args: [userId, formId],
  });
  if (existingUser.rows.length > 0) {
    return NextResponse.json(
      { error: "Já existe um usuário com este userId no formulário." },
      { status: 409 },
    );
  }

  try {
    await turso.execute({
      sql: "INSERT INTO users (userId, formId, name) VALUES (?, ?, ?)",
      args: [userId, formId, name || null],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message.toLowerCase() : "";
    if (message.includes("no such column") && message.includes("name")) {
      return NextResponse.json(
        {
          error:
            "A coluna name ainda não existe na tabela users. Execute a migração do banco antes de adicionar usuários.",
        },
        { status: 503 },
      );
    }
    throw error;
  }

  return NextResponse.json({ userId, name: name || null }, { status: 201 });
}
