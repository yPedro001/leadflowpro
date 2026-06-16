export const dynamic = 'force-dynamic';

import { createServerSupabase } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { OperatorProvider } from '@/components/providers/OperatorProvider';
import { CadenceProvider } from '@/components/providers/CadenceProvider';
import { ProfileProvider } from '@/components/providers/ProfileProvider';
import { prisma } from '@/lib/prisma';
import { unstable_cache } from 'next/cache';

const getOperatorsCached = unstable_cache(
  async (profileId: string) => {
    return prisma.operator.findMany({
      where: { profileId, isActive: true },
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, isActive: true },
    });
  },
  ['operators'],
  { revalidate: 300, tags: ['operators'] }
);

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  let profile = null;
  let profileError = null;
  try {
    profile = await prisma.profile.findUnique({
      where: { authUid: user.id },
      select: { id: true, authUid: true, name: true, email: true, plan: true },
    });
  } catch (error: any) {
    console.error('[Layout] Erro ao buscar profile:', error);
    profileError = error.message;
  }

  if (profileError) {
    return (
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 text-center border border-red-200 dark:border-red-900/30">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Erro de Conexão</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm">
            Não foi possível carregar seu perfil devido a uma instabilidade ou erro de esquema no banco de dados.
          </p>
          <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg text-left text-xs font-mono text-red-600 dark:text-red-400 overflow-x-auto mb-6">
            {profileError}
          </div>
          <a href="/login" className="inline-flex items-center justify-center w-full py-3 px-4 bg-gold-500 hover:bg-gold-600 text-white font-medium rounded-xl transition-colors">
            Voltar para o Login
          </a>
        </div>
      </div>
    );
  }

  const operators = profile ? await getOperatorsCached(profile.id) : [];

  return (
    <ProfileProvider profile={profile as any}>
      <CadenceProvider>
        <OperatorProvider operators={operators}>
          <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
            <Sidebar />
            <div className="flex-1 ml-64">
              <Header userName={profile?.name || user.email || 'Usuário'} />
              <main className="p-4 md:p-6 pt-24">
                {children}
              </main>
            </div>
          </div>
        </OperatorProvider>
      </CadenceProvider>
    </ProfileProvider>
  );
}
