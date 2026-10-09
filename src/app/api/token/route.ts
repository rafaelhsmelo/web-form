import { questionarios } from "@/data/questions";
import { findToken, getRegistro } from "@/lib/storage";

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
      { error: "Informe um token válido." },
      { status: 400 },
    );
  }

  const token = body.token.trim();
  const tokenInfo = await findToken(token);

  if (!tokenInfo) {
    return Response.json({ error: "Token inválido." }, { status: 404 });
  }

  const perguntas = questionarios[tokenInfo.questionarioId];

  if (!perguntas) {
    return Response.json(
      { error: "O questionário associado ao token não está configurado." },
      { status: 500 },
    );
  }

  const registro = await getRegistro(token);

  return Response.json({
    token,
    questionarioId: tokenInfo.questionarioId,
    status: registro?.status ?? "NAO_INICIADO",
    currentStep: registro?.currentStep ?? 0,
    answers: registro?.answers ?? {},
    perguntas,
  });
}
