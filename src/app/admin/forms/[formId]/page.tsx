import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { hasAdminSession } from "@/lib/adminAuth";
import { getUsersByFormId } from "@/lib/storage";
import { loadFormIdsFromCSV } from "@/utils/loadQuestions";

type FormDetailsPageProps = {
  params: Promise<{ formId: string }>;
};

const statusLabels = {
  NAO_INICIADO: "Vazio",
  EM_PREENCHIMENTO: "Rascunho",
  FINALIZADO: "Concluído",
} as const;

export default async function FormDetailsPage({
  params,
}: FormDetailsPageProps) {
  if (!(await hasAdminSession())) {
    redirect("/");
  }

  const { formId } = await params;
  if (!loadFormIdsFromCSV().includes(formId)) {
    notFound();
  }

  const users = await getUsersByFormId(formId);
  const formName = formId === "villa-piauhy" ? "Villa Piauhy" : formId;

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12">
      <section className="mx-auto w-full max-w-6xl rounded-xl bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500">Formulário</p>
            <h1 className="text-3xl font-semibold text-gray-800">{formName}</h1>
            <p className="mt-1 text-sm text-gray-500">{formId}</p>
          </div>
          <Link
            href="/admin"
            className="rounded-full border border-gray-300 px-5 py-2 font-medium text-gray-700"
          >
            Voltar para formulários
          </Link>
        </div>

        {users.length === 0 ? (
          <p className="py-8 text-center text-gray-500">
            Nenhum usuário cadastrado neste formulário.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-gray-600">
                  <th scope="col" className="px-4 py-3 font-medium">
                    userId
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Nome
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Atualizado em
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.userId}
                    className="border-b border-gray-100 last:border-0"
                  >
                    <td className="whitespace-nowrap px-4 py-3">
                      {user.userId}
                    </td>
                    <td className="px-4 py-3 text-gray-500">—</td>
                    <td className="px-4 py-3">
                      {statusLabels[user.status]}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                      {user.updatedAt
                        ? new Date(user.updatedAt).toLocaleString("pt-BR", {
                            timeZone: "UTC",
                          })
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-500">Em breve</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
