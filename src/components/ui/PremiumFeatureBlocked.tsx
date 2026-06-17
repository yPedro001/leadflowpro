'use client';

import { Lock, Crown } from 'lucide-react';
import Link from 'next/link';

export function PremiumFeatureBlocked({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="bg-amber-500/10 p-6 rounded-full mb-6">
        <Lock className="w-16 h-16 text-amber-500" />
      </div>
      <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-4">{title}</h1>
      <p className="text-slate-500 dark:text-slate-400 max-w-lg mb-8 text-lg">
        {description}
      </p>
      
      <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Crown className="w-6 h-6 text-amber-500" />
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Faça o Upgrade para o Profissional</h3>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Desbloqueie acesso completo a todas as ferramentas, aumente seus limites e escale sua operação.
        </p>
        <Link 
          href="https://wa.me/5511961482455?text=Ol%C3%A1%2C%20gostaria%20de%20fazer%20o%20upgrade%20do%20meu%20plano%20no%20LeadFlowPro" 
          target="_blank"
          className="flex items-center justify-center w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-gold-600 hover:from-amber-600 hover:to-gold-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-amber-500/25"
        >
          Falar com Consultor
        </Link>
      </div>
    </div>
  );
}
