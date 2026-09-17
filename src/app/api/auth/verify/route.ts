/**
 * 🔐 VÉRIFICATION DE L'EMAIL - Multi Convert
 *
 * GET /api/auth/verify?token=xxxxx
 *
 * Cette URL est le lien cliqué depuis l'email de confirmation : elle redirige
 * donc le navigateur vers une vraie page (avant : du JSON brut s'affichait).
 *   - succès        → /login?verified=1
 *   - lien invalide → /verify-email?error=invalid_token
 */

/**
 * 🔐 VÉRIFICATION DE L'EMAIL - Multi Convert
 *
 * GET /api/auth/verify?token=xxxxx
 *
 * Cette URL est le lien cliqué depuis l'email de confirmation : elle
 *  - valide l'email en base,
 *  - OUVRE UNE SESSION (cookie httpOnly) : l'utilisateur n'a pas à ressaisir son
 *    mot de passe juste après avoir confirmé son adresse,
 *  - redirige vers le tableau de bord.
 * En cas de problème : redirection vers /verify-email?error=…
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyEmail } from '@/lib/email';
import { relativeRedirect } from '@/lib/relative-redirect';
import {
  applySessionCookie,
  signSessionToken,
  SESSION_TTL_SECONDS,
} from '@/lib/auth-session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return relativeRedirect('/verify-email?error=missing_token');
  }

  try {
    const user = await verifyEmail(token);

    if (!user) {
      return relativeRedirect('/verify-email?error=invalid_token');
    }

    // ✅ Email vérifié → session ouverte immédiatement (plus de re-connexion)
    const sessionToken = signSessionToken(
      { userId: user.id, email: user.email, role: user.role },
      SESSION_TTL_SECONDS
    );

    const response = relativeRedirect('/dashboard?verified=1');
    applySessionCookie(response, sessionToken, SESSION_TTL_SECONDS);
    return response;
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'email:', error);
    return relativeRedirect('/verify-email?error=server_error');
  }
}
