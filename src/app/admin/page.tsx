import { redirect } from "next/navigation";
import AdminDashboardActions from "@/components/AdminDashboardActions";
import { hasAdminSession } from "@/lib/adminAuth";
import { getFinalizedSubmissions } from "@/lib/storage";

export default async function AdminDashboard() {
  if (!(await hasAdminSession())) {
    redirect("/");
  }

  const submissions = await getFinalizedSubmissions();

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12">
      <section className="mx-auto w-full max-w-5xl rounded-xl bg-white p-6 shadow-sm sm:p-8">
        <h1 className="mb-8 text-center text-3xl font-semibold text-gray-800">
          Formulários Encaminhados
        </h1>
        <div className="mb-8 flex justify-center">
          <AdminDashboardActions />
        </div>

        {submissions.length === 0 ? (
          <p className="py-8 text-center text-gray-500">
            Ainda não há formulários finalizados.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-gray-600">
                  <th scope="col" className="px-4 py-3 font-medium">
                    Token
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Questionário
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Enviado em
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Situação
                  </th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((submission) => (
                  <tr
                    key={submission.token}
                    className="border-b border-gray-100 last:border-0"
                  >
                    <td className="whitespace-nowrap px-4 py-3">
                      {submission.token}
                    </td>
                    <td className="px-4 py-3">{submission.questionarioId}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <time dateTime={submission.finalizedAt}>
                        {new Date(submission.finalizedAt).toLocaleString(
                          "pt-BR",
                          { timeZone: "UTC" },
                        )}
                      </time>
                    </td>
                    <td className="px-4 py-3">Finalizado</td>
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
