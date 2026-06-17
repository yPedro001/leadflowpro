CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TicketCategory') THEN
    CREATE TYPE "TicketCategory" AS ENUM ('ACESSO', 'ERRO', 'DUVIDA', 'FINANCEIRO', 'SUGESTAO', 'OUTRO');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TicketStatus') THEN
    CREATE TYPE "TicketStatus" AS ENUM ('ABERTO', 'ATENDIMENTO', 'RESPONDIDO', 'AGUARDANDO_CLIENTE', 'RESOLVIDO', 'FECHADO');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TicketPriority') THEN
    CREATE TYPE "TicketPriority" AS ENUM ('BAIXA', 'NORMAL', 'ALTA');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'MessageSenderType') THEN
    CREATE TYPE "MessageSenderType" AS ENUM ('CUSTOMER', 'ADMIN');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "support_tickets" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "profile_id" TEXT NOT NULL,
  "category" "TicketCategory" NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "status" "TicketStatus" NOT NULL DEFAULT 'ABERTO',
  "priority" "TicketPriority" NOT NULL DEFAULT 'NORMAL',
  "is_read_by_admin" BOOLEAN NOT NULL DEFAULT false,
  "is_read_by_customer" BOOLEAN NOT NULL DEFAULT true,
  "last_message_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "closed_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "support_ticket_messages" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "ticket_id" TEXT NOT NULL,
  "sender_type" "MessageSenderType" NOT NULL,
  "sender_profile_id" TEXT,
  "message" TEXT NOT NULL,
  "is_internal_note" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "support_ticket_messages_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'support_tickets_profile_id_fkey'
  ) THEN
    ALTER TABLE "support_tickets"
      ADD CONSTRAINT "support_tickets_profile_id_fkey"
      FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'support_ticket_messages_ticket_id_fkey'
  ) THEN
    ALTER TABLE "support_ticket_messages"
      ADD CONSTRAINT "support_ticket_messages_ticket_id_fkey"
      FOREIGN KEY ("ticket_id") REFERENCES "support_tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "support_tickets_profile_id_idx" ON "support_tickets"("profile_id");
CREATE INDEX IF NOT EXISTS "support_tickets_status_idx" ON "support_tickets"("status");
CREATE INDEX IF NOT EXISTS "support_tickets_created_at_idx" ON "support_tickets"("created_at");
CREATE INDEX IF NOT EXISTS "support_ticket_messages_ticket_id_idx" ON "support_ticket_messages"("ticket_id");
CREATE INDEX IF NOT EXISTS "support_ticket_messages_created_at_idx" ON "support_ticket_messages"("created_at");

DO $$
DECLARE
  tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'admin_audit_logs',
    'billing_records',
    'cadences',
    'cadence_stages',
    'lead_cadence_events',
    'lead_cadence_progress',
    'lead_histories',
    'lead_notes',
    'lead_scheduled_actions',
    'leads',
    'notifications',
    'operators',
    'support_ticket_messages',
    'support_tickets',
    'templates'
  ]
  LOOP
    IF to_regclass('public.' || tbl) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE public.%I ALTER COLUMN id SET DEFAULT gen_random_uuid()::text', tbl);
    END IF;
  END LOOP;
END $$;

DO $$
DECLARE
  tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'billing_records',
    'cadences',
    'cadence_stages',
    'lead_notes',
    'lead_scheduled_actions',
    'leads',
    'notifications',
    'operators',
    'profiles',
    'support_tickets',
    'templates'
  ]
  LOOP
    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = tbl
        AND column_name = 'updated_at'
    ) THEN
      EXECUTE format('ALTER TABLE public.%I ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP', tbl);
    END IF;
  END LOOP;
END $$;
