"use client";

import { useState } from "react";
import CompactResponsesTable from "@/components/CompactResponsesTable";
import CompiledResponsesTable from "@/components/CompiledResponsesTable";
import type { CompiledFormResponse } from "@/lib/types";
import type { Question } from "@/utils/loadQuestions";

type CompiledResponsesTabsProps = {
  questions: Question[];
  responses: CompiledFormResponse[];
};

export default function CompiledResponsesTabs({
  questions,
  responses,
}: CompiledResponsesTabsProps) {
  const [activeTab, setActiveTab] = useState<"detailed" | "compact">(
    "detailed",
  );

  return (
    <div>
      <div
        role="tablist"
        aria-label="Modo de visualização das respostas"
        className="mb-6 flex gap-6 border-b border-gray-200"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "detailed"}
          onClick={() => setActiveTab("detailed")}
          className={`border-b-2 px-1 pb-3 text-sm font-medium ${
            activeTab === "detailed"
              ? "border-black text-gray-900"
              : "border-transparent text-gray-500"
          }`}
        >
          Detalhada
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "compact"}
          onClick={() => setActiveTab("compact")}
          className={`border-b-2 px-1 pb-3 text-sm font-medium ${
            activeTab === "compact"
              ? "border-black text-gray-900"
              : "border-transparent text-gray-500"
          }`}
        >
          Compacta
        </button>
      </div>

      {activeTab === "detailed" ? (
        <CompiledResponsesTable
          questions={questions}
          responses={responses}
        />
      ) : (
        <CompactResponsesTable questions={questions} responses={responses} />
      )}
    </div>
  );
}
