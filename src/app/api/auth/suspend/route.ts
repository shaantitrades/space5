/**
 * ⏸️  SUSPENSION TEMPORAIRE DU COMPTE — Multi Convert
 *
 * POST /api/auth/suspend  { password }
 *
 * Le statut `SUSPENDED` est stocké dans la colonne `role` (aucune migration).
 * La session reste ouverte pour que l'utilisateur puisse réactiver son compte.
 */

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { readSession } from '@/lib/auth-session';
import { isDevMode } from '@/lib/dev-auth';
import { SUSPENDED_ROLE } from '@/lib/account-status';
import { describeDatabaseError } from '@/lib/db-error';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const bodySchema = z.object({
  password: z.string().min(1, 'Mot de passe requis'),
});

export async function POST(request: NextRequest) {
  const session = readSession(request);

  if (!session) {
    return NextResponse.json({ message: 'Non authentifié' }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.errors[0]?.message || 'Mot de passe requis' },
      { status: 400 }
    );
  }

  if (isDevMode()) {
    return NextResponse.json(
      { message: 'Suspension indisponible en mode développement (base désactivée).' },
      { status: 503 }
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, passwordHash: true, password: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ message: 'Compte introuvable' }, { status: 404 });
    }

    const currentHash = user.passwordHash || user.password;

    if (!currentHash) {
      return NextResponse.json(
        { message: 'Ce compte utilise la connexion Google : suspension impossible ici.' },
        { status: 400 }
      );
    }

    const isValid = await bcrypt.compare(parsed.data.password, currentHash);

    if (!isValid) {
      return NextResponse.json({ message: 'Mot de passe incorrect' }, { status: 400 });
    }

    if (user.role === SUSPENDED_ROLE) {
      return NextResponse.json({ success: true, message: 'Compte déjà suspendu.' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { role: SUSPENDED_ROLE },
    });

    console.log(`⏸️  Compte suspendu : ${session.email}`);

    return NextResponse.json({
      success: true,
      message:
        'Compte suspendu : la connexion est bloquée, vos données sont conservées. ' +
        'Vous pouvez le réactiver à tout moment depuis cette page.',
    });
  } catch (error) {
    const dbError = describeDatabaseError(error);
    console.error('Erreur suspend:', dbError.summary, error);
    return NextResponse.json(
      { message: 'Erreur lors de la suspension', code: dbError.code },
      { status: 500 }
    );
  }
}
