"use client";

// Ações do rodapé do dashboard, como encerrar a sessão administrativa.
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboardActions() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState("");

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
      <div className="flex justify-center">
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="rounded-full border border-gray-300 px-6 py-3 font-medium text-gray-700 disabled:opacity-50"
        >
          {isLoggingOut ? "Saindo..." : "Sair"}
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
