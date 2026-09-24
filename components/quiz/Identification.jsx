'use client';

import { ArrowRight, ArrowLeft, User, Building } from 'lucide-react';
import { useState } from 'react';

const UNIDADES = [
  'Casa 01',
  'Casa 02',
  'Casa 03',
  'Casa 04',
  'Casa 05',
  'Casa 06',
  'Casa 07',
  'Casa 08',
];

export default function Identification({ onSubmit, onBack, initialName, initialUnidade }) {
  const [nome, setNome] = useState(initialName || '');
  const [unidade, setUnidade] = useState(initialUnidade || '');
  const [touched, setTouched] = useState(false);

  const isValid = nome.trim().length >= 2 && unidade !== '';

  const handleSubmit = (e) => {
    e?.preventDefault();
    setTouched(true);
    if (isValid) {
      onSubmit({ nome: nome.trim(), unidade });
    }
  };

  return (
    <div className="max-w-xl mx-auto animate-fade-in-up">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 text-stone-500 text-sm mb-3">
          <User className="w-4 h-4" strokeWidth={1.5} />
          Identificação
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 mb-3">
          Vamos começar por si
        </h2>
        <p className="text-stone-600 leading-relaxed">
          Precisamos de algumas informações básicas para personalizar a
          sua experiência de design.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="nome"
            className="block text-sm font-medium text-stone-700 mb-2"
          >
            Nome <span className="text-stone-400">*</span>
          </label>
          <input
            id="nome"
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder="O seu nome completo"
            className="w-full px-4 py-3.5 bg-white border border-stone-300 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-800 focus:ring-2 focus:ring-stone-800/10 transition-all"
            autoFocus
          />
          {touched && nome.trim().length < 2 && (
            <p className="mt-2 text-sm text-red-500">
              Por favor, insira o seu nome (mínimo 2 caracteres).
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="unidade"
            className="block text-sm font-medium text-stone-700 mb-2"
          >
            Unidade <span className="text-stone-400">*</span>
          </label>
          <div className="relative">
            <Building
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none"
              strokeWidth={1.5}
            />
            <select
              id="unidade"
              value={unidade}
              onChange={(e) => setUnidade(e.target.value)}
              onBlur={() => setTouched(true)}
              className="w-full pl-11 pr-4 py-3.5 bg-white border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-stone-800 focus:ring-2 focus:ring-stone-800/10 transition-all appearance-none cursor-pointer"
            >
              <option value="">Selecione a sua unidade...</option>
              {UNIDADES.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
          {touched && !unidade && (
            <p className="mt-2 text-sm text-red-500">
              Por favor, selecione a sua unidade.
            </p>
          )}
        </div>

        <div className="flex items-center justify-between pt-4">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-5 py-3 text-stone-600 hover:text-stone-900 font-medium text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
            Voltar
          </button>
          <button
            type="submit"
            disabled={!isValid}
            className="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 text-stone-50 rounded-full font-medium text-sm hover:bg-stone-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:gap-3"
          >
            Avançar
            <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
      </form>
    </div>
  );
}
