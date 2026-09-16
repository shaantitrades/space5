/**
 * Health check endpoint
 *
 * ⚠️ Répond TOUJOURS 200 : le healthcheck du conteneur
 * (`docker-compose.prod.yml`) l'appelle — un 503 ferait redémarrer l'app en
 * boucle. Les détails servent au diagnostic (inscription / connexion en 500).
 *
 * GET /api/health → état de la base + colonnes manquantes éventuelles
 */
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { describeDatabaseError } from '@/lib/db-error';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Colonnes de `users` attendues par le code (dérivées du schéma Prisma). */
const EXPECTED_USER_COLUMNS = [
  'email',
  'password',
  'password_hash',
  'name',
  'plan',
  'credits',
  'email_verified',
  'reset_token',
  'reset_token_expiry',
  'accept_marketing',
  'role',
];

const isDevMode = process.env.DEV_MODE === 'true' || process.env.SKIP_DB === 'true';

export async function GET() {
  const payload: Record<string, unknown> = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Multi Convert',
  };

  if (isDevMode) {
    payload.database = {
      mode: 'dev-mock',
      reachable: false,
      note: 'DEV_MODE/SKIP_DB est actif : aucune connexion réelle à la base, aucun email réel.',
    };
    return NextResponse.json(payload);
  }

  try {
    await prisma.$queryRaw`SELECT 1`;

    const rows = await prisma.$queryRaw<Array<{ column_name: string }>>`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'users'
    `;

    const existing = new Set(rows.map((row) => row.column_name));
    const missing = EXPECTED_USER_COLUMNS.filter((column) => !existing.has(column));

    payload.database = {
      reachable: true,
      usersTable: existing.size > 0,
      schema: missing.length === 0 ? 'up-to-date' : 'outdated',
      missingColumns: missing,
      ...(missing.length > 0
        ? {
            hint:
              "Exécutez `prisma db push` dans le conteneur : sans ces colonnes, " +
              "l'inscription et la réinitialisation de mot de passe renvoient une erreur 500.",
          }
        : {}),
    };
  } catch (error) {
    const dbError = describeDatabaseError(error);
    payload.status = 'degraded';
    payload.database = {
      reachable: false,
      code: dbError.code,
      error: dbError.summary,
    };
  }

  return NextResponse.json(payload);
}

