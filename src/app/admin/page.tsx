import { redirect } from "next/navigation";

// Dashboard do administrador: resume os formulários e a situação dos usuários.
import AdminDashboardActions from "@/components/AdminDashboardActions";
import AdminFormActions from "@/components/AdminFormActions";
import { hasAdminSession } from "@/lib/adminAuth";
import { getFormsOverview } from "@/lib/storage";

export default async function AdminDashboard() {
  if (!(await hasAdminSession())) {
    redirect("/");
  }

  const forms = await getFormsOverview();

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12">
      <section className="mx-auto w-full max-w-6xl rounded-xl bg-white p-6 shadow-sm sm:p-8">
        <h1 className="mb-8 text-center text-3xl font-semibold text-gray-800">
          Formulários
        </h1>

        {forms.length === 0 ? (
          <p className="py-8 text-center text-gray-500">
            Ainda não há formulários cadastrados.
          </p>
        ) : (
          <div className="space-y-3">
            {forms.map((form) => (
              <article
                key={form.formId}
                className="grid gap-4 rounded-xl border border-gray-200 p-4 lg:grid-cols-[minmax(12rem,1fr)_auto_auto]"
              >
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    {form.name}
                  </h2>
                  <p className="text-sm text-gray-500">{form.formId}</p>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                  <span>Vazios: {form.emptyCount}</span>
                  <span>Rascunhos: {form.draftCount}</span>
                  <span>Concluídos: {form.completedCount}</span>
                  <span>Total: {form.totalUserCount}</span>
                </div>
                <AdminFormActions formId={form.formId} />
              </article>
            ))}
          </div>
        )}

        <div className="mt-8 flex justify-center border-t border-gray-100 pt-6">
          <AdminDashboardActions />
        </div>
      </section>
    </main>
  );
}
