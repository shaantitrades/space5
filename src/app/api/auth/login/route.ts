/**
 * Multi Convert - API Login
 * Route de connexion
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { DevAuth, isDevMode, createDevToken } from '@/lib/dev-auth';
import { describeDatabaseError } from '@/lib/db-error';
import { isSuspended, suspensionMessage } from '@/lib/account-status';
import {
  applySessionCookie,
  signSessionToken,
  SESSION_TTL_REMEMBER_SECONDS,
  SESSION_TTL_SECONDS,
} from '@/lib/auth-session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, rememberMe } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email et mot de passe requis' },
        { status: 400 }
      );
    }

    // 🔧 MODE DEV: Sans base de données
    if (isDevMode()) {
      console.log('🔧 [DEV MODE] Login sans base de données');
      
      const user = DevAuth.verifyCredentials(email, password);
      
      if (!user) {
        return NextResponse.json(
          { message: 'Email ou mot de passe incorrect' },
          { status: 401 }
        );
      }

      const token = createDevToken(user);

      return NextResponse.json({
        success: true,
        message: '✅ Connexion réussie (mode dev)',
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
        },
        token,
        devMode: true,
      });
    }

    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Le hash vit dans `passwordHash` (colonne de référence) ; l'ancienne
    // colonne `password` reste lue pour les comptes créés avant la migration.
    const passwordHash = user?.passwordHash || user?.password;

    if (!user || !passwordHash) {
      return NextResponse.json(
        { message: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    // Vérifier le mot de passe
    const isValidPassword = await bcrypt.compare(password, passwordHash);

    if (!isValidPassword) {
      return NextResponse.json(
        { message: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    // Vérifier si l'email est vérifié
    if (!user.emailVerified) {
      return NextResponse.json(
        { 
          message: 'Veuillez vérifier votre email avant de vous connecter',
          requiresVerification: true 
        },
        { status: 403 }
      );
    }

    // Compte suspendu temporairement (par son propriétaire ou l'administration)
    if (isSuspended(user.role)) {
      return NextResponse.json(
        { message: suspensionMessage(), suspended: true },
        { status: 403 }
      );
    }

    // Créer le jeton de session (même format que la confirmation d'email)
    const ttl = rememberMe ? SESSION_TTL_REMEMBER_SECONDS : SESSION_TTL_SECONDS;
    const token = signSessionToken(
      { userId: user.id, email: user.email, role: user.role },
      ttl
    );

    // Mettre à jour la dernière connexion
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Créer la réponse avec le cookie
    const response = NextResponse.json(
      {
        message: 'Connexion réussie',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      { status: 200 }
    );

    // Définir le cookie de session (httpOnly)
    applySessionCookie(response, token, ttl);

    return response;
  } catch (error) {
    const dbError = describeDatabaseError(error);
    console.error('Erreur login:', dbError.summary, error);
    return NextResponse.json(
      { message: 'Erreur lors de la connexion', code: dbError.code },
      { status: 500 }
    );
  }
}
