import { getTicketDetails, replyTicket, requestReopen } from '@/actions/support';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LifeBuoy, ArrowLeft, Send, CheckCircle2, User, ShieldCheck, RefreshCcw, BadgeCheck } from 'lucide-react';
import Link from 'next/link';

export const metadata = { title: 'Chamado | LeadFlowPro' };

export default async function ChamadoDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ticket = await getTicketDetails(id);

  async function handleReply(formData: FormData) {
    'use server';
    const message = formData.get('message') as string;
    await replyTicket(id, message);
  }

  async function handleReopen() {
    'use server';
    await requestReopen(id);
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ABERTO': return <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Aberto</span>;
      case 'ATENDIMENTO': return <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Em Atendimento</span>;
      case 'RESPONDIDO': return <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Respondido</span>;
      case 'AGUARDANDO_CLIENTE': return <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Aguardando Você</span>;
      case 'RESOLVIDO': return <span className="bg-slate-500/10 text-slate-400 border border-slate-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Resolvido</span>;
      case 'FECHADO': return <span className="bg-slate-800 text-slate-500 border border-slate-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Fechado</span>;
      default: return null;
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/suporte" 
            className="p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-white">Chamado #{ticket.id.slice(0, 8)}</h1>
              {getStatusBadge(ticket.status)}
            </div>
            <p className="text-sm text-slate-400 mt-1 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> {ticket.category}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">{ticket.title}</h2>
        
        {/* Histórico de Mensagens */}
        <div className="space-y-6 mb-8">
          {/* Mensagem Original */}
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-gold-600/20 flex items-center justify-center shrink-0 border border-gold-600/30">
              <User className="w-5 h-5 text-gold-400" />
            </div>
            <div className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl p-4 rounded-tl-none">
              <div className="flex justify-between items-start mb-2">
                <span className="font-semibold text-slate-200">Você</span>
                <span className="text-xs text-slate-500">
                  {format(new Date(ticket.createdAt), "dd MMM yyyy, HH:mm", { locale: ptBR })}
                </span>
              </div>
              <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{ticket.description}</p>
            </div>
          </div>

          {/* Respostas */}
          {ticket.messages.map((msg: any) => (
            <div key={msg.id} className="flex gap-4">
              {msg.senderType === 'ADMIN' ? (
                <>
                  <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center shrink-0 border border-blue-600/30">
                    <ShieldCheck className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1 bg-blue-950/20 border border-blue-900/30 rounded-2xl p-4 rounded-tl-none">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-blue-400 flex items-center gap-1.5">
                        Equipe LeadFlowPro
                        <BadgeCheck className="w-4 h-4 text-blue-400" />
                      </span>
                      <span className="text-xs text-blue-300/50">
                        {format(new Date(msg.createdAt), "dd MMM yyyy, HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                    <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full bg-gold-600/20 flex items-center justify-center shrink-0 border border-gold-600/30">
                    <User className="w-5 h-5 text-gold-400" />
                  </div>
                  <div className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl p-4 rounded-tl-none">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-slate-200">Você</span>
                      <span className="text-xs text-slate-500">
                        {format(new Date(msg.createdAt), "dd MMM yyyy, HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                    <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Campo de Resposta */}
        {ticket.status !== 'FECHADO' && ticket.status !== 'RESOLVIDO' ? (
          <form action={handleReply} className="mt-6 border-t border-slate-800 pt-6">
            <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-2">Adicionar resposta</label>
            <div className="relative">
              <textarea 
                name="message" 
                id="message" 
                required 
                rows={4}
                placeholder="Escreva sua mensagem aqui..." 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-gold-500/50 transition-all resize-y pr-16"
              ></textarea>
              <button 
                type="submit"
                className="absolute bottom-3 right-3 bg-gold-600 hover:bg-gold-700 text-white p-2 rounded-lg transition-all shadow-lg shadow-gold-500/20"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-6 border-t border-slate-800 pt-6 text-center">
            <p className="text-slate-400 mb-4">Este chamado foi marcado como {ticket.status.toLowerCase()}. Nenhuma nova resposta pode ser adicionada.</p>
            {ticket.status === 'FECHADO' && (
              <form action={handleReopen}>
                <button type="submit" className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 mx-auto">
                  <RefreshCcw className="w-4 h-4" />
                  Solicitar Reabertura
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
