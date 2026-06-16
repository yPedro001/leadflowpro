import AgendaPage from '@/features/agenda/AgendaPage';
import { createServerSupabase } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { getPlanConfig } from '@/lib/plans';
import { PremiumFeatureBlocked } from '@/components/ui/PremiumFeatureBlocked';

export const metadata = {
  title: 'Agenda de Follow-up | LeadFlowPro',
  description: 'Gerencie sua cadência diária de prospecção.',
};

export default async function Page() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const profile = await prisma.profile.findUnique({
      where: { authUid: user.id },
      select: { plan: true },
    });
    
    if (profile) {
      const planConfig = getPlanConfig(profile.plan);
      if (!planConfig.canUseAgenda) {
        return (
          <PremiumFeatureBlocked 
            title="Agenda Inteligente" 
            description="A organização automática das tarefas diárias de follow-up e priorização de contatos é um recurso dos planos superiores." 
          />
        );
      }
    }
  }

  return <AgendaPage />;
}

