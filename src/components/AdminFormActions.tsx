"use client";

// Botões de cada formulário: visualizar respostas, baixar CSV e abrir detalhes.
import Link from "next/link";
import AdminFormExport from "@/components/AdminFormExport";

type AdminFormActionsProps = {
  formId: string;
};

export default function AdminFormActions({
  formId,
}: AdminFormActionsProps) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <Link
        href={`/admin/forms/${encodeURIComponent(formId)}/responses`}
        className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
      >
        Ver
      </Link>
      <AdminFormExport formId={formId} />
      <Link
        href={`/admin/forms/${encodeURIComponent(formId)}`}
        className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
      >
        Detalhes
      </Link>
    </div>
  );
}
