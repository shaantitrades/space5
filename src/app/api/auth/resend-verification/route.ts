/**
 * ✉️  RENVOI DE L'EMAIL DE CONFIRMATION - Multi Convert
 *
 * POST /api/auth/resend-verification  { email }
 *
 * Génère un nouveau token (24 h) et renvoie l'email de confirmation.
 * La réponse est toujours identique pour ne pas révéler l'existence d'un compte.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendVerificationEmail } from '@/lib/email';
import { isDevMode } from '@/lib/dev-auth';
import { rateLimitByIP } from '@/lib/rate-limiter';
import { describeDatabaseError } from '@/lib/db-error';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const GENERIC_MESSAGE =
  "Si un compte non vérifié existe avec cet email, un nouvel email de confirmation a été envoyé";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    // Anti-abus : 5 renvois par heure et par IP
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const limit = rateLimitByIP(`resend-verification:${ip}`, 5, 60 * 60 * 1000);

    if (!limit.allowed) {
      return NextResponse.json(
        { message: 'Trop de demandes. Réessayez dans une heure.' },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => null);
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';

    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json({ message: 'Email requis' }, { status: 400 });
    }

    if (isDevMode()) {
      console.log(`🔧 [DEV MODE] Renvoi de l'email de vérification pour ${email}`);
      return NextResponse.json({ message: GENERIC_MESSAGE }, { status: 200 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // Déjà vérifié ou inexistant : même réponse
    if (!user || user.emailVerified) {
      return NextResponse.json({ message: GENERIC_MESSAGE }, { status: 200 });
    }

    const sent = await sendVerificationEmail(user.email, user.id);

    if (!sent) {
      console.error(`⚠️  Email de vérification non renvoyé pour ${user.email}`);
    }

    return NextResponse.json({ message: GENERIC_MESSAGE }, { status: 200 });
  } catch (error) {
    const dbError = describeDatabaseError(error);
    console.error('Erreur resend-verification:', dbError.summary, error);
    return NextResponse.json(
      { message: 'Erreur lors de l\'envoi', code: dbError.code },
      { status: 500 }
    );
  }
}