import { discardProgress, findToken } from "@/lib/storage";

export async function DELETE(request: Request) {
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
      { error: "Informe um token válido." },
      { status: 400 },
    );
  }

  const token = body.token.trim();
  const tokenInfo = await findToken(token);

  if (!tokenInfo) {
    return Response.json({ error: "Token inválido." }, { status: 404 });
  }

  try {
    await discardProgress(token);
  } catch (error) {
    if (error instanceof Error && error.message === "Questionário já finalizado") {
      return Response.json({ error: error.message }, { status: 409 });
    }
    throw error;
  }

  return Response.json({ message: "Progresso descartado." });
}
