/**
 * 🗑️  SUPPRESSION DÉFINITIVE DU COMPTE — Multi Convert
 *
 * DELETE /api/auth/account  { password, confirmation: "SUPPRIMER" }
 *
 * Suppression réelle en base. Les relations `User` du schéma Prisma sont en
 * `onDelete: Cascade` (conversions, packs de crédits, abonnements, clés API) et
 * les articles de blog passent en `authorId = null` : aucune donnée orpheline,
 * aucune migration nécessaire.
 */

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { readSession, clearSessionCookie } from '@/lib/auth-session';
import { isDevMode } from '@/lib/dev-auth';
import { DELETE_CONFIRMATION_TEXT } from '@/lib/account-status';
import { describeDatabaseError } from '@/lib/db-error';
import { rateLimitByIP } from '@/lib/rate-limiter';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const bodySchema = z.object({
  password: z.string().min(1, 'Mot de passe requis'),
  confirmation: z
    .string()
    .refine((value) => value.trim().toUpperCase() === DELETE_CONFIRMATION_TEXT, {
      message: `Recopiez « ${DELETE_CONFIRMATION_TEXT} » pour confirmer`,
    }),
});

export async function DELETE(request: NextRequest) {
  const session = readSession(request);

  if (!session) {
    return NextResponse.json({ message: 'Non authentifié' }, { status: 401 });
  }

  // Anti-abus : 5 tentatives par heure et par IP
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const limit = rateLimitByIP(`delete-account:${ip}`, 5, 60 * 60 * 1000);

  if (!limit.allowed) {
    return NextResponse.json(
      { message: 'Trop de tentatives. Réessayez dans une heure.' },
      { status: 429 }
    );
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.errors[0]?.message || 'Demande invalide' },
      { status: 400 }
    );
  }

  if (isDevMode()) {
    return NextResponse.json(
      { message: 'Suppression indisponible en mode développement (base désactivée).' },
      { status: 503 }
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, email: true, passwordHash: true, password: true },
    });

    if (!user) {
      return NextResponse.json({ message: 'Compte introuvable' }, { status: 404 });
    }

    const currentHash = user.passwordHash || user.password;

    if (!currentHash) {
      return NextResponse.json(
        { message: 'Ce compte utilise la connexion Google : suppression impossible ici.' },
        { status: 400 }
      );
    }

    const isValid = await bcrypt.compare(parsed.data.password, currentHash);

    if (!isValid) {
      return NextResponse.json({ message: 'Mot de passe incorrect' }, { status: 400 });
    }

    await prisma.user.delete({ where: { id: user.id } });

    console.log(`🗑️  Compte supprimé : ${user.email}`);

    const response = NextResponse.json({
      success: true,
      message: 'Compte et données supprimés définitivement.',
    });
    clearSessionCookie(response);
    return response;
  } catch (error) {
    const dbError = describeDatabaseError(error);
    console.error('Erreur suppression de compte:', dbError.summary, error);
    return NextResponse.json(
      { message: 'Erreur lors de la suppression du compte', code: dbError.code },
      { status: 500 }
    );
  }
}
