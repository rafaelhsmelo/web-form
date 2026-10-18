import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import AdminUserExport from "@/components/AdminUserExport";
import AdminUserId from "@/components/AdminUserId";
import AdminUserName from "@/components/AdminUserName";
import { hasAdminSession } from "@/lib/adminAuth";
import { getFinalizedUserSubmission } from "@/lib/storage";
import { loadQuestionsFromCSV } from "@/utils/loadQuestions";

type UserDetailsPageProps = {
  params: Promise<{ formId: string; userId: string }>;
};

export default async function UserDetailsPage({
  params,
}: UserDetailsPageProps) {
  if (!(await hasAdminSession())) {
    redirect("/");
  }

  const { formId, userId } = await params;
  const submission = await getFinalizedUserSubmission(formId, userId);

  if (!submission) {
    notFound();
  }

  const questions = loadQuestionsFromCSV(formId);
  const formName = formId === "villa-piauhy" ? "Villa Piauhy" : formId;

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12">
      <section className="mx-auto w-full max-w-4xl rounded-xl bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500">Respostas do usuário</p>
            <h1 className="text-3xl font-semibold text-gray-800">
              {submission.name ?? "Nome não informado"}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-500">
              <span>userId:</span>
              <AdminUserId formId={formId} userId={submission.userId} />
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-500">
              <span>Nome:</span>
              <AdminUserName
                formId={formId}
                userId={submission.userId}
                initialName={submission.name}
              />
            </div>
            <p className="text-sm text-gray-500">Formulário: {formName}</p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <AdminUserExport
              formId={formId}
              userId={submission.userId}
            />
            <Link
              href={`/admin/forms/${encodeURIComponent(formId)}`}
              className="rounded-full border border-gray-300 px-5 py-2 font-medium text-gray-700"
            >
              Voltar
            </Link>
          </div>
        </div>

        <div className="mb-8 grid gap-4 rounded-lg bg-gray-50 p-4 text-sm text-gray-600 sm:grid-cols-2">
          <p>
            <span className="font-medium text-gray-800">Status:</span> Concluído
          </p>
          <p>
            <span className="font-medium text-gray-800">Enviado em:</span>{" "}
            {new Date(submission.finalizedAt).toLocaleString("pt-BR", {
              timeZone: "UTC",
            })}
          </p>
        </div>

        <div className="space-y-5">
          {questions.map((question) => {
            const answerId = submission.answers[question.id];
            const answer =
              question.options.find((option) => option.id === answerId)
                ?.label ?? answerId ?? "Não respondida";

            return (
              <article
                key={question.id}
                className="border-b border-gray-100 pb-5 last:border-0"
              >
                <h2 className="font-medium text-gray-800">{question.title}</h2>
                {question.subtitle && (
                  <p className="mt-1 text-sm text-gray-500">
                    {question.subtitle}
                  </p>
                )}
                <p className="mt-2 text-gray-700">{answer}</p>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
