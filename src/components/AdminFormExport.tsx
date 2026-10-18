"use client";

import { useState } from "react";
import { getApiError, readApiResponse } from "@/utils/readApiResponse";

type AdminFormExportProps = {
  formId: string;
};

export default function AdminFormExport({ formId }: AdminFormExportProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState("");

  const handleExport = async () => {
    setError("");
    setIsExporting(true);

    try {
      const response = await fetch(
        `/api/admin/forms/${encodeURIComponent(formId)}/export`,
      );
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
    <div>
      <button
        type="button"
        onClick={() => void handleExport()}
        disabled={isExporting}
        className="rounded-full bg-black px-5 py-2 font-medium text-white disabled:opacity-50"
      >
        {isExporting ? "Baixando..." : "Baixar"}
      </button>
      {error && (
        <p role="alert" className="mt-1 text-right text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
