/**
 * Health check endpoint — SONDE DE VIVACITÉ
 *
 * ⚠️ Contraintes fortes (vécues en production) :
 *  - doit répondre VITE et TOUJOURS 200 : c'est la sonde du conteneur
 *    (`HEALTHCHECK` du Dockerfile + `docker-compose.prod.yml`). Une sonde lente
 *    ou en erreur fait passer le conteneur en « unhealthy » et le proxy renvoie
 *    alors « Gateway Timeout » (504) pour TOUT le site ;
 *  - donc AUCUNE requête base de données par défaut : la panne d'une dépendance
 *    ne doit jamais rendre le site indisponible.
 *
 *  GET /api/health          → vivacité + configuration + fournisseur email (instantané)
 *  GET /api/health?db=1     → ajoute le diagnostic base + schéma (délai max 2,5 s)
 */
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { describeDatabaseError } from '@/lib/db-error';
import { envProblems } from '@/lib/env-validation';
import { getEmailProvider } from '@/lib/email';

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

/** Délai maximal accordé au diagnostic base : la sonde ne doit jamais bloquer. */
const DB_TIMEOUT_MS = 2500;

/** Borne une promesse dans le temps (le timeout de Prisma peut être long). */
async function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error(`${label} : délai de ${ms} ms dépassé`)),
          ms
        );
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function GET(request: Request) {
  const payload: Record<string, unknown> = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Multi Convert',
  };

  // Configuration : variables invalides + fournisseur d'email réellement actif
  // (lecture en mémoire : instantané, sans dépendance externe)
  payload.env = { ok: envProblems.length === 0, problems: envProblems };
  payload.email = { provider: getEmailProvider() };

  const wantsDatabase = new URL(request.url).searchParams.get('db') === '1';

  if (!wantsDatabase) {
    payload.database = {
      checked: false,
      note: 'Diagnostic base non exécuté (sonde de vivacité). Appeler /api/health?db=1 pour le tester.',
    };
    return NextResponse.json(payload);
  }

  if (isDevMode) {
    payload.database = {
      mode: 'dev-mock',
      reachable: false,
      note: 'DEV_MODE/SKIP_DB est actif : aucune connexion réelle à la base, aucun email réel.',
    };
    return NextResponse.json(payload);
  }

  try {
    await withTimeout(prisma.$queryRaw`SELECT 1`, DB_TIMEOUT_MS, 'Base de données');

    const rows = await withTimeout(
      prisma.$queryRaw<Array<{ column_name: string }>>`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'users'
      `,
      DB_TIMEOUT_MS,
      'Lecture du schéma'
    );

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

