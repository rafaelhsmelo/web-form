"use client";

import { useEffect, useRef, useState } from "react";
import type { CompiledFormResponse } from "@/lib/types";
import type { Question } from "@/utils/loadQuestions";
import { responseColors } from "@/utils/responseDisplay";

type CompiledResponsesTableProps = {
  questions: Question[];
  responses: CompiledFormResponse[];
};

const statusLabels = {
  VAZIO: "Vazio",
  RASCUNHO: "Rascunho",
  FINALIZADO: "Concluído",
} as const;

function answerLabel(question: Question, answerId: string | undefined) {
  if (!answerId) {
    return "Sem resposta";
  }
  return (
    question.options.find((option) => option.id === answerId)?.label ?? answerId
  );
}

export default function CompiledResponsesTable({
  questions,
  responses,
}: CompiledResponsesTableProps) {
  const [expandedCell, setExpandedCell] = useState<string | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        tableRef.current &&
        !tableRef.current.contains(event.target as Node)
      ) {
        setExpandedCell(null);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <div
      ref={tableRef}
      className="overflow-x-auto rounded-lg border border-gray-200"
    >
      <table className="w-max min-w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50 text-gray-600">
            <th
              scope="col"
              className="sticky left-0 z-20 min-w-80 border-r border-gray-200 bg-gray-50 px-4 py-3 font-medium"
            >
              Pergunta
            </th>
            {responses.map((response) => (
              <th
                scope="col"
                key={response.userId}
                className="min-w-44 px-4 py-3 font-medium"
              >
                <span className="block text-gray-800">
                  {response.name ?? "Nome não informado"}
                </span>
                <span className="block font-normal">{response.userId}</span>
                <span className="block font-normal">
                  {statusLabels[response.status]}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {questions.map((question) => {
            const values = responses.map((response) =>
              answerLabel(question, response.answers[question.id]),
            );
            const counts = new Map<string, number>();
            values.forEach((value) => {
              counts.set(value, (counts.get(value) ?? 0) + 1);
            });
            const optionOrder = new Map(
              question.options.map((option, index) => [option.label, index]),
            );
            const segments = [...counts.entries()].sort(
              ([firstValue, firstCount], [secondValue, secondCount]) => {
                const countDifference = secondCount - firstCount;
                if (countDifference !== 0) {
                  return countDifference;
                }

                return (
                  (optionOrder.get(firstValue) ?? Number.MAX_SAFE_INTEGER) -
                  (optionOrder.get(secondValue) ?? Number.MAX_SAFE_INTEGER)
                );
              },
            );
            const segmentColors = new Map(
              segments.map(([value], index) => [
                value,
                value === "Sem resposta"
                  ? "bg-gray-400"
                  : responseColors[index % responseColors.length],
              ]),
            );

            return (
              <tr key={question.id} className="border-b border-gray-100 align-top">
                <th
                  scope="row"
                  className="sticky left-0 z-10 min-w-80 border-r border-gray-100 bg-white px-4 py-4 font-medium text-gray-800"
                >
                  <span className="block">{question.title}</span>
                  <span className="mt-1 block text-xs font-normal text-gray-500">
                    {question.sectionTitle}
                  </span>
                  <div
                    className="mt-3 flex h-8 w-full overflow-hidden rounded-full bg-gray-200"
                    aria-label={`Resumo das respostas para ${question.title}`}
                  >
                    {segments.map(([value, count]) => (
                      <span
                        key={value}
                        title={`${value}: ${Math.round((count / responses.length) * 100)}%`}
                        className={`flex h-full min-w-0 items-center justify-center overflow-hidden px-1 text-xs font-medium text-white ${segmentColors.get(value)}`}
                        style={{
                          width: `${(count / responses.length) * 100}%`,
                        }}
                      >
                        <span className="truncate">
                          {Math.round((count / responses.length) * 100)}%
                        </span>
                      </span>
                    ))}
                  </div>
                </th>
                {responses.map((response) => {
                  const cellId = `${question.id}:${response.userId}`;
                  const answer = answerLabel(
                    question,
                    response.answers[question.id],
                  );
                  const isExpanded = expandedCell === cellId;

                  return (
                    <td key={response.userId} className="min-w-44 px-4 py-4">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedCell(isExpanded ? null : cellId)
                        }
                        className={`flex w-full items-start gap-2 text-left text-gray-700 ${isExpanded ? "whitespace-normal" : "line-clamp-2"}`}
                        title={isExpanded ? "Recolher resposta" : "Expandir resposta"}
                      >
                        <span
                          aria-hidden="true"
                          className={`mt-1 h-3 w-3 shrink-0 rounded-sm ${segmentColors.get(answer) ?? "bg-gray-400"}`}
                        />
                        <span>{answer}</span>
                      </button>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
