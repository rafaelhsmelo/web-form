import Papa from "papaparse";
import { hasAdminSession } from "@/lib/adminAuth";
import { getFinalizedSubmissions } from "@/lib/storage";
import { loadQuestionsFromCSV, type Question } from "@/utils/loadQuestions";

type QuestionColumn = {
  header: string;
  questionarioId: string;
  questionId: string;
  optionLabels: Map<string, string>;
};

export async function GET() {
  if (!(await hasAdminSession())) {
    return Response.json(
      { error: "Acesso administrativo não autorizado." },
      { status: 401 },
    );
  }

  const submissions = await getFinalizedSubmissions();
  if (submissions.length === 0) {
    return Response.json(
      { error: "Não há formulários finalizados disponíveis para exportação." },
      { status: 404 },
    );
  }

  const columnsByField = new Map<string, QuestionColumn>();
  const questionsByQuestionnaire = new Map<string, Question[]>();

  for (const submission of submissions) {
    let questions = questionsByQuestionnaire.get(submission.questionarioId);
    if (!questions) {
      questions = loadQuestionsFromCSV(submission.questionarioId);
      questionsByQuestionnaire.set(submission.questionarioId, questions);
    }

    for (const question of questions) {
      const field = `${submission.questionarioId}:${question.id}`;
      if (!columnsByField.has(field)) {
        columnsByField.set(field, {
          header: `Pergunta (${submission.questionarioId}/${question.id}): ${question.title}`,
          questionarioId: submission.questionarioId,
          questionId: question.id,
          optionLabels: new Map(
            question.options.map((option) => [option.id, option.label]),
          ),
        });
      }
    }

    for (const questionId of Object.keys(submission.answers)) {
      const field = `${submission.questionarioId}:${questionId}`;
      if (!columnsByField.has(field)) {
        columnsByField.set(field, {
          header: `Resposta (${submission.questionarioId}/${questionId})`,
          questionarioId: submission.questionarioId,
          questionId,
          optionLabels: new Map(),
        });
      }
    }
  }

  const columns = [...columnsByField.values()];
  const fields = [
    "Token",
    "ID do questionário",
    "Data de envio",
    ...columns.map((column) => column.header),
  ];
  const data = submissions.map((submission) => [
    submission.token,
    submission.questionarioId,
    submission.finalizedAt,
    ...columns.map((column) => {
      if (column.questionarioId !== submission.questionarioId) return "";
      const answerId = submission.answers[column.questionId];
      return answerId
        ? column.optionLabels.get(answerId) ?? answerId
        : "";
    }),
  ]);
  const csv = Papa.unparse({ fields, data });
  const filename = `formularios-encaminhados-${new Date()
    .toISOString()
    .slice(0, 10)}.csv`;

  return new Response(`\uFEFF${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
