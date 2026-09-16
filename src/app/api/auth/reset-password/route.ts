/**
 * 🔑 RÉINITIALISATION DU MOT DE PASSE - Multi Convert
 *
 * POST /api/auth/reset-password  { token, password }
 *
 * Vérifie le token reçu par email (1 h), enregistre le nouveau mot de passe
 * (bcrypt) et révoque le token. Le compte est marqué comme vérifié si l'email
 * ne l'était pas encore : la possession du lien prouve l'accès à la boîte.
 */

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { isDevMode } from '@/lib/dev-auth';
import { passwordSchema } from '@/lib/password-schema';
import { rateLimitByIP } from '@/lib/rate-limiter';
import { describeDatabaseError } from '@/lib/db-error';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const bodySchema = z.object({
  token: z.string().min(16, 'Lien invalide'),
  password: passwordSchema,
});

export async function POST(request: NextRequest) {
  try {
    // Anti-abus : 10 tentatives par heure et par IP
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const limit = rateLimitByIP(`reset-password:${ip}`, 10, 60 * 60 * 1000);

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
          errors: parsed.error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    if (isDevMode()) {
      return NextResponse.json(
        { message: 'Réinitialisation indisponible en mode développement (base désactivée).' },
        { status: 503 }
      );
    }

    const { token, password } = parsed.data;

    // Usage dédié : un lien de confirmation d'email ne peut pas changer le mot de passe
    if (!token.startsWith('r1_')) {
      return NextResponse.json(
        { message: 'Lien invalide ou expiré. Demandez un nouvel email.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Lien invalide ou expiré. Demandez un nouvel email.' },
        { status: 400 }
      );
    }

    // Même hash dans les deux colonnes (compatibilité) — bcrypt, 12 rounds
    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        password: passwordHash,
        resetToken: null,
        resetTokenExpiry: null,
        // Un lien email valide prouve l'accès à la boîte de réception
        emailVerified: user.emailVerified ?? new Date(),
      },
    });

    console.log(`✅ Mot de passe réinitialisé pour ${user.email}`);

    return NextResponse.json(
      { message: 'Mot de passe mis à jour. Vous pouvez maintenant vous connecter.' },
      { status: 200 }
    );
  } catch (error) {
    const dbError = describeDatabaseError(error);
    console.error('Erreur reset-password:', dbError.summary, error);
    return NextResponse.json(
      { message: 'Erreur lors de la réinitialisation', code: dbError.code },
      { status: 500 }
    );
  }
}