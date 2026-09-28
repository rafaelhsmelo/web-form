"use client";

import { useState } from "react";
import { questions } from "@/data/questions";

export default function Home() {
  // 1. Definição dos Estados
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // 2.Variável de apoio para a pergunta da vez
  const question = questions[currentStep];

  // 3. Funções de navegação
  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      {/* Contêiner Principal do Card */}
      <div className="bg-white p-8 rounded-xl shadow-sm w-full max-w-9/10">
        {/* Cabeçalho: Título e Subtítulo dinâmicos */}
        <div className="mb-8">
          <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">
            Pergunta {currentStep + 1} de {questions.length}
          </span>
          <h2 className="text-3xl font-semibold text-gray-800 mt-2">
            {question.title}
          </h2>
          {question.subtitle && (
            <p className="text-gray-500 mt-2">{question.subtitle}</p>
          )}
        </div>

        {/* Espaço reservado para as opções (Próxima etapa) */}
        <div className="min-h-[200px] bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 mb-8 border-2 border-dashed border-gray-200">
          [ Área das Opções de Resposta ]
        </div>

        {/* Rodapé: Botões de Navegação */}
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
          <button
            onClick={handleNext}
            className="px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800 font-medium transition-colors"
          >
            {currentStep === questions.length - 1 ? "Finalizar" : "Avançar →"}
          </button>
        </div>
      </div>
    </main>
  );
}
