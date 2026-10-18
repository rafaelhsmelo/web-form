"use client";

// Faz o download das respostas de uma pessoa finalizada.
import { useState } from "react";
import { getApiError, readApiResponse } from "@/utils/readApiResponse";

type AdminUserExportProps = {
  formId: string;
  userId: string;
  disabled?: boolean;
};

export default function AdminUserExport({
  formId,
  userId,
  disabled = false,
}: AdminUserExportProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState("");

  const handleExport = async () => {
    setError("");
    setIsExporting(true);

    try {
      const response = await fetch(
        `/api/admin/forms/${encodeURIComponent(formId)}/users/${encodeURIComponent(userId)}/export`,
      );
      if (!response.ok) {
        let data: unknown;
        try {
          data = await readApiResponse(response);
        } catch {
          data = null;
        }
        throw new Error(
          getApiError(data, "Não foi possível baixar as respostas."),
        );
      }

      const file = await response.blob();
      const downloadUrl = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `${formId}-${userId}-respostas.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
    } catch (exportError) {
      setError(
        exportError instanceof Error
          ? exportError.message
          : "Não foi possível baixar as respostas.",
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
        disabled={disabled || isExporting}
        title={
          disabled
            ? "Disponível após a conclusão do formulário"
            : "Baixar respostas"
        }
        className="rounded-full border border-gray-300 px-3 py-1 text-sm font-medium text-gray-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isExporting ? "Baixando..." : "Baixar"}
      </button>
      {error && (
        <p role="alert" className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
