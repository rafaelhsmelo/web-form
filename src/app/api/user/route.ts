import { NextResponse } from "next/server";
import { findUser, getRegistro } from "@/lib/storage";
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
    !("userId" in body) ||
    typeof body.userId !== "string" ||
    body.userId.trim().length === 0
  ) {
    return Response.json(
      { error: "Informe um userId válido." },
      { status: 400 },
    );
  }

  try {
    const userId = body.userId.trim();
    const userInfo = await findUser(userId);

    if (!userInfo) {
      return Response.json({ error: "userId inválido." }, { status: 404 });
    }

    const perguntas = loadQuestionsFromCSV(userInfo.formId);

    if (perguntas.length === 0) {
      return Response.json(
        {
          error: `Nenhuma pergunta está configurada para o Formulário "${userInfo.formId}".`,
        },
        { status: 500 },
      );
    }

    const registro = await getRegistro(userId);

    const response = NextResponse.json({
      userId,
      formId: userInfo.formId,
      status: registro?.status ?? "NAO_INICIADO",
      currentStep: registro?.currentStep ?? 0,
      answers: registro?.answers ?? {},
      perguntas,
    });
    response.cookies.set("userId", userId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
    return response;
  } catch (error) {
    console.error("Falha ao validar userId:", error);
    return Response.json(
      { error: "Não foi possível acessar o formulário agora." },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ message: "Sessão encerrada." });
  response.cookies.delete("userId");
  return response;
}
