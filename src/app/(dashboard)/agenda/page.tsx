import AgendaPage from '@/features/agenda/AgendaPage';
import { getAuthProfile } from '@/actions/auth';
import { getPlanConfig } from '@/lib/plans';
import { PremiumFeatureBlocked } from '@/components/ui/PremiumFeatureBlocked';

export const metadata = {
  title: 'Agenda de Follow-up | LeadFlowPro',
  description: 'Gerencie sua cadencia diaria de prospeccao.',
};

export default async function Page() {
  const profile = await getAuthProfile();
  const planConfig = getPlanConfig(profile.plan);

  if (!planConfig.canUseAgenda) {
    return (
      <PremiumFeatureBlocked
        title="Agenda Inteligente"
        description="A organizacao automatica das tarefas diarias de follow-up e priorizacao de contatos e um recurso dos planos superiores."
      />
    );
  }

  return <AgendaPage />;
}
