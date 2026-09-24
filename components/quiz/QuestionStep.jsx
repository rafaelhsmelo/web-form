'use client';

import { ArrowRight, ArrowLeft, Check } from 'lucide-react';
import Image from 'next/image';

export default function QuestionStep({
  question,
  questionIndex,
  totalQuestions,
  selectedValue,
  onSelect,
  onNext,
  onBack,
}) {
  const hasSelection = selectedValue !== undefined && selectedValue !== '';

  return (
    <div className="max-w-3xl mx-auto animate-fade-in-up" key={question.id}>
      <div className="mb-8">
        <span className="text-sm font-medium text-stone-400 tracking-wide uppercase">
          Pergunta {questionIndex + 1} de {totalQuestions}
        </span>
        <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-stone-900 mt-2 mb-2 leading-tight">
          {question.question}
        </h2>
        {question.subtitle && (
          <p className="text-stone-600 leading-relaxed text-base">
            {question.subtitle}
          </p>
        )}
      </div>

      <div
        className={`grid gap-3 ${
          question.hasImage
            ? 'sm:grid-cols-2'
            : 'sm:grid-cols-1'
        }`}
      >
        {question.options.map((option) => {
          const isSelected = selectedValue === option.value;
          return (
            <button
              key={option.value}
              onClick={() => onSelect(option.value)}
              className={`group relative flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                isSelected
                  ? 'border-stone-800 bg-stone-100/80 shadow-sm'
                  : 'border-stone-200 bg-white hover:border-stone-400 hover:bg-stone-50'
              }`}
            >
              {question.hasImage && option.image && (
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-lg overflow-hidden border border-stone-200">
                  <Image
                    src={option.image}
                    alt={option.label}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </div>
              )}

              <div className="flex-1 min-w-0 pt-1">
                <div className="flex items-center gap-2">
                  <h3
                    className={`font-medium text-base ${
                      isSelected ? 'text-stone-900' : 'text-stone-800'
                    }`}
                  >
                    {option.label}
                  </h3>
                  {isSelected && (
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-stone-800 text-stone-50 flex-shrink-0">
                      <Check className="w-3 h-3" strokeWidth={2.5} />
                    </span>
                  )}
                </div>
                {option.description && (
                  <p className="text-sm text-stone-500 mt-1 leading-relaxed">
                    {option.description}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-8">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-5 py-3 text-stone-600 hover:text-stone-900 font-medium text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
          Voltar
        </button>
        <button
          onClick={onNext}
          disabled={!hasSelection}
          className="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 text-stone-50 rounded-full font-medium text-sm hover:bg-stone-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:gap-3"
        >
          Avançar
          <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
