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
    Array.isArray(body)
  ) {
    return NextResponse.json(
      { error: "Informe um nome ou userId válido." },
      { status: 400 },
    );
  }

  const payload = body as Record<string, unknown>;
  const hasName = "name" in payload;
  const hasUserId = "userId" in payload;
  if (
    (hasName && typeof payload.name !== "string") ||
    (hasUserId && typeof payload.userId !== "string") ||
    (!hasName && !hasUserId)
  ) {
    return NextResponse.json(
      { error: "Informe um nome ou userId válido." },
      { status: 400 },
    );
  }

  if (hasName) {
    const name = (payload.name as string).trim();
    if (name.length === 0 || name.length > 120) {
      return NextResponse.json(
        { error: "O nome deve ter entre 1 e 120 caracteres." },
        { status: 400 },
      );
    }

    return updateUserName(formId, userId, name);
  }

  const newUserId = (payload.userId as string).trim();
  if (newUserId.length === 0 || newUserId.length > 120) {
    return NextResponse.json(
      { error: "O userId deve ter entre 1 e 120 caracteres." },
      { status: 400 },
    );
  }
  if (newUserId === userId) {
    return NextResponse.json({ userId });
  }

  const existingUser = await turso.execute({
    sql: "SELECT userId FROM users WHERE userId = ? AND formId = ?",
    args: [newUserId, formId],
  });
  if (existingUser.rows.length > 0) {
    return NextResponse.json(
      { error: "Já existe um usuário com este userId no formulário." },
      { status: 409 },
    );
  }

  const transaction = await turso.transaction("write");
  let result;
  try {
    await transaction.execute({
      sql: "UPDATE respostas SET userId = ? WHERE userId = ?",
      args: [newUserId, userId],
    });
    result = await transaction.execute({
      sql: "UPDATE users SET userId = ? WHERE userId = ? AND formId = ?",
      args: [newUserId, userId, formId],
    });
    if (result.rowsAffected === 0) {
      await transaction.rollback();
      return NextResponse.json(
        { error: "Usuário não encontrado neste formulário." },
        { status: 404 },
      );
    }
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }

  return NextResponse.json({ userId: newUserId });
}

async function updateUserName(formId: string, userId: string, name: string) {
  try {
    const result = await turso.execute({
      sql: "UPDATE users SET name = ? WHERE userId = ? AND formId = ?",
      args: [name, userId, formId],
    });
    if (result.rowsAffected === 0) {
      return NextResponse.json(
        { error: "Usuário não encontrado neste formulário." },
        { status: 404 },
      );
    }
    return NextResponse.json({ name });
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
