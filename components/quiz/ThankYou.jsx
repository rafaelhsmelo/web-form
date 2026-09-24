'use client';

import { Check, RotateCcw, BarChart3 } from 'lucide-react';

export default function ThankYou({ name, onRestart, onGoToResults }) {
  return (
    <div className="flex flex-col items-center justify-center text-center max-w-xl mx-auto animate-scale-in">
      <div className="relative mb-8">
        <div className="w-20 h-20 rounded-full bg-stone-900 flex items-center justify-center">
          <Check className="w-10 h-10 text-stone-50" strokeWidth={2} />
        </div>
        <div className="absolute inset-0 w-20 h-20 rounded-full bg-stone-900 animate-ping opacity-10" />
      </div>

      <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 mb-3">
        Obrigado, {name}
      </h2>
      <p className="text-stone-600 leading-relaxed mb-10 max-w-md">
        As suas respostas foram enviadas com sucesso. A nossa equipa de
        design irá analisar as suas preferências e preparar uma proposta
        personalizada para a sua unidade.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <button
          onClick={onRestart}
          className="inline-flex items-center gap-2 px-6 py-3.5 bg-stone-900 text-stone-50 rounded-full font-medium text-sm hover:bg-stone-800 transition-all hover:gap-3"
        >
          <RotateCcw className="w-4 h-4" strokeWidth={1.5} />
          Novo Questionário
        </button>
        {onGoToResults && (
          <button
            onClick={onGoToResults}
            className="inline-flex items-center gap-2 px-6 py-3.5 text-stone-600 hover:text-stone-900 font-medium text-sm transition-colors"
          >
            <BarChart3 className="w-4 h-4" strokeWidth={1.5} />
            Ver Resultados
          </button>
        )}
      </div>
    </div>
  );
}
