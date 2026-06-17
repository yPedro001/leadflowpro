import { getTickets } from '@/actions/support';
import Link from 'next/link';
import { LifeBuoy, PlusCircle, Clock, CheckCircle2, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const metadata = { title: 'Suporte | LeadFlowPro' };

const supportWhatsAppUrl = 'https://wa.me/5511961482455?text=Ol%C3%A1%2C%20preciso%20de%20suporte%20no%20LeadFlowPro';

export default async function SuportePage() {
  const tickets = await getTickets();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ABERTO': return <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-1 rounded-md text-xs font-medium">Aberto</span>;
      case 'ATENDIMENTO': return <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-1 rounded-md text-xs font-medium">Em Atendimento</span>;
      case 'RESPONDIDO': return <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded-md text-xs font-medium">Respondido</span>;
      case 'AGUARDANDO_CLIENTE': return <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-1 rounded-md text-xs font-medium">Aguardando Você</span>;
      case 'RESOLVIDO': return <span className="bg-slate-500/10 text-slate-400 border border-slate-500/20 px-2 py-1 rounded-md text-xs font-medium">Resolvido</span>;
      case 'FECHADO': return <span className="bg-slate-800 text-slate-500 border border-slate-700 px-2 py-1 rounded-md text-xs font-medium">Fechado</span>;
      default: return null;
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pt-4 md:pt-6 pb-10">
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 md:flex-row md:items-center md:justify-between md:p-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <LifeBuoy className="w-8 h-8 text-gold-500" />
            Suporte
          </h1>
          <p className="text-slate-400 mt-1">Acompanhe seus chamados e fale com a nossa equipe.</p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:flex-row md:w-auto">
          <a
            href={supportWhatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 font-semibold text-emerald-300 transition-all hover:bg-emerald-500/20 md:w-auto"
          >
            <MessageCircle className="w-5 h-5" />
            Falar com Suporte
          </a>
          <Link
            href="/suporte/novo"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gold-600 px-4 py-2.5 font-semibold text-white shadow-lg shadow-gold-500/20 transition-all hover:bg-gold-700 md:w-auto"
          >
            <PlusCircle className="w-5 h-5" />
            Abrir Chamado
          </Link>
        </div>
      </div>

      {tickets.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center md:p-12">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <LifeBuoy className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Nenhum chamado aberto</h3>
          <p className="text-slate-400 mb-6">Você ainda não precisou do nosso suporte. Se tiver alguma dúvida, estamos à disposição!</p>
          <a
            href={supportWhatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 font-semibold text-emerald-300 transition-all hover:bg-emerald-500/20"
          >
            <MessageCircle className="w-5 h-5" />
            Falar com Suporte
          </a>
        </div>
      ) : (
        <div className="grid gap-4">
          {tickets.map(ticket => (
            <Link key={ticket.id} href={`/suporte/${ticket.id}`} className="block">
              <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition-all group">
                <div className="flex flex-col gap-4 md:flex-row md:items-start">
                  <div className={`p-3 rounded-xl ${!ticket.isReadByCustomer ? 'bg-gold-500/10 text-gold-400' : 'bg-slate-800 text-slate-400'}`}>
                    <LifeBuoy className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-3 mb-1">
                      <h3 className="font-semibold text-white group-hover:text-gold-400 transition-colors">{ticket.title}</h3>
                      {getStatusBadge(ticket.status)}
                      {!ticket.isReadByCustomer && (
                        <span className="bg-gold-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Nova Resposta
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 text-sm text-slate-400 sm:flex-row sm:items-center sm:gap-4">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        {ticket.category}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        Atualizado em {format(new Date(ticket.lastMessageAt), "dd 'de' MMM, HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
