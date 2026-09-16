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

import { NextRequest, NextResponse } from 'next/server';
import { verifyEmail } from '@/lib/email';
import { relativeRedirect } from '@/lib/relative-redirect';

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

    // ✅ Email vérifié : l'utilisateur peut se connecter
    return relativeRedirect('/login?verified=1');
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'email:', error);
    return relativeRedirect('/verify-email?error=server_error');
  }
}
