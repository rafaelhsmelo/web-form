import { NextResponse } from "next/server";
import { findToken, getRegistro } from "@/lib/storage";
import { loadQuestionsFromCSV } from "@/utils/loadQuestions";

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

  const perguntas = loadQuestionsFromCSV(tokenInfo.questionarioId);

  if (perguntas.length === 0) {
    return Response.json(
      {
        error: `Nenhuma pergunta está configurada para o questionário "${tokenInfo.questionarioId}".`,
      },
      { status: 500 },
    );
  }

  const registro = await getRegistro(token);

  const response = NextResponse.json({
    token,
    questionarioId: tokenInfo.questionarioId,
    status: registro?.status ?? "NAO_INICIADO",
    currentStep: registro?.currentStep ?? 0,
    answers: registro?.answers ?? {},
    perguntas,
  });
  response.cookies.set("questionnaireToken", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ message: "Sessão encerrada." });
  response.cookies.delete("questionnaireToken");
  return response;
}
