'use server';

import { prisma } from '@/lib/prisma';
import { getAuthProfile } from './auth';
import { revalidatePath } from 'next/cache';
import { TicketCategory, TicketStatus, TicketPriority } from '@prisma/client';
import { getTicketsFromSupabase } from '@/lib/supabase/fallback-db';

export async function createTicket(data: { category: TicketCategory, title: string, description: string }) {
  const profile = await getAuthProfile();
  if (!profile) throw new Error('Não autorizado');

  if (!data.category || !data.title || !data.description) {
    throw new Error('Preencha todos os campos obrigatórios.');
  }

  const ticket = await prisma.supportTicket.create({
    data: {
      profileId: profile.id,
      category: data.category,
      title: data.title,
      description: data.description,
      status: 'ABERTO',
      priority: 'NORMAL',
      isReadByAdmin: false,
      isReadByCustomer: true,
      lastMessageAt: new Date()
    }
  });

  revalidatePath('/suporte');
  return { success: true, ticketId: ticket.id };
}

export async function getTickets() {
  const profile = await getAuthProfile();
  if (!profile) throw new Error('Nao autorizado');

  try {
    return await prisma.supportTicket.findMany({
      where: { profileId: profile.id },
      orderBy: { lastMessageAt: 'desc' },
      select: {
        id: true,
        category: true,
        title: true,
        status: true,
        createdAt: true,
        lastMessageAt: true,
        isReadByCustomer: true
      }
    });
  } catch (error: any) {
    if (error?.message?.includes('ENOTFOUND') || error?.message?.includes('database') || error?.message?.includes('connection')) {
      return getTicketsFromSupabase(profile.id);
    }
    throw error;
  }
}

export async function getTicketDetails(id: string) {
  const profile = await getAuthProfile();
  if (!profile) throw new Error('Não autorizado');

  const ticket = await prisma.supportTicket.findFirst({
    where: { id, profileId: profile.id },
    include: {
      messages: {
        where: { isInternalNote: false },
        orderBy: { createdAt: 'asc' }
      }
    }
  });

  if (!ticket) throw new Error('Chamado não encontrado');

  // Marcar como lido se o cliente abrir e havia algo novo do admin
  if (!ticket.isReadByCustomer) {
    await prisma.supportTicket.update({
      where: { id },
      data: { isReadByCustomer: true }
    });
  }

  return ticket;
}

export async function replyTicket(ticketId: string, message: string) {
  const profile = await getAuthProfile();
  if (!profile) throw new Error('Não autorizado');

  if (!message.trim()) throw new Error('A mensagem não pode estar vazia');

  const ticket = await prisma.supportTicket.findFirst({
    where: { id: ticketId, profileId: profile.id }
  });

  if (!ticket) throw new Error('Chamado não encontrado');
  if (ticket.status === 'FECHADO') throw new Error('Este chamado está fechado');

  await prisma.supportTicketMessage.create({
    data: {
      ticketId,
      senderType: 'CUSTOMER',
      senderProfileId: profile.id,
      message
    }
  });

  await prisma.supportTicket.update({
    where: { id: ticketId },
    data: {
      status: 'ABERTO',
      isReadByAdmin: false,
      isReadByCustomer: true,
      lastMessageAt: new Date()
    }
  });

  revalidatePath(`/suporte/${ticketId}`);
  revalidatePath('/suporte');
  
  return { success: true };
}

export async function requestReopen(ticketId: string) {
  const profile = await getAuthProfile();
  if (!profile) throw new Error('Não autorizado');

  const ticket = await prisma.supportTicket.findFirst({
    where: { id: ticketId, profileId: profile.id }
  });

  if (!ticket) throw new Error('Chamado não encontrado');
  if (ticket.status !== 'FECHADO') throw new Error('Chamado não está fechado');

  await prisma.supportTicket.update({
    where: { id: ticketId },
    data: {
      status: 'ABERTO',
      isReadByAdmin: false,
      lastMessageAt: new Date()
    }
  });

  await prisma.supportTicketMessage.create({
    data: {
      ticketId,
      senderType: 'CUSTOMER',
      senderProfileId: profile.id,
      message: 'O cliente solicitou a reabertura do chamado.'
    }
  });

  revalidatePath(`/suporte/${ticketId}`);
  revalidatePath('/suporte');

  return { success: true };
}
