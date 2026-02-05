/**
 * 🛡️ MIDDLEWARE DE SÉCURITÉ - Multi Convert
 * 
 * Protection géographique, rate limiting, et détection de comportement suspect
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { BLOCKED_COUNTRIES, SECURITY_ACTIONS, SUSPICIOUS_ASNS } from './config/security';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// Middleware i18n
const intlMiddleware = createMiddleware(routing);

interface GeoData {
  country: string;
  asn?: string;
  isVPN?: boolean;
  threatScore?: number;
}

/**
 * Récupère les données géographiques depuis Cloudflare ou geoip-lite
 */
async function getGeoData(request: NextRequest): Promise<GeoData> {
  // Cloudflare fournit des headers automatiques
  const cfCountry = request.headers.get('cf-ipcountry');
  const cfASN = request.headers.get('cf-ray')?.split('-')[1];
  const threatScore = request.headers.get('cf-threat-score');

  if (cfCountry) {
    return {
      country: cfCountry,
      asn: cfASN,
      threatScore: threatScore ? parseInt(threatScore, 10) : undefined,
    };
  }

  // Middleware Next.js = Edge Runtime (pas d'accès Node.js).
  // Sans Cloudflare, on reste en UNKNOWN (fail-open).
  return {
    country: 'UNKNOWN',
  };
}

/**
 * Vérifie si l'IP est dans un ASN suspect
 */
function isSuspiciousASN(asn?: string): boolean {
  if (!asn) return false;
  return SUSPICIOUS_ASNS.some((suspiciousASN) => asn.includes(suspiciousASN));
}

/**
 * Vérifie le comportement suspect
 */
async function isSuspiciousBehavior(request: NextRequest): Promise<boolean> {
  const userAgent = request.headers.get('user-agent') || '';
  const path = request.nextUrl.pathname;

  // Patterns suspects
  const suspiciousPatterns = [
    /sqlmap/i,
    /nikto/i,
    /nmap/i,
    /masscan/i,
    /zap/i,
    /burp/i,
    /scanner/i,
    /bot/i,
  ];

  // Vérifier user-agent suspect
  if (suspiciousPatterns.some((pattern) => pattern.test(userAgent))) {
    return true;
  }

  // Vérifier accès à des endpoints sensibles
  const sensitivePaths = [
    '/admin',
    '/wp-admin',
    '/.env',
    '/config',
    '/api/admin',
  ];

  if (sensitivePaths.some((sensitivePath) => path.includes(sensitivePath))) {
    return true;
  }

  return false;
}

/**
 * Log un événement de sécurité
 */
async function logSecurityEvent(
  eventType: string,
  data: Record<string, any>
): Promise<void> {
  // TODO: Implémenter le logging vers SIEM
  console.warn(`[SECURITY] ${eventType}:`, data);
}

/**
 * Middleware principal
 */
export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const ip = request.ip || request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';

  // Skip pour les fichiers statiques et API internes
  if (
    path.startsWith('/_next') ||
    path.startsWith('/api/health') ||
    path.startsWith('/favicon.ico') ||
    path.startsWith('/public')
  ) {
    return intlMiddleware(request);
  }

  try {
    // 1. Récupération des données géographiques
    const geo = await getGeoData(request);

    // 2. Blocage pays niveau 1 (BLOCKED)
    if (BLOCKED_COUNTRIES.LEVEL_1.includes(geo.country as unknown as any)) {
      await logSecurityEvent('COUNTRY_BLOCKED', {
        ip,
        country: geo.country,
        path,
        action: SECURITY_ACTIONS.LEVEL_1.access,
      });

      // Ne pas donner d'information - retourner 403 silencieux
      return new NextResponse(null, {
        status: 403,
        headers: {
          'X-Security-Block': 'true',
        },
      });
    }

    // 3. Vérification ASN suspect
    if (isSuspiciousASN(geo.asn)) {
      await logSecurityEvent('SUSPICIOUS_ASN', {
        ip,
        asn: geo.asn,
        country: geo.country,
        path,
      });

      const response = await intlMiddleware(request);
      response.headers.set('X-Security-Level', 'HIGH');
      return response;
    }

    // 4. Vérification Threat Score Cloudflare
    if (geo.threatScore && geo.threatScore > 20) {
      await logSecurityEvent('HIGH_THREAT_SCORE', {
        ip,
        threatScore: geo.threatScore,
        country: geo.country,
        path,
      });

      // Rediriger vers une page de vérification
      if (!path.startsWith('/verify')) {
        const verifyUrl = new URL('/verify', request.url);
        verifyUrl.searchParams.set('reason', 'threat_score');
        return NextResponse.redirect(verifyUrl);
      }
    }

    // 5. Détection comportement suspect
    if (await isSuspiciousBehavior(request)) {
      await logSecurityEvent('SUSPICIOUS_BEHAVIOR', {
        ip,
        country: geo.country,
        path,
        userAgent: request.headers.get('user-agent'),
      });

      if (!path.startsWith('/verify')) {
        const verifyUrl = new URL('/verify', request.url);
        verifyUrl.searchParams.set('reason', 'suspicious_behavior');
        return NextResponse.redirect(verifyUrl);
      }
    }

    // 6. Pays niveau 2 - Surveillance renforcée
    if (BLOCKED_COUNTRIES.LEVEL_2.includes(geo.country as unknown as any)) {
      const response = await intlMiddleware(request);
      response.headers.set('X-Security-Level', 'ENHANCED');
      response.headers.set('X-Country-Risk', 'LEVEL_2');
      return response;
    }

    // Tout est OK - continuer avec le middleware i18n
    return intlMiddleware(request);
  } catch (error) {
    // En cas d'erreur, logger et autoriser (fail-open pour éviter de bloquer les utilisateurs légitimes)
    console.error('[MIDDLEWARE ERROR]', error);
    return intlMiddleware(request);
  }
}

// Configurer les chemins où le middleware s'applique
export const config = {
  matcher: [
    /*
     * Match toutes les routes sauf:
     * - api routes (sauf celles qui nécessitent sécurité)
     * - _next/static (fichiers statiques)
     * - _next/image (optimisation d'image)
     * - favicon.ico (favicon)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
