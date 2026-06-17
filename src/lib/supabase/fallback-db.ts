import { createAdminSupabase } from '@/lib/supabase/server';

type SupabaseUser = {
  id: string;
  email?: string;
  user_metadata?: { full_name?: string };
};

export async function getOrCreateProfileFromSupabase(user: SupabaseUser) {
  const admin = createAdminSupabase();
  const { data: existing, error: selectError } = await admin
    .from('profiles')
    .select('id, auth_uid, name, email, role, plan, access_status, payment_status, monthly_amount, payment_method, expires_at, last_payment_at, next_billing_at, internal_notes, suspension_reason, created_at, updated_at')
    .eq('auth_uid', user.id)
    .maybeSingle();

  if (selectError) throw selectError;
  if (existing) return normalizeProfile(existing);

  const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario';
  const { data: created, error: insertError } = await admin
    .from('profiles')
    .insert({
      auth_uid: user.id,
      email: user.email,
      name,
    })
    .select('id, auth_uid, name, email, role, plan, access_status, payment_status, monthly_amount, payment_method, expires_at, last_payment_at, next_billing_at, internal_notes, suspension_reason, created_at, updated_at')
    .single();

  if (insertError) throw insertError;
  return normalizeProfile(created);
}

export async function getOperatorsFromSupabase(profileId: string) {
  const admin = createAdminSupabase();
  const { data, error } = await admin
    .from('operators')
    .select('id, name, is_active')
    .eq('profile_id', profileId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map((operator) => ({
    id: operator.id,
    name: operator.name,
    isActive: operator.is_active,
  }));
}

export async function getLeadPageFromSupabase({
  profileId,
  page,
  take,
  search,
  status,
}: {
  profileId: string;
  page: number;
  take: number;
  search?: string;
  status?: string;
}) {
  const admin = createAdminSupabase();
  const from = (page - 1) * take;
  const to = from + take - 1;

  let query = admin
    .from('leads')
    .select('*, last_operator:operators!leads_last_operator_id_fkey(name)', { count: 'exact' })
    .eq('profile_id', profileId)
    .order('updated_at', { ascending: false })
    .range(from, to);

  if (status) query = query.eq('status', status);

  if (search?.trim()) {
    const term = search.trim().replace(/[%_]/g, '');
    query = query.or(`full_name.ilike.%${term}%,company.ilike.%${term}%,email.ilike.%${term}%,job_title.ilike.%${term}%,phone.ilike.%${term}%`);
  }

  const { data, error, count } = await query;
  if (error) throw error;

  const total = count ?? 0;
  return {
    leads: (data ?? []).map(normalizeLead),
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / take)),
    error: undefined as string | undefined,
  };
}

export async function getTicketsFromSupabase(profileId: string) {
  const admin = createAdminSupabase();
  const { data, error } = await admin
    .from('support_tickets')
    .select('id, category, title, status, created_at, last_message_at, is_read_by_customer')
    .eq('profile_id', profileId)
    .order('last_message_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map((ticket) => ({
    id: ticket.id,
    category: ticket.category,
    title: ticket.title,
    status: ticket.status,
    createdAt: ticket.created_at,
    lastMessageAt: ticket.last_message_at,
    isReadByCustomer: ticket.is_read_by_customer,
  }));
}

function normalizeProfile(profile: any) {
  return {
    id: profile.id,
    authUid: profile.auth_uid,
    name: profile.name,
    email: profile.email,
    role: profile.role,
    plan: profile.plan,
    accessStatus: profile.access_status,
    paymentStatus: profile.payment_status,
    monthlyAmount: profile.monthly_amount,
    paymentMethod: profile.payment_method,
    expiresAt: profile.expires_at,
    lastPaymentAt: profile.last_payment_at,
    nextBillingAt: profile.next_billing_at,
    internalNotes: profile.internal_notes,
    suspensionReason: profile.suspension_reason,
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
  };
}

function normalizeLead(lead: any) {
  return {
    id: lead.id,
    profileId: lead.profile_id,
    code: lead.code,
    fullName: lead.full_name,
    company: lead.company,
    jobTitle: lead.job_title,
    email: lead.email,
    phone: lead.phone,
    linkedinUrl: lead.linkedin_url,
    whatsappUrl: lead.whatsapp_url,
    status: lead.status,
    source: lead.source,
    notes: lead.notes,
    importBatchId: lead.import_batch_id,
    customSource: lead.custom_source,
    lastOperatorId: lead.last_operator_id,
    createdAt: lead.created_at,
    updatedAt: lead.updated_at,
    histories: [],
    leadNotes: [],
    cadenceEngine: null,
    lastOperator: lead.last_operator ? { name: lead.last_operator.name } : null,
  };
}
