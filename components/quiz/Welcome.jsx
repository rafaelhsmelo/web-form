'use client';

import { ArrowRight, Home } from 'lucide-react';

export default function Welcome({ onStart }) {
  return (
    <div className="flex flex-col items-center justify-center text-center max-w-2xl mx-auto animate-fade-in-up">
      <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-stone-200/60 text-stone-600 text-sm font-medium">
        <Home className="w-4 h-4" strokeWidth={1.5} />
        Atelier de Interiores
      </div>

      <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-stone-900 leading-tight mb-6">
        Descubra o seu
        <br />
        <span className="italic text-stone-700">estilo ideal</span>
      </h1>

      <p className="text-base sm:text-lg text-stone-600 leading-relaxed mb-10 max-w-xl">
        Responda a um breve questionário passo a passo e receba uma
        recomendação personalizada de design de interiores, adaptada ao
        seu gosto e ao seu espaço.
      </p>

      <button
        onClick={onStart}
        className="group inline-flex items-center gap-3 px-8 py-4 bg-stone-900 text-stone-50 rounded-full font-medium text-base hover:bg-stone-800 transition-all duration-300 hover:gap-4 hover:shadow-lg"
      >
        Iniciar Questionário
        <ArrowRight
          className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
          strokeWidth={1.5}
        />
      </button>

      <div className="mt-16 grid grid-cols-3 gap-8 w-full max-w-md">
        <div className="text-center">
          <div className="font-serif text-3xl font-bold text-stone-800">
            4
          </div>
          <div className="text-xs text-stone-500 mt-1">Perguntas</div>
        </div>
        <div className="text-center border-x border-stone-200">
          <div className="font-serif text-3xl font-bold text-stone-800">
            ~2
          </div>
          <div className="text-xs text-stone-500 mt-1">Minutos</div>
        </div>
        <div className="text-center">
          <div className="font-serif text-3xl font-bold text-stone-800">
            100%
          </div>
          <div className="text-xs text-stone-500 mt-1">Personalizado</div>
        </div>
      </div>
    </div>
  );
}
