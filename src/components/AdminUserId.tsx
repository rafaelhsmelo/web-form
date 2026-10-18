"use client";

// Campo editável para corrigir o identificador de uma pessoa.
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { getApiError, readApiResponse } from "@/utils/readApiResponse";

type AdminUserIdProps = {
  formId: string;
  userId: string;
};

export default function AdminUserId({ formId, userId }: AdminUserIdProps) {
  const router = useRouter();
  const [value, setValue] = useState(userId);
  const [isEditing, setIsEditing] = useState(false);
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
          body: JSON.stringify({ userId: value }),
        },
      );
      const data = await readApiResponse(response);

      if (
        !response.ok ||
        typeof data !== "object" ||
        data === null ||
        !("userId" in data) ||
        typeof data.userId !== "string"
      ) {
        throw new Error(
          getApiError(data, "Não foi possível salvar o userId."),
        );
      }

      router.push(
        `/admin/forms/${encodeURIComponent(formId)}/users/${encodeURIComponent(data.userId)}`,
      );
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Não foi possível salvar o userId.",
      );
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
        {value}
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-2">
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        maxLength={120}
        aria-label="userId"
        className="rounded border border-gray-300 px-2 py-1"
        required
      />
      <button
        type="submit"
        disabled={isSaving}
        className="rounded bg-black px-3 py-1 text-white disabled:opacity-50"
      >
        {isSaving ? "Salvando..." : "Salvar"}
      </button>
      <button
        type="button"
        onClick={() => {
          setValue(userId);
          setIsEditing(false);
          setError("");
        }}
        className="rounded border border-gray-300 px-3 py-1 text-gray-700"
      >
        Cancelar
      </button>
      {error && (
        <p role="alert" className="basis-full text-xs text-red-600">
          {error}
        </p>
      )}
    </form>
  );
}
