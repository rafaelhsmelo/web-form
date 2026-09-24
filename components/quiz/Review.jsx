'use client';

import { ArrowLeft, Send, Check, User, Building } from 'lucide-react';

export default function Review({
  questions,
  answers,
  userInfo,
  onSubmit,
  onBack,
  submitting,
}) {
  const getOptionLabel = (questionId, value) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question) return value;
    const option = question.options.find((o) => o.value === value);
    return option ? option.label : value;
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in-up">
      <div className="mb-8">
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 mb-3">
          Revise as suas respostas
        </h2>
        <p className="text-stone-600 leading-relaxed">
          Confirme todas as informações antes de enviar. Pode voltar
          para alterar qualquer resposta.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden mb-8">
        <div className="grid grid-cols-2 divide-x divide-stone-200 border-b border-stone-200">
          <div className="p-5">
            <div className="flex items-center gap-2 text-stone-400 text-xs uppercase tracking-wide mb-2">
              <User className="w-3.5 h-3.5" strokeWidth={1.5} />
              Nome
            </div>
            <p className="font-medium text-stone-900">{userInfo.nome}</p>
          </div>
          <div className="p-5">
            <div className="flex items-center gap-2 text-stone-400 text-xs uppercase tracking-wide mb-2">
              <Building className="w-3.5 h-3.5" strokeWidth={1.5} />
              Unidade
            </div>
            <p className="font-medium text-stone-900">
              {userInfo.unidade}
            </p>
          </div>
        </div>

        <div className="divide-y divide-stone-100">
          {questions.map((question, index) => (
            <div
              key={question.id}
              className="flex items-start gap-4 p-5 hover:bg-stone-50/50 transition-colors"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 text-sm font-medium">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-stone-500 mb-1">
                  {question.question}
                </p>
                <p className="font-medium text-stone-900 flex items-center gap-2">
                  {getOptionLabel(question.id, answers[question.id])}
                  <Check
                    className="w-4 h-4 text-stone-400"
                    strokeWidth={2}
                  />
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          disabled={submitting}
          className="inline-flex items-center gap-2 px-5 py-3 text-stone-600 hover:text-stone-900 font-medium text-sm transition-colors disabled:opacity-40"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
          Voltar
        </button>
        <button
          onClick={onSubmit}
          disabled={submitting}
          className="inline-flex items-center gap-2 px-7 py-3.5 bg-stone-900 text-stone-50 rounded-full font-medium text-sm hover:bg-stone-800 transition-all disabled:opacity-60 disabled:cursor-wait hover:gap-3"
        >
          {submitting ? (
            <>
              <span className="w-4 h-4 border-2 border-stone-300 border-t-stone-50 rounded-full animate-spin" />
              A enviar...
            </>
          ) : (
            <>
              Enviar Respostas
              <Send className="w-4 h-4" strokeWidth={1.5} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
