/**
 * Multi Convert - API Forgot Password
 * Route de mot de passe oublié
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { isDevMode } from '@/lib/dev-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { message: 'Email requis' },
        { status: 400 }
      );
    }

    // 🔧 MODE DEV: réponse simulée
    if (isDevMode()) {
      console.log(`🔧 [DEV MODE] Forgot password pour ${email}`);
      return NextResponse.json(
        { message: 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé' },
        { status: 200 }
      );
    }

    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Pour des raisons de sécurité, toujours retourner succès même si l'email n'existe pas
    if (!user) {
      return NextResponse.json(
        { message: 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé' },
        { status: 200 }
      );
    }

    // Générer un token de réinitialisation
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 heure

    // Sauvegarder le token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // TODO: Envoyer l'email avec le lien de réinitialisation
    // const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;
    
    console.log(`Password reset link for ${email}: /reset-password?token=${resetToken}`);

    return NextResponse.json(
      { message: 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur forgot-password:', error);
    return NextResponse.json(
      { message: 'Erreur lors de l\'envoi' },
      { status: 500 }
    );
  }
}
