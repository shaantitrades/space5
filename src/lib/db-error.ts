/**
 * 🔎 DIAGNOSTIC DES ERREURS BASE DE DONNÉES - Multi Convert
 *
 * Transforme une erreur Prisma en message exploitable dans les logs et en code
 * lisible dans les réponses HTTP (utile quand l'inscription ou la
 * réinitialisation de mot de passe renvoient « Erreur lors de… »).
 */

export interface DescribedDatabaseError {
  /** Code Prisma (P1001, P2021, P2022…) ou null */
  code: string | null;
  /** Une ligne unique, lisible, avec la cause probable */
  summary: string;
}

const HINTS: Record<string, string> = {
  P1001:
    "Base de données injoignable → vérifiez DATABASE_URL (hôte « mc_postgres » pour docker-compose.prod.yml) et l'état du conteneur Postgres.",
  P1000:
    'Authentification refusée par PostgreSQL → le mot de passe de DATABASE_URL ne correspond pas à celui du volume Postgres. ' +
    'POSTGRES_PASSWORD n’est appliqué qu’à la première initialisation du volume : soit alignez DATABASE_URL sur le mot de passe initial, ' +
    'soit changez-le dans la base (« ALTER USER postgres WITH PASSWORD \'…\'; »), puis redémarrez l’app.',
  P1013:
    'Chaîne de connexion invalide → vérifiez DATABASE_URL/DIRECT_URL (mot de passe encodé en URL : @ → %40, : → %3A, / → %2F, # → %23).',
  P1002:
    "Délai dépassé en joignant la base → vérifiez le réseau interne du stack (mc_postgres) et les règles du pare-feu.",
  P1012: 'DATABASE_URL ou DIRECT_URL invalide (schéma manquant, variable vide…).',
  P2021:
    'Table absente → le schéma n’a jamais été appliqué : exécutez `prisma db push`.',
  P2022:
    'Colonne absente → schéma non à jour (nouvelle version déployée sans `prisma db push`).',
  P2003: 'Contrainte de clé étrangère violée.',
  P2002: 'Valeur unique déjà présente (email en double ?).',
};

export function describeDatabaseError(error: unknown): DescribedDatabaseError {
  // PrismaClientKnownRequestError → `code` (P2021, P2022…)
  // PrismaClientInitializationError → `errorCode` (souvent absent : on infère)
  const raw = error as { code?: unknown; errorCode?: unknown };
  const explicitCode =
    typeof raw?.code === 'string'
      ? raw.code
      : typeof raw?.errorCode === 'string'
        ? raw.errorCode
        : null;

  // Les messages Prisma sont multi-lignes : la dernière ligne utile est la cause
  const message = extractMessage(error);
  const lines = message.split('\n').map((line) => line.trim()).filter(Boolean);

  const cause = pickCause(lines);
  const code = explicitCode ?? inferCodeFromMessage(message);
  const hint = code && HINTS[code] ? ` → ${HINTS[code]}` : '';

  return {
    code,
    summary: `${code ? `[${code}] ` : ''}${cause}${hint}`,
  };
}

/** Récupère le message même quand l'erreur n'est pas une instance d'Error (objets Prisma). */
function extractMessage(error: unknown): string {
  if (error instanceof Error) return error.message;

  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message?: unknown }).message === 'string'
  ) {
    return (error as { message: string }).message;
  }

  return String(error);
}

/** Les erreurs Prisma finissent parfois par « Validation Error Count: 1 » : on préfère la 1re ligne. */
function pickCause(lines: string[]): string {
  if (lines.length === 0) return 'Erreur inconnue';

  const last = lines[lines.length - 1];
  if (/^Validation Error Count/i.test(last) || last.length < 20) {
    return lines[0];
  }

  return last;
}

/** Certaines erreurs d'initialisation Prisma n'exposent pas de code : on le déduit. */
function inferCodeFromMessage(message: string): string | null {
  if (/Can't reach database server|make sure your database server is running/i.test(message)) return 'P1001';
  if (/Authentication failed|credentials for .* are not valid/i.test(message)) return 'P1000';
  if (/Timed out fetching a new connection|connection pool timed out/i.test(message)) return 'P1002';
  if (/does not exist in the current database/i.test(message)) return 'P2022';
  if (/table .* does not exist|relation .* does not exist/i.test(message)) return 'P2021';
  return null;
}
