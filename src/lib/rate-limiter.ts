/**
 * 🚀 RATE LIMITER - Multi Convert
 * 
 * Simple in-memory rate limiter
 * En production, utiliser Redis ou Upstash
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  reset: number;
  resetTime?: Date;
}

/**
 * Rate limiter simple (in-memory)
 * 
 * @param key - Clé unique (IP, user ID, etc.)
 * @param limit - Nombre de requêtes autorisées
 * @param windowMs - Fenêtre de temps en ms
 * @returns Résultat du rate limit
 */
export function rateLimit(
  key: string,
  limit: number = 100,
  windowMs: number = 60 * 1000 // 1 minute par défaut
): RateLimitResult {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  // Si pas d'entrée ou fenêtre expirée, créer une nouvelle
  if (!entry || entry.resetTime < now) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + windowMs,
    };
    rateLimitMap.set(key, newEntry);

    return {
      allowed: true,
      limit,
      remaining: limit - 1,
      reset: newEntry.resetTime,
      resetTime: new Date(newEntry.resetTime),
    };
  }

  // Incrémenter le compteur
  entry.count++;

  const allowed = entry.count <= limit;
  const remaining = Math.max(0, limit - entry.count);

  return {
    allowed,
    limit,
    remaining,
    reset: entry.resetTime,
    resetTime: new Date(entry.resetTime),
  };
}

/**
 * Rate limiter par IP pour les API
 */
export function rateLimitByIP(
  ip: string,
  limit: number = 100,
  windowMs: number = 60 * 1000
): RateLimitResult {
  const key = `ip:${ip}`;
  return rateLimit(key, limit, windowMs);
}

/**
 * Rate limiter par user pour les API authentifiées
 */
export function rateLimitByUser(
  userId: string,
  limit: number = 1000,
  windowMs: number = 60 * 1000
): RateLimitResult {
  const key = `user:${userId}`;
  return rateLimit(key, limit, windowMs);
}

/**
 * Nettoyer les entrées expirées (à appeler périodiquement)
 */
export function cleanupExpiredEntries() {
  const now = Date.now();
  let cleaned = 0;

  for (const [key, entry] of rateLimitMap.entries()) {
    if (entry.resetTime < now) {
      rateLimitMap.delete(key);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    console.log(`🧹 Rate limiter cleanup: ${cleaned} entrées expirées supprimées`);
  }
}

// Nettoyer les entrées expirées toutes les 5 minutes
if (typeof global !== 'undefined') {
  setInterval(cleanupExpiredEntries, 5 * 60 * 1000);
}
