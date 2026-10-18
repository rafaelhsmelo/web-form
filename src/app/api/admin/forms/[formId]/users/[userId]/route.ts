import { NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/adminAuth";
import { turso } from "@/lib/turso";

type RouteContext = {
  params: Promise<{ formId: string; userId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  if (!(await hasAdminSession())) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { formId, userId } = await context.params;
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
    !("name" in body) ||
    typeof body.name !== "string"
  ) {
    return NextResponse.json(
      { error: "Informe um nome válido." },
      { status: 400 },
    );
  }

  const name = body.name.trim();
  if (name.length === 0 || name.length > 120) {
    return NextResponse.json(
      { error: "O nome deve ter entre 1 e 120 caracteres." },
      { status: 400 },
    );
  }

  let result;
  try {
    result = await turso.execute({
      sql: "UPDATE users SET name = ? WHERE userId = ? AND formId = ?",
      args: [name, userId, formId],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message.toLowerCase() : "";
    if (message.includes("no such column") && message.includes("name")) {
      return NextResponse.json(
        {
          error:
            "A coluna name ainda não existe na tabela users. Execute a migração do banco antes de editar nomes.",
        },
        { status: 503 },
      );
    }
    throw error;
  }

  if (result.rowsAffected === 0) {
    return NextResponse.json(
      { error: "Usuário não encontrado neste formulário." },
      { status: 404 },
    );
  }

  return NextResponse.json({ name });
}

export async function DELETE(request: Request, context: RouteContext) {
  if (!(await hasAdminSession())) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { formId, userId } = await context.params;
  const user = await turso.execute({
    sql: "SELECT userId FROM users WHERE userId = ? AND formId = ?",
    args: [userId, formId],
  });

  if (user.rows.length === 0) {
    return NextResponse.json(
      { error: "Usuário não encontrado neste formulário." },
      { status: 404 },
    );
  }

  await turso.execute({
    sql: "DELETE FROM respostas WHERE userId = ?",
    args: [userId],
  });
  await turso.execute({
    sql: "DELETE FROM users WHERE userId = ? AND formId = ?",
    args: [userId, formId],
  });

  return NextResponse.json({ message: "Usuário excluído." });
}
