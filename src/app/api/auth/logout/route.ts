/**
 * 🚪 DÉCONNEXION — Multi Convert
 *
 * POST /api/auth/logout
 *
 * Supprime le cookie de session (httpOnly). Avant, la déconnexion ne nettoyait
 * que le localStorage : l'utilisateur restait connecté côté serveur.
 */

import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/auth-session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  const response = NextResponse.json({ success: true });
  clearSessionCookie(response);
  return response;
}
