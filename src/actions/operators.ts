'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getAuthProfile } from './auth';
import {
  countActiveOperatorsFromSupabase,
  createOperatorFromSupabase,
  getAllOperatorsFromSupabase,
} from '@/lib/supabase/fallback-db';

export async function getOperators() {
  const profile = await getAuthProfile();
  if (!profile) throw new Error('Não autenticado');

  try {
    const operators = await prisma.operator.findMany({
      where: { profileId: profile.id },
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, operators };
  } catch (error: any) {
    console.error('Erro ao buscar operadores:', error);
    if (isPrismaConnectionError(error)) {
      const operators = await getAllOperatorsFromSupabase(profile.id);
      return { success: true, operators };
    }
    return { success: false, error: 'Erro ao buscar operadores' };
  }
}

export async function createOperator(formData: FormData) {
  const profile = await getAuthProfile();
  if (!profile) throw new Error('Não autenticado');

  const name = formData.get('name') as string;
  if (!name || name.trim() === '') {
    return { success: false, error: 'Nome do operador é obrigatório' };
  }

  // Verificação de limites do plano
  const { getPlanConfig } = await import('@/lib/plans');
  const planConfig = getPlanConfig(profile.plan);
  if (planConfig.maxOperators !== null) {
    let currentOperators = 0;
    try {
      currentOperators = await prisma.operator.count({
        where: { profileId: profile.id, isActive: true }
      });
    } catch (error: any) {
      if (!isPrismaConnectionError(error)) throw error;
      currentOperators = await countActiveOperatorsFromSupabase(profile.id);
    }
    if (currentOperators >= planConfig.maxOperators) {
      return { success: false, error: `Seu plano atual permite até ${planConfig.maxOperators} operadores. Faça upgrade para adicionar mais operadores.` };
    }
  }

  try {
    const operator = await prisma.operator.create({
      data: {
        profileId: profile.id,
        name: name.trim(),
        isActive: true,
      },
    });
    revalidatePath('/settings');
    return { success: true, operator };
  } catch (error: any) {
    console.error('Erro ao criar operador:', error);
    if (isPrismaConnectionError(error)) {
      const operator = await createOperatorFromSupabase(profile.id, name.trim());
      revalidatePath('/settings');
      return { success: true, operator };
    }
    return { success: false, error: 'Erro ao criar operador' };
  }
}

function isPrismaConnectionError(error: any) {
  const message = error?.message ?? '';
  return message.includes('ENOTFOUND') || message.includes('database') || message.includes('connection');
}

export async function updateOperator(id: string, formData: FormData) {
  const profile = await getAuthProfile();
  if (!profile) throw new Error('Não autenticado');

  const name = formData.get('name') as string;
  if (!name || name.trim() === '') {
    return { success: false, error: 'Nome do operador é obrigatório' };
  }

  try {
    // Verifica pertencimento
    const existing = await prisma.operator.findFirst({
      where: { id, profileId: profile.id }
    });
    if (!existing) return { success: false, error: 'Operador não encontrado' };

    const operator = await prisma.operator.update({
      where: { id },
      data: { name: name.trim() },
    });
    revalidatePath('/settings');
    return { success: true, operator };
  } catch (error: any) {
    console.error('Erro ao atualizar operador:', error);
    return { success: false, error: 'Erro ao atualizar operador' };
  }
}

export async function toggleOperatorStatus(id: string, isActive: boolean) {
  const profile = await getAuthProfile();
  if (!profile) throw new Error('Não autenticado');

  try {
    const existing = await prisma.operator.findFirst({
      where: { id, profileId: profile.id }
    });
    if (!existing) return { success: false, error: 'Operador não encontrado' };

    if (isActive) {
      // Verificação de limites do plano ao ativar
      const { getPlanConfig } = await import('@/lib/plans');
      const planConfig = getPlanConfig(profile.plan);
      if (planConfig.maxOperators !== null) {
    let currentOperators = 0;
    try {
      currentOperators = await prisma.operator.count({
        where: { profileId: profile.id, isActive: true }
      });
    } catch (error: any) {
      if (!isPrismaConnectionError(error)) throw error;
      currentOperators = await countActiveOperatorsFromSupabase(profile.id);
    }
    if (currentOperators >= planConfig.maxOperators) {
      return { success: false, error: `Seu plano atual permite até ${planConfig.maxOperators} operadores. Faça upgrade para adicionar mais operadores.` };
    }
  }
    }

    const operator = await prisma.operator.update({
      where: { id },
      data: { isActive },
    });
    revalidatePath('/settings');
    return { success: true, operator };
  } catch (error: any) {
    console.error('Erro ao alterar status do operador:', error);
    return { success: false, error: 'Erro ao alterar status' };
  }
}

export async function deleteOperator(id: string) {
  const profile = await getAuthProfile();
  if (!profile) throw new Error('Não autenticado');

  try {
    const existing = await prisma.operator.findFirst({
      where: { id, profileId: profile.id }
    });
    if (!existing) return { success: false, error: 'Operador não encontrado' };

    await prisma.operator.delete({
      where: { id },
    });
    revalidatePath('/settings');
    return { success: true };
  } catch (error: any) {
    console.error('Erro ao deletar operador:', error);
    return { success: false, error: 'Não é possível excluir um operador que possui histórico. Ao invés disso, desative-o.' };
  }
}
