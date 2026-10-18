"use client";

import { useState } from "react";

type AdminUserActionsProps = {
  formId: string;
  userId: string;
  status: "NAO_INICIADO" | "EM_PREENCHIMENTO" | "FINALIZADO";
};

export default function AdminUserActions({
  formId,
  userId,
  status,
}: AdminUserActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false);
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
          data = await response.json();
        } catch {
          data = null;
        }
        throw new Error(
          typeof data === "object" &&
            data !== null &&
            "error" in data &&
            typeof data.error === "string"
            ? data.error
            : "Não foi possível baixar as respostas.",
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

  const handleDelete = async () => {
    if (
      !window.confirm(
        `Excluir o usuário "${userId}" e todas as suas respostas? Essa ação não pode ser desfeita.`,
      )
    ) {
      return;
    }

    setError("");
    setIsDeleting(true);

    try {
      const response = await fetch(
        `/api/admin/forms/${encodeURIComponent(formId)}/users/${encodeURIComponent(userId)}`,
        { method: "DELETE" },
      );
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Não foi possível excluir o usuário.");
      }

      window.location.reload();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Não foi possível excluir o usuário.",
      );
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => void handleDelete()}
        disabled={isDeleting || isExporting}
        className="rounded-full border border-red-300 px-3 py-1 text-sm font-medium text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isDeleting ? "Excluindo..." : "Excluir"}
      </button>
      <button
        type="button"
        onClick={() => void handleExport()}
        disabled={status !== "FINALIZADO" || isDeleting || isExporting}
        title={
          status === "FINALIZADO"
            ? "Baixar respostas"
            : "Disponível após a conclusão do formulário"
        }
        className="rounded-full border border-gray-300 px-3 py-1 text-sm font-medium text-gray-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isExporting ? "Baixando..." : "Baixar"}
      </button>
      {error && (
        <p role="alert" className="basis-full text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
