import { questionarios } from "@/data/questions";
import { finalize, findToken, getRegistro } from "@/lib/storage";

function isTokenBody(value: unknown): value is { token: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    "token" in value &&
    typeof value.token === "string" &&
    value.token.trim().length > 0
  );
}

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

  if (!isTokenBody(body)) {
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
  if (!registro || registro.status !== "EM_PREENCHIMENTO") {
    return Response.json(
      { error: "Não há um questionário em preenchimento para enviar." },
      { status: 409 },
    );
  }

  const todasRespondidas = perguntas.every((pergunta) =>
    pergunta.options.some(
      (opcao) => opcao.id === registro.answers[pergunta.id],
    ),
  );
  const respostasPertencemAoQuestionario = Object.entries(
    registro.answers,
  ).every(([questionId, answerId]) =>
    perguntas.some(
      (pergunta) =>
        pergunta.id === questionId &&
        pergunta.options.some((opcao) => opcao.id === answerId),
    ),
  );

  if (!todasRespondidas || !respostasPertencemAoQuestionario) {
    return Response.json(
      { error: "Responda todas as perguntas antes de enviar." },
      { status: 400 },
    );
  }

  try {
    const registroFinalizado = await finalize(token);
    return Response.json({ registro: registroFinalizado });
  } catch (error) {
    if (error instanceof Error && error.message === "Já finalizado") {
      return Response.json({ error: error.message }, { status: 409 });
    }
    throw error;
  }
}
