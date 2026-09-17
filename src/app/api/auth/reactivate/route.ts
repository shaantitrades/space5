/**
 * ▶️  RÉACTIVATION DU COMPTE — Multi Convert
 *
 * POST /api/auth/reactivate
 *
 * Rétablit le rôle `USER` après une suspension temporaire (aucun mot de passe
 * demandé : la session en cours prouve l'identité).
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { readSession } from '@/lib/auth-session';
import { isDevMode } from '@/lib/dev-auth';
import { SUSPENDED_ROLE } from '@/lib/account-status';
import { describeDatabaseError } from '@/lib/db-error';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const session = readSession(request);

  if (!session) {
    return NextResponse.json({ message: 'Non authentifié' }, { status: 401 });
  }

  if (isDevMode()) {
    return NextResponse.json(
      { message: 'Réactivation indisponible en mode développement (base désactivée).' },
      { status: 503 }
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ message: 'Compte introuvable' }, { status: 404 });
    }

    if (user.role !== SUSPENDED_ROLE) {
      return NextResponse.json({ success: true, message: 'Compte déjà actif.' });
    }

    // On ne rétrograde jamais un administrateur : seul SUSPENDED → USER
    await prisma.user.update({
      where: { id: user.id },
      data: { role: 'USER' },
    });

    console.log(`▶️  Compte réactivé : ${session.email}`);

    return NextResponse.json({ success: true, message: 'Compte réactivé.' });
  } catch (error) {
    const dbError = describeDatabaseError(error);
    console.error('Erreur reactivate:', dbError.summary, error);
    return NextResponse.json(
      { message: 'Erreur lors de la réactivation', code: dbError.code },
      { status: 500 }
    );
  }
}
