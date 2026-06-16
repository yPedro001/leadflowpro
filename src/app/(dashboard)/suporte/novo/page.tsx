import { createTicket } from '@/actions/support';
import { redirect } from 'next/navigation';
import { LifeBuoy, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const metadata = { title: 'Novo Chamado | LeadFlowPro' };

export default function NovoChamadoPage() {
  async function handleSubmit(formData: FormData) {
    'use server';
    const category = formData.get('category') as any;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;

    await createTicket({ category, title, description });
    redirect('/suporte');
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          href="/suporte" 
          className="p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Abrir Novo Chamado</h1>
          <p className="text-slate-400 mt-1">Nossa equipe responderá o mais rápido possível.</p>
        </div>
      </div>

      <form action={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-slate-300 mb-2">Categoria</label>
          <select 
            name="category" 
            id="category" 
            required 
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-gold-500/50 transition-all"
          >
            <option value="">Selecione o tipo de problema...</option>
            <option value="DUVIDA">Dúvida de Uso</option>
            <option value="ERRO">Erro no Sistema</option>
            <option value="ACESSO">Acesso / Login</option>
            <option value="FINANCEIRO">Plano / Pagamento</option>
            <option value="SUGESTAO">Sugestão de Melhoria</option>
            <option value="OUTRO">Outro Assunto</option>
          </select>
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-2">Título (Resumo do problema)</label>
          <input 
            type="text" 
            name="title" 
            id="title" 
            required 
            placeholder="Ex: Como importar meus leads?" 
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-gold-500/50 transition-all"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-2">Descrição detalhada</label>
          <textarea 
            name="description" 
            id="description" 
            required 
            rows={5}
            placeholder="Descreva com o máximo de detalhes possível o que você precisa ou o problema que está enfrentando..." 
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-gold-500/50 transition-all resize-y"
          ></textarea>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button 
            type="submit"
            className="bg-gold-600 hover:bg-gold-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-gold-500/20 flex items-center gap-2"
          >
            <LifeBuoy className="w-5 h-5" />
            Enviar Chamado
          </button>
        </div>
      </form>
    </div>
  );
}
