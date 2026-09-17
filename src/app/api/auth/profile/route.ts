/**
 * ✏️  PROFIL UTILISATEUR — Multi Convert
 *
 * PATCH /api/auth/profile  { name?, acceptMarketing? }
 *
 * Met à jour les informations du compte connecté (page /dashboard/settings).
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { readSession } from '@/lib/auth-session';
import { isDevMode } from '@/lib/dev-auth';
import { describeDatabaseError } from '@/lib/db-error';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const bodySchema = z.object({
  name: z.string().min(2, 'Minimum 2 caractères').max(100).optional(),
  acceptMarketing: z.boolean().optional(),
});

export async function PATCH(request: NextRequest) {
  const session = readSession(request);

  if (!session) {
    return NextResponse.json({ message: 'Non authentifié' }, { status: 401 });
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

  if (Object.keys(parsed.data).length === 0) {
    return NextResponse.json({ message: 'Aucune modification fournie' }, { status: 400 });
  }

  // 🔧 MODE DEV : base désactivée
  if (isDevMode()) {
    return NextResponse.json({ message: 'Modification indisponible en mode développement.' }, { status: 503 });
  }

  try {
    const user = await prisma.user.update({
      where: { id: session.userId },
      data: parsed.data,
      select: { id: true, email: true, name: true, acceptMarketing: true },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.name || user.email,
        acceptMarketing: user.acceptMarketing,
      },
    });
  } catch (error) {
    const dbError = describeDatabaseError(error);
    console.error('Erreur profil:', dbError.summary, error);
    return NextResponse.json(
      { message: 'Erreur lors de la mise à jour', code: dbError.code },
      { status: 500 }
    );
  }
}
