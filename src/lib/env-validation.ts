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
  SENTRY_DSN: optionalUrl,
  SENDGRID_API_KEY: z.string().optional(),
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

export function getEnv(): Env {
  if (!cachedEnv) {
    try {
      cachedEnv = envSchema.parse(process.env);
      
      // Log en développement
      if (process.env.NODE_ENV !== 'production') {
        console.log('✅ Variables d\'env validées avec succès');
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('❌ ERREUR: Variables d\'environnement manquantes ou invalides:');
        error.errors.forEach((err) => {
          console.error(`  - ${err.path.join('.')}: ${err.message}`);
        });
      }
      
      // En production, terminer le processus
      if (process.env.NODE_ENV === 'production') {
        process.exit(1);
      }
      
      throw error;
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
        AWS_REGION: 'eu-west-1',
        NEXT_PUBLIC_VERSION: '1.0.0',
        ALLOWED_ORIGINS: 'http://localhost:3000',
      } as Env;
    }
    throw error;
  }
})();

// Valider au module load (non-blocking)
if (process.env.NODE_ENV === 'production' && !isBuildPhase) {
  try {
    getEnv();
  } catch (error) {
    console.error('❌ ERREUR FATALE: Configuration invalide');
    process.exit(1);
  }
}
