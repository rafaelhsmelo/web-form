"use client";

import { useState } from "react";
import { questions } from "@/data/questions";

export default function Home() {
  // 1. Definição dos Estados
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // 2.Variável de apoio para a pergunta da vez
  const question = questions[currentStep];

  // Verifica se existe uma resposta grava para o ID da pergunta atual
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
      {/* Contêiner Principal do Card */}
      <div className="bg-white p-8 rounded-xl shadow-sm w-full max-w-3xl">
        {/* --- CABEÇALHO --- */}
        <div className="mb-8">
          {/* Progresso */}
          <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">
            Pergunta {currentStep + 1} de {questions.length}
          </span>

          {/* Título */}
          <h2 className="text-3xl font-semibold text-gray-800 mt-2">
            {question.title}
          </h2>

          {/* Subtítulo */}
          {question.subtitle && (
            <p className="text-gray-500 mt-2">{question.subtitle}</p>
          )}
        </div>

        {/* --- OPÇÕES DE RESPOSTA --- */}
        <div className="grid grid-col-1 md:grid-cols-2 gap-4 mb-8">
          {/* Percorre a lista de opções da pergunta atual */}
          {question.options.map((option) => {
            // Verifica se a respost guardada para a pergunta é igual a este botão
            const isSelected = answers[question.id] === option.id;

            return (
              <button
                key={option.id}
                onClick={() => handleSelectOption(option.id)}
                className={`p-6 border rounded-xl text-left transition-all ${
                  isSelected
                    ? "border-black bg-gray-50 ring-2 ring-black"
                    : "border-gray-200 hover:border-gray-400"
                }`}
              >
                <span
                  className={`font-medium ${isSelected ? "text-black" : "text-gray-700"}`}
                >
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* --- RODAPÉ E NAVEGAÇÃO --- */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
          {/* Botão de voltar */}
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="px-6 py-2 text-gray-500 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed font-medium transition-colors"
          >
            ← Voltar
          </button>

          {/* Botão de avançar */}
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
