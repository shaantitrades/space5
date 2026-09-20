import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Redirection vers une page interne, avec un `Location` ABSOLU.
 *
 * ⚠️ Next.js refuse un `Location` relatif dans la réponse d'un middleware :
 * `new NextURL(redirect, …)` (next/dist/server/web/adapter.js) lève
 * « Invalid URL » et la requête finit en **500** au lieu de rediriger. Les deux
 * appels (`/verify?reason=threat_score` et `?reason=suspicious_behavior`)
 * échouaient donc silencieusement.
 *
 * ⚠️ Ne jamais construire l'URL avec `request.nextUrl.origin` seul : dans un
 * conteneur, l'origine de `request.url` est l'adresse INTERNE du serveur Next
 * (`http://0.0.0.0:3000` avec HOSTNAME=0.0.0.0), ce qui envoyait l'utilisateur
 * vers `https://0.0.0.0:3000/…` → « ERR_ADDRESS_INVALID ». On utilise donc
 * l'hôte PUBLIC annoncé par le proxy (`x-forwarded-host` / `x-forwarded-proto`,
 * posés par Traefik), avec repli sur l'en-tête `Host` de la requête.
 */
export function relativeRedirect(
  location: string,
  status: 302 | 307 = 302,
  request?: NextRequest
): NextResponse {
  /**
   * Sans requête (Route Handler, ex. `api/auth/verify`) : un `Location` relatif
   * est accepté par Next.js et reste correct quel que soit le domaine visité.
   */
  if (!request) {
    return new NextResponse(null, { status, headers: { Location: location } });
  }

  /**
   * Réponse de MIDDLEWARE : Next.js exige une URL absolue — `new NextURL(redirect)`
   * (next/dist/server/web/adapter.js) lève « Invalid URL » sur une valeur relative
   * et la requête finit en 500 au lieu de rediriger.
   */
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || '';
  if (!host) {
    return new NextResponse(null, { status, headers: { Location: location } });
  }

  const proto = request.headers.get('x-forwarded-proto') || (host.startsWith('localhost') ? 'http' : 'https');

  return NextResponse.redirect(new URL(location, `${proto}://${host}`), status);
}
