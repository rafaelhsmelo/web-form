"use client";

import type { CompiledFormResponse } from "@/lib/types";
import type { Question } from "@/utils/loadQuestions";

type CompactResponsesTableProps = {
  questions: Question[];
  responses: CompiledFormResponse[];
};

const colors = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-violet-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-orange-500",
  "bg-lime-500",
];

type AnswerGroup = {
  label: string;
  answerId: string | undefined;
  count: number;
  percentage: number;
  color: string;
  responses: CompiledFormResponse[];
};

function splitIntoColumns<T>(items: T[]) {
  const middle = Math.ceil(items.length / 2);
  return [items.slice(0, middle), items.slice(middle)];
}

export default function CompactResponsesTable({
  questions,
  responses,
}: CompactResponsesTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full min-w-[52rem] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50 text-gray-600">
            <th scope="col" className="w-[28%] px-4 py-3 font-medium">
              Pergunta
            </th>
            <th scope="col" className="w-[42%] px-4 py-3 font-medium">
              Opções
            </th>
            <th scope="col" className="w-[30%] px-4 py-3 font-medium">
              Usuários
            </th>
          </tr>
        </thead>
        <tbody>
          {questions.map((question) => {
            const optionOrder = new Map(
              question.options.map((option, index) => [option.id, index]),
            );
            const counts = new Map<string | undefined, number>();
            responses.forEach((response) => {
              const answerId = response.answers[question.id];
              counts.set(answerId, (counts.get(answerId) ?? 0) + 1);
            });

            const chosenOptions = question.options
              .filter((option) => (counts.get(option.id) ?? 0) > 0)
              .sort(
                (first, second) =>
                  (counts.get(second.id) ?? 0) - (counts.get(first.id) ?? 0) ||
                  (optionOrder.get(first.id) ?? 0) -
                    (optionOrder.get(second.id) ?? 0),
              );
            const groups: AnswerGroup[] = [
              ...question.options.map((option) => {
                const count = counts.get(option.id) ?? 0;
                const chosenIndex = chosenOptions.findIndex(
                  (chosenOption) => chosenOption.id === option.id,
                );
                return {
                  label: option.label,
                  answerId: option.id,
                  count,
                  percentage: (count / responses.length) * 100,
                  color:
                    count > 0
                      ? colors[chosenIndex % colors.length]
                      : "",
                  responses: responses.filter(
                    (response) => response.answers[question.id] === option.id,
                  ),
                };
              }),
              ...(counts.has(undefined)
                ? [
                    {
                      label: "Sem resposta",
                      answerId: undefined,
                      count: counts.get(undefined) ?? 0,
                      percentage:
                        ((counts.get(undefined) ?? 0) / responses.length) * 100,
                      color: "bg-gray-400",
                      responses: responses.filter(
                        (response) => !response.answers[question.id],
                      ),
                    },
                  ]
                : []),
            ].sort((first, second) => {
              const countDifference = second.count - first.count;
              if (countDifference !== 0) {
                return countDifference;
              }

              return (
                (first.answerId === undefined
                  ? Number.MAX_SAFE_INTEGER
                  : optionOrder.get(first.answerId) ??
                    Number.MAX_SAFE_INTEGER) -
                (second.answerId === undefined
                  ? Number.MAX_SAFE_INTEGER
                  : optionOrder.get(second.answerId) ??
                    Number.MAX_SAFE_INTEGER)
              );
            });
            const groupColumns = splitIntoColumns(groups);
            const responseGroups = groups.flatMap((group) =>
              group.responses.map((response) => ({ group, response })),
            );
            const responseColumns = splitIntoColumns(responseGroups);

            return (
              <tr key={question.id} className="border-b border-gray-100 align-top">
                <th scope="row" className="px-4 py-4 font-medium text-gray-800">
                  <span className="block break-words">{question.title}</span>
                  <span className="mt-1 block text-xs font-normal text-gray-500">
                    {question.sectionTitle}
                  </span>
                  <div className="mt-4 flex h-7 w-full overflow-hidden rounded-full bg-gray-200">
                    {groups
                      .filter((group) => group.count > 0)
                      .map((group) => (
                        <span
                          key={group.label}
                          className={`flex h-full min-w-0 items-center justify-center overflow-hidden px-1 text-xs font-medium text-white ${group.color}`}
                          style={{ width: `${group.percentage}%` }}
                          title={`${group.label}: ${Math.round(group.percentage)}%`}
                        >
                          <span className="truncate">
                            {Math.round(group.percentage)}%
                          </span>
                        </span>
                      ))}
                  </div>
                </th>
                <td className="px-4 py-4">
                  <div className="grid grid-cols-2 gap-x-4">
                    {groupColumns.map((column, columnIndex) => (
                      <div key={columnIndex} className="min-w-0 space-y-2">
                        {column.map((group) => (
                          <div
                            key={group.label}
                            className="flex min-w-0 items-start gap-2"
                            title={`${group.label}: ${Math.round(group.percentage)}%`}
                          >
                            <span
                              className={`mt-1 h-3 w-3 shrink-0 rounded-sm ${
                                group.count > 0
                                  ? group.color
                                  : "border border-gray-400 bg-transparent"
                              }`}
                              aria-hidden="true"
                            />
                            <span className="line-clamp-2 break-words text-xs text-gray-700">
                              {group.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="grid grid-cols-2 gap-x-4">
                    {responseColumns.map((column, columnIndex) => (
                      <div key={columnIndex} className="min-w-0 space-y-2">
                        {column.map(({ group, response }) => (
                          <div
                            key={response.userId}
                            className="flex min-w-0 items-start gap-2"
                            title={`${response.name ?? response.userId} — ${group.label}`}
                          >
                            <span
                              className={`mt-1 h-3 w-3 shrink-0 rounded-sm ${group.color}`}
                              aria-hidden="true"
                            />
                            <span className="line-clamp-2 break-words text-xs text-gray-700">
                              {response.name ?? response.userId}
                            </span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
