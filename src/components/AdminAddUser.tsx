"use client";

import { FormEvent, useState } from "react";

type AdminAddUserProps = {
  formId: string;
};

export default function AdminAddUser({ formId }: AdminAddUserProps) {
  const [userId, setUserId] = useState("");
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setError("");
    setIsSaving(true);

    try {
      const response = await fetch(
        `/api/admin/forms/${encodeURIComponent(formId)}/users`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, name }),
        },
      );
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Não foi possível adicionar o usuário.");
      }

      setUserId("");
      setName("");
      setMessage("Usuário adicionado com sucesso.");
      window.location.reload();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Não foi possível adicionar o usuário.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="mt-8 border-t border-gray-100 pt-6">
      <h2 className="text-lg font-semibold text-gray-800">
        Adicionar usuário
      </h2>
      <form
        onSubmit={handleSubmit}
        className="mt-4 flex flex-wrap items-end gap-3"
      >
        <label className="flex min-w-52 flex-1 flex-col gap-1 text-sm text-gray-700">
          userId
          <input
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
            maxLength={120}
            required
            className="rounded border border-gray-300 px-3 py-2"
          />
        </label>
        <label className="flex min-w-52 flex-1 flex-col gap-1 text-sm text-gray-700">
          Nome (opcional)
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={120}
            className="rounded border border-gray-300 px-3 py-2"
          />
        </label>
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-full bg-black px-5 py-2 font-medium text-white disabled:opacity-50"
        >
          {isSaving ? "Adicionando..." : "Adicionar"}
        </button>
      </form>
      {message && <p className="mt-3 text-sm text-green-700">{message}</p>}
      {error && (
        <p role="alert" className="mt-3 text-sm text-red-600">
          {error}
        </p>
      )}
    </section>
  );
}
