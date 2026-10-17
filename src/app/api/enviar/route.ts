import { finalize, getRegistro } from "@/lib/storage";
import { getAuthenticatedUserInfo } from "@/lib/auth";
import { loadQuestionsFromCSV } from "@/utils/loadQuestions";

export async function POST() {
  const userInfo = await getAuthenticatedUserInfo();
  if (!userInfo) {
    return Response.json({ error: "Sessão inválida." }, { status: 401 });
  }

  const userId = userInfo.userId;
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
  if (!registro || registro.status !== "EM_PREENCHIMENTO") {
    return Response.json(
      { error: "Não há um Formulário em preenchimento para enviar." },
      { status: 409 },
    );
  }

  const todasRespondidas = perguntas.every((pergunta) =>
    pergunta.options.some(
      (opcao) => opcao.id === registro.answers[pergunta.id],
    ),
  );
  const respostasPertencemAoForm = Object.entries(
    registro.answers,
  ).every(([questionId, answerId]) =>
    perguntas.some(
      (pergunta) =>
        pergunta.id === questionId &&
        pergunta.options.some((opcao) => opcao.id === answerId),
    ),
  );

  if (!todasRespondidas || !respostasPertencemAoForm) {
    return Response.json(
      { error: "Responda todas as perguntas antes de enviar." },
      { status: 400 },
    );
  }

  try {
    const registroFinalizado = await finalize(userId);
    return Response.json({ registro: registroFinalizado });
  } catch (error) {
    if (error instanceof Error && error.message === "Já finalizado") {
      return Response.json({ error: error.message }, { status: 409 });
    }
    throw error;
  }
}
