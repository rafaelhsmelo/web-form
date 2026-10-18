import Papa from "papaparse";

// Exporta os envios finalizados para CSV, depois de conferir a sessão admin.
import { hasAdminSession } from "@/lib/adminAuth";
import { getFinalizedUserSubmissions } from "@/lib/storage";
import { loadQuestionsFromCSV, type Question } from "@/utils/loadQuestions";

type QuestionColumn = {
  header: string;
  formId: string;
  questionId: string;
  optionLabels: Map<string, string>;
};

export async function GET(request: Request) {
  if (!(await hasAdminSession())) {
    return Response.json(
      { error: "Acesso administrativo não autorizado." },
      { status: 401 },
    );
  }

  const formId = new URL(request.url).searchParams.get("formId");
  const allSubmissions = await getFinalizedUserSubmissions();
  const submissions = formId
    ? allSubmissions.filter((submission) => submission.formId === formId)
    : allSubmissions;
  if (submissions.length === 0) {
    return Response.json(
      { error: "Não há formulários finalizados disponíveis para exportação." },
      { status: 404 },
    );
  }

  const columnsByField = new Map<string, QuestionColumn>();
  const questionsByForm = new Map<string, Question[]>();

  for (const submission of submissions) {
    let questions = questionsByForm.get(submission.formId);
    if (!questions) {
      questions = loadQuestionsFromCSV(submission.formId);
      questionsByForm.set(submission.formId, questions);
    }

    for (const question of questions) {
      const field = `${submission.formId}:${question.id}`;
      if (!columnsByField.has(field)) {
        columnsByField.set(field, {
          header: question.title,
          formId: submission.formId,
          questionId: question.id,
          optionLabels: new Map(
            question.options.map((option) => [option.id, option.label]),
          ),
        });
      }
    }

    for (const questionId of Object.keys(submission.answers)) {
      const field = `${submission.formId}:${questionId}`;
      if (!columnsByField.has(field)) {
        columnsByField.set(field, {
          header: `Resposta (${questionId})`,
          formId: submission.formId,
          questionId,
          optionLabels: new Map(),
        });
      }
    }
  }

  const columns = [...columnsByField.values()];
  const fields = [
    "userId",
    "formId",
    "Data de envio",
    ...columns.map((column) => column.header),
  ];
  const data = submissions.map((submission) => [
    submission.userId,
    submission.formId,
    submission.finalizedAt,
    ...columns.map((column) => {
      if (column.formId !== submission.formId) return "";
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
