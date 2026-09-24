'use client';

import { ArrowRight } from 'lucide-react';

export default function ProgressBar({ current, total }) {
  const percentage = Math.round((current / total) * 100);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-stone-500 tracking-wide uppercase">
          Passo {current} de {total}
        </span>
        <span className="text-xs font-medium text-stone-500">
          {percentage}%
        </span>
      </div>
      <div className="h-1.5 w-full bg-stone-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-stone-800 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
