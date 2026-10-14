import { finalize, getRegistro } from "@/lib/storage";
import { getAuthenticatedToken } from "@/lib/auth";
import { loadQuestionsFromCSV } from "@/utils/loadQuestions";

export async function POST() {
  const token = await getAuthenticatedToken();
  if (!token) {
    return Response.json({ error: "Sessão inválida." }, { status: 401 });
  }

  const perguntas = loadQuestionsFromCSV();
  if (perguntas.length === 0) {
    return Response.json(
      { error: "Nenhuma pergunta está configurada." },
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
