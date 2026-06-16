const { createClient } = require('@supabase/supabase-js');
const { prisma } = require('./src/lib/prisma');
require('dotenv').config({ path: '.env' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function testLoginAndAccess() {
  console.log('Tentando login com teste2@gmail.com...');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'teste2@gmail.com',
    password: '@senha123',
  });

  if (authError) {
    console.error('Erro no login:', authError);
    return;
  }

  const user = authData.user;
  console.log('Login bem sucedido! User ID:', user.id);

  console.log('Simulando getAuthProfile...');
  try {
    const profile = await prisma.profile.upsert({
      where: { authUid: user.id },
      update: {},
      create: {
        authUid: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário',
      },
    });
    console.log('Profile obtido com sucesso:', profile);
    
    console.log('Simulando a busca de cadências (getLeads)...');
    const leads = await prisma.lead.findMany({
      where: { profileId: profile.id },
      include: {
        lastOperator: { select: { name: true } },
        leadNotes: { 
          include: { operator: { select: { name: true } } },
          orderBy: { createdAt: 'desc' }, 
          take: 3 
        },
        cadenceEngine: {
          select: {
            status: true,
            currentStageOrder: true,
            cadence: {
              select: {
                stages: {
                  select: {
                    order: true,
                    channel: true,
                    template: {
                      select: { name: true }
                    }
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { updatedAt: 'desc' },
      take: 10,
    });
    
    console.log('Leads carregados com sucesso! Quantidade:', leads.length);
    
  } catch (err) {
    console.error('ERRO AO ACESSAR DADOS NO PRISMA:', err);
  } finally {
    console.log('Desconectando...');
    process.exit(0);
  }
}

testLoginAndAccess();
