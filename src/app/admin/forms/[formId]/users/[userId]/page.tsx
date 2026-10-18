import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import AdminUserExport from "@/components/AdminUserExport";
import AdminUserId from "@/components/AdminUserId";
import AdminUserName from "@/components/AdminUserName";
import { hasAdminSession } from "@/lib/adminAuth";
import { getCompiledFormResponses, getFinalizedUserSubmission } from "@/lib/storage";
import { loadQuestionsFromCSV } from "@/utils/loadQuestions";
import {
  responseColors,
  splitIntoColumns,
} from "@/utils/responseDisplay";

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
  const [submission, compiledResponses] = await Promise.all([
    getFinalizedUserSubmission(formId, userId),
    getCompiledFormResponses(formId),
  ]);

  if (!submission) {
    notFound();
  }

  const questions = loadQuestionsFromCSV(formId);
  const formName = formId === "villa-piauhy" ? "Villa Piauhy" : formId;

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:py-12">
      <section className="mx-auto w-full max-w-6xl rounded-xl bg-white p-5 shadow-sm sm:p-8">
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
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
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

        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full min-w-[48rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-gray-600">
                <th scope="col" className="w-[38%] px-4 py-3 font-medium">
                  Pergunta
                </th>
                <th scope="col" className="w-[34%] px-4 py-3 font-medium">
                  Opções
                </th>
                <th scope="col" className="w-[28%] px-4 py-3 font-medium">
                  Resposta
                </th>
              </tr>
            </thead>
            <tbody>
          {questions.map((question) => {
            const answerId = submission.answers[question.id];
            const answer =
              question.options.find((option) => option.id === answerId)
                ?.label ?? answerId ?? "Não respondida";
            const counts = new Map<string, number>();
            compiledResponses.forEach((response) => {
              const responseAnswerId = response.answers[question.id];
              const value =
                question.options.find(
                  (option) => option.id === responseAnswerId,
                )?.label ?? "";
              if (value) {
                counts.set(value, (counts.get(value) ?? 0) + 1);
              }
            });
            const optionOrder = new Map(
              question.options.map((option, index) => [option.label, index]),
            );
            const segments = [...counts.entries()]
              .filter(([value]) => value)
              .sort(
                ([firstValue, firstCount], [secondValue, secondCount]) =>
                  secondCount - firstCount ||
                  (optionOrder.get(firstValue) ?? Number.MAX_SAFE_INTEGER) -
                    (optionOrder.get(secondValue) ?? Number.MAX_SAFE_INTEGER),
              );
            const orderedOptions = [...question.options]
              .map((option) => ({
                ...option,
                count: counts.get(option.label) ?? 0,
              }))
              .sort(
                (first, second) =>
                  second.count - first.count ||
                  (optionOrder.get(first.label) ?? Number.MAX_SAFE_INTEGER) -
                    (optionOrder.get(second.label) ?? Number.MAX_SAFE_INTEGER),
              );
            const optionColumns = splitIntoColumns(orderedOptions);
            const answerIndex = segments.findIndex(
              ([value]) => value === answer,
            );
            const answerColor =
              answer === "Não respondida"
                ? "bg-gray-400"
                : responseColors[
                    answerIndex >= 0
                      ? answerIndex % responseColors.length
                      : 0
                  ];
            const responseCount = Math.max(compiledResponses.length, 1);

            return (
              <tr
                key={question.id}
                className="border-b border-gray-100 align-top last:border-0"
              >
                <th scope="row" className="px-4 py-4 font-medium text-gray-800">
                  <span className="block break-words">{question.title}</span>
                  {question.subtitle && (
                    <span className="mt-1 block text-xs font-normal text-gray-500">
                      {question.subtitle}
                    </span>
                  )}
                  <div className="mt-3 flex h-7 w-full overflow-hidden rounded-full bg-gray-200">
                    {segments.map(([value, count], index) => (
                      <span
                        key={value}
                        className={`flex h-full min-w-0 items-center justify-center overflow-hidden px-1 text-xs font-medium text-white ${responseColors[index % responseColors.length]}`}
                        style={{
                          width: `${(count / responseCount) * 100}%`,
                        }}
                        title={`${value}: ${Math.round((count / responseCount) * 100)}%`}
                      >
                        <span className="truncate">
                          {Math.round((count / responseCount) * 100)}%
                        </span>
                      </span>
                    ))}
                  </div>
                </th>
                <td className="px-4 py-4">
                  <div className="grid grid-cols-2 gap-x-4">
                    {optionColumns.map((column, columnIndex) => (
                      <div key={columnIndex} className="min-w-0 space-y-2">
                        {column.map((option) => {
                          const selectedIndex = segments.findIndex(
                            ([value]) => value === option.label,
                          );
                          return (
                            <div
                              key={option.id}
                              className="flex min-w-0 items-start gap-2"
                              title={`${option.label}: ${Math.round((option.count / responseCount) * 100)}%`}
                            >
                              <span
                                className={`mt-1 h-3 w-3 shrink-0 rounded-sm ${
                                  option.count > 0
                                    ? responseColors[
                                        selectedIndex % responseColors.length
                                      ]
                                    : "border border-gray-400 bg-transparent"
                                }`}
                                aria-hidden="true"
                              />
                              <span className="line-clamp-2 break-words text-xs text-gray-700">
                                {option.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div
                    className="flex min-w-0 items-start gap-2 text-xs text-gray-700"
                    title={answer}
                  >
                    <span
                      className={`mt-1 h-3 w-3 shrink-0 rounded-sm ${answerColor}`}
                      aria-hidden="true"
                    />
                    <span className="line-clamp-2 break-words">{answer}</span>
                  </div>
                </td>
              </tr>
            );
          })}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
