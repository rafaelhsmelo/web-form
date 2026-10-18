"use client";

import Link from "next/link";
import { useState } from "react";
import { getApiError, readApiResponse } from "@/utils/readApiResponse";

type AdminFormActionsProps = {
  formId: string;
};

export default function AdminFormActions({
  formId,
}: AdminFormActionsProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState("");

  const handleExport = async () => {
    setError("");
    setIsExporting(true);

    try {
      const response = await fetch(`/api/admin/forms/${formId}/export`);
      if (!response.ok) {
        let data: unknown;
        try {
          data = await readApiResponse(response);
        } catch {
          data = null;
        }
        throw new Error(
          getApiError(
            data,
            "A exportação não pôde ser concluída. Tente novamente.",
          ),
        );
      }

      const file = await response.blob();
      const downloadUrl = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `${formId}-respostas.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
    } catch (exportError) {
      setError(
        exportError instanceof Error
          ? exportError.message
          : "A exportação não pôde ser concluída. Tente novamente.",
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <button
        type="button"
        disabled
        title="Disponível em breve"
        className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Ver
      </button>
      <button
        type="button"
        onClick={() => void handleExport()}
        disabled={isExporting}
        className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {isExporting ? "Baixando..." : "Baixar"}
      </button>
      <Link
        href={`/admin/forms/${encodeURIComponent(formId)}`}
        className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
      >
        Detalhes
      </Link>
      {error && (
        <p role="alert" className="basis-full text-right text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
