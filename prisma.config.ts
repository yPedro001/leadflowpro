import "dotenv/config";
import { defineConfig } from "prisma/config";

function getMigrationDatabaseUrl(): string | undefined {
  const connectionString = process.env["DIRECT_URL"] || process.env["DATABASE_URL"];
  if (!connectionString) return undefined;

  const url = new URL(connectionString);

  if (url.hostname.startsWith("db.") && url.hostname.endsWith(".supabase.co")) {
    url.username = "postgres";
  }

  if (url.hostname.endsWith(".pooler.supabase.com")) {
    url.port = "5432";
    url.searchParams.delete("pgbouncer");
  }

  url.searchParams.delete("sslmode");

  return url.toString();
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Use session/direct mode for migrations/DDL.
    url: getMigrationDatabaseUrl(),
  },
});
