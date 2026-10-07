"use client";

import { useState } from "react";
import { Question } from "@/utils/loadQuestions";

interface QuestionnaireFormProps {
  questions: Question[];
}

export default function QuestionnaireForm({ questions }: QuestionnaireFormProps) {
  // 1. Definição dos Estados
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // 2. Variável de apoio para a pergunta da vez
  const question = questions[currentStep];

  // Calcula a porcentagem da barra de progresso
  const progressPercentage = ((currentStep + 1) / questions.length) * 100;

  // Verifica se existe uma resposta gravada para o ID da pergunta atual
  const hasAnsweredCurrent = answers[question.id] !== undefined;

  // 3. Funções de interação e navegação
  const handleSelectOption = (optionId: string) => {
    setAnswers({
      ...answers,
      [question.id]: optionId,
    });
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-sm w-full max-w-3xl">
        {/* Cabeçalho e Progresso */}
        <div className="mb-8">
          <div className="flex flex-col gap-2 mb-6">
            <div className="flex justify-between text-sm font-medium text-gray-400 uppercase tracking-wider">
              <span>
                Passo {currentStep + 1} de {questions.length}
              </span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden block">
              <div
                className="h-full bg-black transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
          <h2 className="text-3xl font-semibold text-gray-800 mt-2">
            {question.title}
          </h2>
          {question.subtitle && (
            <p className="text-gray-500 mt-2">{question.subtitle}</p>
          )}
        </div>

        {/* Opções de Resposta */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {question.options.map((option) => {
            const isSelected = answers[question.id] === option.id;

            return (
              <button
                key={option.id}
                onClick={() => handleSelectOption(option.id)}
                className={`p-4 border rounded-xl text-left transition-all flex items-center w-full gap-4 ${
                  isSelected
                    ? "border-black bg-gray-50 ring-2 ring-black"
                    : "border-gray-200 hover:border-gray-400"
                }`}
              >
                {option.imageUrl && (
                  <div className="flex-shrink-0 w-16 h-16 md:w-20 md:h-20">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={option.imageUrl}
                      alt={option.label}
                      className="w-full h-full object-cover rounded-lg border border-gray-200"
                    />
                  </div>
                )}
                <div className="flex flex-col flex-grow">
                  <span
                    className={`font-medium ${isSelected ? "text-black" : "text-gray-700"}`}
                  >
                    {option.label}
                  </span>
                  {isSelected && (
                    <div className="w-4 h-4 bg-black rounded-full flex items-center justify-center">
                      <span className="text-white text-[10px]">✓</span>
                    </div>
                  )}
                  {option.description && (
                    <p className="text-xs text-gray-500 mt-1">
                      {option.description}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Rodapé e Navegação */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="px-6 py-2 text-gray-500 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed font-medium transition-colors"
          >
            ← Voltar
          </button>
          {hasAnsweredCurrent && (
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800 font-medium transition-colors"
            >
              {currentStep === questions.length - 1 ? "Finalizar" : "Avançar →"}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}