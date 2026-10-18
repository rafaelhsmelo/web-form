"use client";

import { FormEvent, useState } from "react";

type AdminUserNameProps = {
  formId: string;
  userId: string;
  initialName: string | null;
};

export default function AdminUserName({
  formId,
  userId,
  initialName,
}: AdminUserNameProps) {
  const [name, setName] = useState(initialName ?? "");
  const [isEditing, setIsEditing] = useState(initialName === null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      const response = await fetch(
        `/api/admin/forms/${encodeURIComponent(formId)}/users/${encodeURIComponent(userId)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        },
      );
      const data = (await response.json()) as { name?: string; error?: string };

      if (!response.ok || typeof data.name !== "string") {
        throw new Error(data.error ?? "Não foi possível salvar o nome.");
      }

      setName(data.name);
      setIsEditing(false);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Não foi possível salvar o nome.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (!isEditing) {
    return (
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        className="text-left text-gray-700 underline decoration-gray-300 underline-offset-2"
      >
        {name}
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex min-w-56 flex-wrap gap-2">
      <input
        value={name}
        onChange={(event) => setName(event.target.value)}
        maxLength={120}
        aria-label={`Nome do ${userId}`}
        className="min-w-0 flex-1 rounded border border-gray-300 px-2 py-1"
        placeholder="Nome do usuário"
        required
      />
      <button
        type="submit"
        disabled={isSaving}
        className="rounded bg-black px-3 py-1 text-white disabled:opacity-50"
      >
        {isSaving ? "Salvando..." : "Salvar"}
      </button>
      {initialName !== null && (
        <button
          type="button"
          onClick={() => {
            setName(initialName);
            setIsEditing(false);
            setError("");
          }}
          className="rounded border border-gray-300 px-3 py-1 text-gray-700"
        >
          Cancelar
        </button>
      )}
      {error && (
        <p role="alert" className="basis-full text-xs text-red-600">
          {error}
        </p>
      )}
    </form>
  );
}
