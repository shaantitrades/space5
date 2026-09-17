/**
 * 👤 SESSION COURANTE — Multi Convert
 *
 * GET /api/auth/me
 *
 * Renvoie l'utilisateur connecté (cookie httpOnly `auth-token`) ou 401.
 * Utilisé par l'en-tête du site pour afficher soit les boutons
 * « Connexion / S'inscrire », soit le menu utilisateur.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { readSession } from '@/lib/auth-session';
import { DevAuth, isDevMode } from '@/lib/dev-auth';
import { describeDatabaseError } from '@/lib/db-error';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const session = readSession(request);

  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  // 🔧 MODE DEV : pas d'accès base de données
  if (isDevMode()) {
    const devUser = DevAuth.findByEmail(session.email);

    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.userId,
        email: session.email,
        fullName: devUser?.fullName || session.email,
        role: 'USER',
        plan: 'STARTER',
        emailVerified: new Date().toISOString(),
        acceptMarketing: false,
        devMode: true,
      },
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        plan: true,
        emailVerified: true,
        acceptMarketing: true,
        createdAt: true,
      },
    });

    if (!user) {
      // Session valide mais compte disparu → on nettoie le cookie
      const response = NextResponse.json({ authenticated: false }, { status: 401 });
      response.cookies.set('auth-token', '', { path: '/', maxAge: 0 });
      return response;
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.name || user.email,
        role: user.role,
        plan: user.plan,
        emailVerified: user.emailVerified,
        acceptMarketing: user.acceptMarketing,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    const dbError = describeDatabaseError(error);
    console.error('Erreur /api/auth/me:', dbError.summary, error);
    return NextResponse.json({ authenticated: false, code: dbError.code }, { status: 503 });
  }
}
