import { questionarios } from "@/data/questions";
import { discardProgress, findToken, saveProgress } from "@/lib/storage";

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

function isAnswers(value: unknown): value is Record<string, string> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.values(value).every((answer) => typeof answer === "string")
  );
}

export async function PUT(request: Request) {
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
    body.token.trim().length === 0 ||
    !("answers" in body) ||
    !isAnswers(body.answers) ||
    !("currentStep" in body) ||
    typeof body.currentStep !== "number" ||
    !Number.isInteger(body.currentStep) ||
    body.currentStep < 0
  ) {
    return Response.json(
      { error: "Token, respostas ou etapa atual inválidos." },
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

  if (body.currentStep >= perguntas.length) {
    return Response.json({ error: "Etapa atual inválida." }, { status: 400 });
  }

  for (const [questionId, answerId] of Object.entries(body.answers)) {
    const pergunta = perguntas.find((item) => item.id === questionId);
    if (!pergunta || !pergunta.options.some((option) => option.id === answerId)) {
      return Response.json(
        { error: "Uma ou mais respostas não pertencem ao questionário." },
        { status: 400 },
      );
    }
  }

  try {
    const registro = await saveProgress(token, body.answers, body.currentStep);
    return Response.json({ registro });
  } catch (error) {
    if (error instanceof Error && error.message === "Questionário já finalizado") {
      return Response.json({ error: error.message }, { status: 409 });
    }
    throw error;
  }
}
