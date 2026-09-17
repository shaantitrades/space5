/**
 * 🔒 CHANGEMENT DE MOT DE PASSE — Multi Convert
 *
 * POST /api/auth/change-password  { currentPassword, newPassword }
 *
 * Le mot de passe actuel est vérifié avant modification. Écrit le hash dans
 * `password_hash` (colonne de référence) et `password` (compatibilité).
 */

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { readSession } from '@/lib/auth-session';
import { isDevMode } from '@/lib/dev-auth';
import { passwordSchema } from '@/lib/password-schema';
import { describeDatabaseError } from '@/lib/db-error';
import { rateLimitByIP } from '@/lib/rate-limiter';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const bodySchema = z.object({
  currentPassword: z.string().min(1, 'Mot de passe actuel requis'),
  newPassword: passwordSchema,
});

export async function POST(request: NextRequest) {
  const session = readSession(request);

  if (!session) {
    return NextResponse.json({ message: 'Non authentifié' }, { status: 401 });
  }

  // Anti-abus : 10 tentatives par heure et par IP
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const limit = rateLimitByIP(`change-password:${ip}`, 10, 60 * 60 * 1000);

  if (!limit.allowed) {
    return NextResponse.json(
      { message: 'Trop de tentatives. Réessayez dans une heure.' },
      { status: 429 }
    );
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      {
        message: 'Données invalides',
        errors: parsed.error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
      },
      { status: 400 }
    );
  }

  if (isDevMode()) {
    return NextResponse.json(
      { message: 'Changement de mot de passe indisponible en mode développement.' },
      { status: 503 }
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, passwordHash: true, password: true },
    });

    if (!user) {
      return NextResponse.json({ message: 'Compte introuvable' }, { status: 404 });
    }

    const currentHash = user.passwordHash || user.password;

    if (!currentHash) {
      return NextResponse.json(
        { message: 'Ce compte utilise la connexion Google : aucun mot de passe à modifier.' },
        { status: 400 }
      );
    }

    const isValid = await bcrypt.compare(parsed.data.currentPassword, currentHash);

    if (!isValid) {
      return NextResponse.json({ message: 'Mot de passe actuel incorrect' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        password: passwordHash,
        // Un mot de passe changé invalide tout lien de réinitialisation en cours
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    console.log(`✅ Mot de passe modifié pour ${session.email}`);

    return NextResponse.json({ success: true, message: 'Mot de passe mis à jour.' });
  } catch (error) {
    const dbError = describeDatabaseError(error);
    console.error('Erreur change-password:', dbError.summary, error);
    return NextResponse.json(
      { message: 'Erreur lors du changement de mot de passe', code: dbError.code },
      { status: 500 }
    );
  }
}
