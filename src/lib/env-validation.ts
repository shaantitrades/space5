/**
 * 🔐 VALIDATION DES VARIABLES D'ENVIRONNEMENT - Multi Convert
 * 
 * Valide au démarrage que TOUTES les variables requises sont présentes.
 * Aucune valeur par défaut dangereuse.
 * Lance une erreur si manquant.
 */

import { z } from 'zod';

const envSchema = z.object({
  // ========== REQUIS - LANCE UNE ERREUR SI MANQUANT ==========
  
  // Base de données
  DATABASE_URL: z.string().url('DATABASE_URL doit être une URL valide').min(1),
  DIRECT_URL: z.string().url('DIRECT_URL doit être une URL valide').min(1),
  
  // Cache & Queues
  REDIS_URL: z.string().url('REDIS_URL doit être une URL valide').min(1),
  
  // Authentification
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET doit faire 32+ caractères'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET doit faire 32+ caractères'),
  GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID manquant'),
  GOOGLE_CLIENT_SECRET: z.string().min(1, 'GOOGLE_CLIENT_SECRET manquant'),
  
  // Chiffrement
  ENCRYPTION_KEY: z.string().min(32, 'ENCRYPTION_KEY doit faire 32+ caractères'),
  
  // ========== OPTIONNELS ==========
  
  NODE_ENV: z.enum(['development', 'production', 'test']).default('production'),
  ADMIN_EMAILS: z.string().default(''),
  SENTRY_DSN: z.string().url().optional(),
  SENDGRID_API_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().default('eu-west-1'),
  S3_BUCKET: z.string().optional(),
  
  // App URLs
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NEXT_PUBLIC_API_URL: z.string().url().optional(),
  
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
export const env = getEnv();

// Valider au module load (non-blocking)
if (process.env.NODE_ENV === 'production') {
  try {
    getEnv();
  } catch (error) {
    console.error('❌ ERREUR FATALE: Configuration invalide');
    process.exit(1);
  }
}
