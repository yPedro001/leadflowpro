import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool, type PoolConfig } from 'pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const connectionString = getRuntimeDatabaseUrl();
  const pool = new Pool({
    ...getPoolConfig(connectionString),
    max: Number(process.env.PRISMA_POOL_MAX ?? 3),
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
    ssl: shouldUseSsl(connectionString) ? { rejectUnauthorized: false } : undefined,
  });

  const adapter = new PrismaPg(pool, {
    onPoolError: (error) => console.error('[Prisma] pool error', error),
  });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });
}

function getRuntimeDatabaseUrl(): string {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('[Prisma] DATABASE_URL/DIRECT_URL nao esta definida');
    throw new Error('DATABASE_URL ou DIRECT_URL nao configurada.');
  }

  const url = new URL(connectionString);

  if (url.hostname.startsWith('db.') && url.hostname.endsWith('.supabase.co')) {
    url.username = 'postgres';
  }

  if (url.hostname.endsWith('.pooler.supabase.com')) {
    const projectRef = url.username.startsWith('postgres.')
      ? url.username.slice('postgres.'.length)
      : undefined;

    if (projectRef) {
      url.hostname = `db.${projectRef}.supabase.co`;
      url.username = 'postgres';
    }

    url.searchParams.delete('pgbouncer');
  }

  url.searchParams.delete('sslmode');

  return url.toString();
}

function getPoolConfig(connectionString: string): PoolConfig {
  const url = new URL(connectionString);

  return {
    host: url.hostname,
    port: Number(url.port || 5432),
    database: url.pathname.replace(/^\//, '') || 'postgres',
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
  };
}

function shouldUseSsl(connectionString: string): boolean {
  const { hostname } = new URL(connectionString);
  return hostname !== 'localhost' && hostname !== '127.0.0.1';
}

export function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getPrisma();
    const value = Reflect.get(client, prop, receiver);

    return typeof value === 'function' ? value.bind(client) : value;
  },
});
