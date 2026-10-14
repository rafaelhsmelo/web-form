"use client";

import { useState, type FormEvent } from "react";

export default function LoginToken() {
  const [token, setToken] = useState("");
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

      window.location.reload();
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

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm"
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
    </main>
  );
}
