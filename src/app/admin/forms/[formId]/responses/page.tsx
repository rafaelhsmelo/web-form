import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import AdminFormExport from "@/components/AdminFormExport";
import CompiledResponsesTabs from "@/components/CompiledResponsesTabs";
import { hasAdminSession } from "@/lib/adminAuth";
import { getCompiledFormResponses } from "@/lib/storage";
import { loadFormIdsFromCSV, loadQuestionsFromCSV } from "@/utils/loadQuestions";

type CompiledResponsesPageProps = {
  params: Promise<{ formId: string }>;
};

export default async function CompiledResponsesPage({
  params,
}: CompiledResponsesPageProps) {
  if (!(await hasAdminSession())) {
    redirect("/");
  }

  const { formId } = await params;
  if (!loadFormIdsFromCSV().includes(formId)) {
    notFound();
  }

  const [questions, responses] = await Promise.all([
    Promise.resolve(loadQuestionsFromCSV(formId)),
    getCompiledFormResponses(formId),
  ]);
  const formName = formId === "villa-piauhy" ? "Villa Piauhy" : formId;

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:py-12">
      <section className="mx-auto w-full max-w-[calc(100vw-2rem)] rounded-xl bg-white p-5 shadow-sm sm:p-8">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500">Respostas compiladas</p>
            <h1 className="text-3xl font-semibold text-gray-800">{formName}</h1>
            <p className="mt-1 text-sm text-gray-500">{formId}</p>
            <p className="mt-2 text-sm text-gray-600">
              {responses.length} usuários · {questions.length} perguntas
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
            <AdminFormExport formId={formId} />
            <Link
              href="/admin"
              className="rounded-full border border-gray-300 px-5 py-2 font-medium text-gray-700"
            >
              Voltar
            </Link>
          </div>
        </div>

        {responses.length === 0 ? (
          <p className="py-8 text-center text-gray-500">
            Nenhum usuário cadastrado neste formulário.
          </p>
        ) : (
          <CompiledResponsesTabs
            questions={questions}
            responses={responses}
          />
        )}
      </section>
    </main>
  );
}
