"use client";

import Link from "next/link";
import { useState } from "react";
import AdminUserExport from "@/components/AdminUserExport";

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
  const [error, setError] = useState("");
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
      {status === "FINALIZADO" ? (
        <Link
          href={`/admin/forms/${encodeURIComponent(formId)}/users/${encodeURIComponent(userId)}`}
          className="rounded-full border border-gray-300 px-3 py-1 text-sm font-medium text-gray-700"
        >
          Ver
        </Link>
      ) : (
        <button
          type="button"
          disabled
          title="Disponível após a conclusão do formulário"
          className="rounded-full border border-gray-300 px-3 py-1 text-sm font-medium text-gray-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Ver
        </button>
      )}
      <button
        type="button"
        onClick={() => void handleDelete()}
        disabled={isDeleting}
        className="rounded-full border border-red-300 px-3 py-1 text-sm font-medium text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isDeleting ? "Excluindo..." : "Excluir"}
      </button>
      <AdminUserExport
        formId={formId}
        userId={userId}
        disabled={status !== "FINALIZADO" || isDeleting}
      />
      {error && (
        <p role="alert" className="basis-full text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
