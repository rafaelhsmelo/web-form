"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function getErrorMessage(data: unknown): string | null {
  if (
    typeof data === "object" &&
    data !== null &&
    "error" in data &&
    typeof data.error === "string"
  ) {
    return data.error;
  }
  return null;
}

export default function AdminDashboardActions() {
  const router = useRouter();
  const [isExporting, setIsExporting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState("");

  const handleExport = async () => {
    setError("");
    setIsExporting(true);

    try {
      const response = await fetch("/api/admin/export");
      if (!response.ok) {
        let data: unknown;
        try {
          data = await response.json();
        } catch {
          data = null;
        }
        throw new Error(
          getErrorMessage(data) ??
            "A exportação não pôde ser concluída. Tente novamente.",
        );
      }

      const file = await response.blob();
      const downloadUrl = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `formularios-encaminhados-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;
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

  const handleLogout = async () => {
    setError("");
    setIsLoggingOut(true);

    try {
      const response = await fetch("/api/admin/logout", { method: "POST" });
      if (!response.ok) {
        throw new Error("Não foi possível encerrar a sessão administrativa.");
      }
      router.push("/");
    } catch (logoutError) {
      setError(
        logoutError instanceof Error
          ? logoutError.message
          : "Não foi possível encerrar a sessão administrativa.",
      );
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={handleExport}
          disabled={isExporting || isLoggingOut}
          className="rounded-full bg-black px-6 py-3 font-medium text-white disabled:opacity-50"
        >
          {isExporting ? "Preparando arquivo..." : "Baixar formulários (CSV)"}
        </button>
        <button
          type="button"
          onClick={handleLogout}
          disabled={isExporting || isLoggingOut}
          className="rounded-full border border-gray-300 px-6 py-3 font-medium text-gray-700 disabled:opacity-50"
        >
          {isLoggingOut ? "Saindo..." : "Encerrar sessão"}
        </button>
      </div>
      {error && (
        <p role="alert" className="text-center text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
