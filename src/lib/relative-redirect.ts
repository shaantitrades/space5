import { NextResponse } from 'next/server';

/**
 * Redirection RELATIVE (un simple chemin dans l'en-tête `Location`).
 *
 * ⚠️ Ne jamais construire l'URL avec `new URL(path, request.url)` pour une
 * redirection destinée au navigateur : dans un conteneur, l'origine de
 * `request.url` est l'adresse INTERNE du serveur Next
 * (`http://0.0.0.0:3000` avec HOSTNAME=0.0.0.0), ce qui envoyait l'utilisateur
 * vers `https://0.0.0.0:3000/...` → « ERR_ADDRESS_INVALID ».
 *
 * Un chemin relatif est résolu par le navigateur (ou le client) sur le domaine
 * réellement visité — `https://multi-convert.com` en production — et reste
 * correct en local (`http://localhost:3000`). RFC 7231 §7.1.2 l'autorise.
 */
export function relativeRedirect(location: string, status: 302 | 307 = 302): NextResponse {
  return new NextResponse(null, {
    status,
    headers: { Location: location },
  });
}
