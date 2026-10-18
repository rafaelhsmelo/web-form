import Papa from "papaparse";

// Monta o CSV de uma única pessoa do formulário.
import { hasAdminSession } from "@/lib/adminAuth";
import { getFinalizedUserSubmission } from "@/lib/storage";
import { loadQuestionsFromCSV } from "@/utils/loadQuestions";

type RouteContext = {
  params: Promise<{ formId: string; userId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  if (!(await hasAdminSession())) {
    return Response.json(
      { error: "Acesso administrativo não autorizado." },
      { status: 401 },
    );
  }

  const { formId, userId } = await context.params;
  const submission = await getFinalizedUserSubmission(formId, userId);

  if (!submission) {
    return Response.json(
      { error: "Este usuário ainda não possui respostas finalizadas." },
      { status: 404 },
    );
  }

  const questions = loadQuestionsFromCSV(formId);
  const fields = [
    "userId",
    "Nome",
    "formId",
    "Data de envio",
    ...questions.map((question) => question.title),
  ];
  const data = [
    submission.userId,
    submission.name ?? "",
    submission.formId,
    submission.finalizedAt,
    ...questions.map((question) => {
      const answerId = submission.answers[question.id];
      if (!answerId) {
        return "";
      }
      return (
        question.options.find((option) => option.id === answerId)?.label ??
        answerId
      );
    }),
  ];
  const csv = Papa.unparse({ fields, data: [data] });
  const filename = `${formId}-${userId}-respostas.csv`;

  return new Response(`\uFEFF${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
