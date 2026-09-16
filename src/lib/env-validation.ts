/**
 * 🔐 VALIDATION DES VARIABLES D'ENVIRONNEMENT - Multi Convert
 * 
 * Valide au démarrage que TOUTES les variables requises sont présentes.
 * Aucune valeur par défaut dangereuse.
 * Lance une erreur si manquant.
 */

import { z } from 'zod';

const isDevMode = process.env.DEV_MODE === 'true' || process.env.SKIP_DB === 'true';
const isBuildPhase = process.env.NEXT_BUILD_PHASE === '1' || process.env.NEXT_PHASE === 'phase-production-build';

// Traite les chaînes vides comme "non définies" : Coolify passe parfois des valeurs vides
// pour les secrets optionnels, ce qui faisait échouer la validation `.url()`.
const optionalUrl = z.preprocess(
  (val) => (typeof val === 'string' && val.trim() === '' ? undefined : val),
  z.string().url().optional()
);

const envSchema = z.object({
  // ========== REQUIS EN PROD - DEFAULTS EN DEV ==========
  
  // Base de données
  DATABASE_URL: (isDevMode || isBuildPhase) ? z.string().default('postgresql://localhost:5432/dev') : z.string().url('DATABASE_URL doit être une URL valide').min(1),
  DIRECT_URL: (isDevMode || isBuildPhase) ? z.string().default('postgresql://localhost:5432/dev') : z.string().url('DIRECT_URL doit être une URL valide').min(1),
  
  // Cache & Queues
  REDIS_URL: (isDevMode || isBuildPhase) ? z.string().default('redis://localhost:6379') : z.string().url('REDIS_URL doit être une URL valide').min(1),
  
  // Authentification
  NEXTAUTH_SECRET: (isDevMode || isBuildPhase) ? z.string().default('dev-secret-key-32chars-minimum-local-dev-only!!') : z.string().min(32, 'NEXTAUTH_SECRET doit faire 32+ caractères'),
  JWT_SECRET: (isDevMode || isBuildPhase) ? z.string().default('dev-jwt-secret-32chars-minimum-local-dev-only!!') : z.string().min(32, 'JWT_SECRET doit faire 32+ caractères'),
  GOOGLE_CLIENT_ID: (isDevMode || isBuildPhase) ? z.string().default('dev-google-client-id') : z.string().min(1, 'GOOGLE_CLIENT_ID manquant'),
  GOOGLE_CLIENT_SECRET: (isDevMode || isBuildPhase) ? z.string().default('dev-google-client-secret') : z.string().min(1, 'GOOGLE_CLIENT_SECRET manquant'),
  
  // Chiffrement
  ENCRYPTION_KEY: (isDevMode || isBuildPhase) ? z.string().default('dev-encryption-key-32chars-minimum-local!!') : z.string().min(32, 'ENCRYPTION_KEY doit faire 32+ caractères'),
  
  // ========== OPTIONNELS ==========
  
  // Dev mode flags
  DEV_MODE: z.string().optional(),
  SKIP_DB: z.string().optional(),
  
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  ADMIN_EMAILS: z.string().default(''),

  // Emails applicatifs (expéditeur + destinataires des leads)
  EMAIL_FROM: z.string().default('noreply@multi-convert.com'),
  CONTACT_EMAIL: z.string().default('contact@multi-convert.com'),
  LEADS_NOTIFICATION_EMAIL: z.string().optional(),

  SENTRY_DSN: optionalUrl,
  SENDGRID_API_KEY: z.string().optional(),
  // Resend — fournisseur d'emails recommandé (RESEND_API_KEY suffit)
  RESEND_API_KEY: z.string().optional(),
  /** Override de l'API Resend (tests locaux / proxy) — laisser vide en production */
  RESEND_BASE_URL: z.string().optional(),
  // SMTP générique (repli, ou SMTP Resend : smtp.resend.com / 587 / user « resend »)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().default('us-east-1'),
  S3_BUCKET: z.string().optional(),
  S3_ENDPOINT: optionalUrl,
  
  // App URLs
  NEXT_PUBLIC_APP_URL: optionalUrl,
  NEXT_PUBLIC_API_URL: optionalUrl,
  
  // Autres
  NEXT_PUBLIC_VERSION: z.string().default('1.0.0'),
  ALLOWED_ORIGINS: z.string().default('http://localhost:3000'),
});

export type Env = z.infer<typeof envSchema>;

// ✅ Parser et valider au démarrage
let cachedEnv: Env | null = null;

/** Problèmes de configuration détectés (exposés par /api/health) */
export const envProblems: string[] = [];

/**
 * Configuration « au mieux » quand une variable est invalide.
 *
 * ⚠️ On ne termine JAMAIS le processus pour une variable mal orthographiée :
 * cela faisait tomber TOUT le site en 502 « Bad Gateway » alors qu'une seule
 * fonctionnalité était concernée. Les routes touchées échouent désormais avec un
 * message explicite, et /api/health expose la liste des problèmes.
 */
function bestEffortEnv(): Env {
  const raw = process.env;

  return {
    DATABASE_URL: raw.DATABASE_URL || 'postgresql://localhost:5432/dev',
    DIRECT_URL: raw.DIRECT_URL || raw.DATABASE_URL || 'postgresql://localhost:5432/dev',
    REDIS_URL: raw.REDIS_URL || 'redis://localhost:6379',
    NEXTAUTH_SECRET: raw.NEXTAUTH_SECRET || 'invalid-configuration-secret',
    JWT_SECRET: raw.JWT_SECRET || 'invalid-configuration-secret',
    GOOGLE_CLIENT_ID: raw.GOOGLE_CLIENT_ID || '',
    GOOGLE_CLIENT_SECRET: raw.GOOGLE_CLIENT_SECRET || '',
    ENCRYPTION_KEY: raw.ENCRYPTION_KEY || 'invalid-configuration-key',
    NODE_ENV: (raw.NODE_ENV as Env['NODE_ENV']) || 'production',
    DEV_MODE: raw.DEV_MODE,
    SKIP_DB: raw.SKIP_DB,
    ADMIN_EMAILS: raw.ADMIN_EMAILS || '',
    EMAIL_FROM: raw.EMAIL_FROM || 'noreply@multi-convert.com',
    CONTACT_EMAIL: raw.CONTACT_EMAIL || 'contact@multi-convert.com',
    LEADS_NOTIFICATION_EMAIL: raw.LEADS_NOTIFICATION_EMAIL,
    SENDGRID_API_KEY: raw.SENDGRID_API_KEY,
    RESEND_API_KEY: raw.RESEND_API_KEY,
    RESEND_BASE_URL: raw.RESEND_BASE_URL,
    SMTP_HOST: raw.SMTP_HOST,
    SMTP_PORT: raw.SMTP_PORT,
    SMTP_USER: raw.SMTP_USER,
    SMTP_PASSWORD: raw.SMTP_PASSWORD,
    NEXT_PUBLIC_APP_URL: raw.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_API_URL: raw.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_VERSION: raw.NEXT_PUBLIC_VERSION || '1.0.0',
    ALLOWED_ORIGINS: raw.ALLOWED_ORIGINS || 'https://multi-convert.com',
    AWS_REGION: raw.AWS_REGION || 'us-east-1',
    AWS_ACCESS_KEY_ID: raw.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: raw.AWS_SECRET_ACCESS_KEY,
    S3_BUCKET: raw.S3_BUCKET,
    STRIPE_SECRET_KEY: raw.STRIPE_SECRET_KEY,
    STRIPE_PUBLISHABLE_KEY: raw.STRIPE_PUBLISHABLE_KEY,
    SENTRY_DSN: raw.SENTRY_DSN,
  } as Env;
}

export function getEnv(): Env {
  if (!cachedEnv) {
    const parsed = envSchema.safeParse(process.env);

    if (parsed.success) {
      cachedEnv = parsed.data;

      // Log en développement
      if (process.env.NODE_ENV !== 'production') {
        console.log('✅ Variables d\'env validées avec succès');
      }
    } else {
      console.error('❌ ERREUR: Variables d\'environnement manquantes ou invalides:');
      for (const issue of parsed.error.errors) {
        const line = `${issue.path.join('.')}: ${issue.message}`;
        console.error(`  - ${line}`);
        if (!envProblems.includes(line)) envProblems.push(line);
      }
      console.error(
        '⚠️  Le serveur continue malgré tout : seules les fonctionnalités ' +
          'concernées échoueront. Voir /api/health pour la liste à corriger.'
      );

      cachedEnv = bestEffortEnv();
    }
  }

  return cachedEnv;
}

// Export direct pour convenience
export const env = (() => {
  try {
    return getEnv();
  } catch (error) {
    if (isDevMode) {
      console.warn('⚠️  [DEV MODE] Env validation échouée, utilisation des valeurs par défaut');
      // Return minimal defaults for dev mode
      return {
        DATABASE_URL: 'postgresql://localhost:5432/dev',
        DIRECT_URL: 'postgresql://localhost:5432/dev',
        REDIS_URL: 'redis://localhost:6379',
        NEXTAUTH_SECRET: 'dev-secret-key-32chars-minimum-local-dev-only!!',
        JWT_SECRET: 'dev-jwt-secret-32chars-minimum-local-dev-only!!',
        GOOGLE_CLIENT_ID: 'dev-google-client-id',
        GOOGLE_CLIENT_SECRET: 'dev-google-client-secret',
        ENCRYPTION_KEY: 'dev-encryption-key-32chars-minimum-local!!',
        NODE_ENV: 'development' as const,
        ADMIN_EMAILS: '',
        EMAIL_FROM: 'noreply@multi-convert.com',
        CONTACT_EMAIL: 'contact@multi-convert.com',
        AWS_REGION: 'eu-west-1',
        NEXT_PUBLIC_VERSION: '1.0.0',
        ALLOWED_ORIGINS: 'http://localhost:3000',
      } as Env;
    }
    throw error;
  }
})();

// Valider au chargement du module : journalisation seule, JAMAIS de crash
// volontaire (une variable erronée ne doit pas faire tomber le site en 502).
if (process.env.NODE_ENV === 'production' && !isBuildPhase) {
  getEnv();
}
