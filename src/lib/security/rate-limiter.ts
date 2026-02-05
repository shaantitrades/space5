/**
 * ⏱️ RATE LIMITING INTELLIGENT - Multi Convert
 * 
 * Rate limiting par IP et par utilisateur avec Redis
 */

import { RateLimiterRedis, RateLimiterMemory } from 'rate-limiter-flexible';
import { RATE_LIMITS } from '@/config/security';

// Fallback en mémoire si Redis non disponible
let rateLimiter: RateLimiterRedis | RateLimiterMemory;

// Initialiser le rate limiter
try {
  const Redis = require('ioredis');
  const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

  rateLimiter = new RateLimiterRedis({
    storeClient: redis,
    keyPrefix: 'Multi Convert_rate_limit',
    points: 100, // Nombre de requêtes
    duration: 60, // Par 60 secondes
  });
} catch {
  // Fallback en mémoire
  rateLimiter = new RateLimiterMemory({
    points: 100,
    duration: 60,
  });
}

/**
 * Vérifie le rate limit pour une IP
 */
export async function checkRateLimit(
  identifier: string,
  tier: keyof typeof RATE_LIMITS = 'free'
): Promise<{ allowed: boolean; remaining: number; resetTime: Date }> {
  const limits = RATE_LIMITS[tier];

  try {
    // Créer un rate limiter spécifique pour ce tier
    const tierLimiter = new RateLimiterMemory({
      points: limits.requests,
      duration: Math.floor(limits.window / 1000), // Convertir en secondes
    });

    await tierLimiter.consume(identifier);

    const info = await tierLimiter.get(identifier);
    return {
      allowed: true,
      remaining: info ? info.remainingPoints : limits.requests,
      resetTime: info ? new Date(Date.now() + info.msBeforeNext) : new Date(),
    };
  } catch (rejRes: any) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: new Date(Date.now() + rejRes.msBeforeNext),
    };
  }
}

/**
 * Rate limiter pour les conversions de fichiers
 */
export async function checkConversionRateLimit(
  userId: string,
  tier: keyof typeof RATE_LIMITS = 'free'
): Promise<{ allowed: boolean; remaining: number; resetTime: Date }> {
  return checkRateLimit(`conversion:${userId}`, tier);
}

/**
 * Rate limiter pour les uploads
 */
export async function checkUploadRateLimit(
  ip: string,
  tier: keyof typeof RATE_LIMITS = 'free'
): Promise<{ allowed: boolean; remaining: number; resetTime: Date }> {
  return checkRateLimit(`upload:${ip}`, tier);
}
