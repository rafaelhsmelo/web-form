"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function LoginToken() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"user" | "admin">("user");
  const [token, setToken] = useState("");
  const [adminToken, setAdminToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token.trim() }),
      });
      const data: unknown = await response.json();

      if (!response.ok) {
        const message =
          typeof data === "object" &&
          data !== null &&
          "error" in data &&
          typeof data.error === "string"
            ? data.error
            : "Não foi possível validar o token.";
        throw new Error(message);
      }

      router.refresh();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Ocorreu um erro ao validar o token.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: adminToken.trim() }),
      });
      const data: unknown = await response.json();

      if (!response.ok) {
        const message =
          typeof data === "object" &&
          data !== null &&
          "error" in data &&
          typeof data.error === "string"
            ? data.error
            : "A autenticação não foi realizada.";
        throw new Error(message);
      }

      router.push("/admin");
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "A autenticação não foi realizada.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <section className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm">
        <div
          role="tablist"
          aria-label="Tipo de acesso"
          className="mb-8 grid grid-cols-2 border-b border-gray-200"
        >
          <button
            type="button"
            role="tab"
            id="user-tab"
            aria-selected={activeTab === "user"}
            aria-controls="user-panel"
            onClick={() => {
              setActiveTab("user");
              setError("");
            }}
            className={`border-b-2 px-2 pb-3 text-sm font-medium ${
              activeTab === "user"
                ? "border-black text-gray-900"
                : "border-transparent text-gray-500"
            }`}
          >
            Acesse o seu Formulário
          </button>
          <button
            type="button"
            role="tab"
            id="admin-tab"
            aria-selected={activeTab === "admin"}
            aria-controls="admin-panel"
            onClick={() => {
              setActiveTab("admin");
              setError("");
            }}
            className={`border-b-2 px-2 pb-3 text-sm font-medium ${
              activeTab === "admin"
                ? "border-black text-gray-900"
                : "border-transparent text-gray-500"
            }`}
          >
            Login como Administrador
          </button>
        </div>

        {activeTab === "user" ? (
          <form
            id="user-panel"
            role="tabpanel"
            aria-labelledby="user-tab"
            onSubmit={handleSubmit}
          >
            <h1 className="mb-2 text-2xl font-semibold text-gray-800">
              Acesso ao questionário
            </h1>
            <p className="mb-6 text-gray-500">
              Informe o token recebido para continuar.
            </p>
            <label
              htmlFor="token"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Token de acesso
            </label>
            <input
              id="token"
              value={token}
              onChange={(event) => setToken(event.target.value)}
              autoComplete="off"
              required
              className="w-full rounded-lg border border-gray-300 p-3"
            />
            {error && (
              <p role="alert" className="mt-3 text-sm text-red-600">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-6 w-full rounded-full bg-black px-6 py-3 font-medium text-white disabled:opacity-50"
            >
              {isLoading ? "Validando..." : "Continuar"}
            </button>
          </form>
        ) : (
          <form
            id="admin-panel"
            role="tabpanel"
            aria-labelledby="admin-tab"
            onSubmit={handleAdminSubmit}
          >
            <h1 className="mb-2 text-2xl font-semibold text-gray-800">
              Acesso administrativo
            </h1>
            <p className="mb-6 text-gray-500">
              Informe o token administrativo para continuar.
            </p>
            <label
              htmlFor="admin-token"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Token administrativo
            </label>
            <input
              id="admin-token"
              type="password"
              value={adminToken}
              onChange={(event) => setAdminToken(event.target.value)}
              autoComplete="current-password"
              required
              className="w-full rounded-lg border border-gray-300 p-3"
            />
            {error && (
              <p role="alert" className="mt-3 text-sm text-red-600">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-6 w-full rounded-full bg-black px-6 py-3 font-medium text-white disabled:opacity-50"
            >
              {isLoading ? "Autenticando..." : "Entrar como administrador"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
