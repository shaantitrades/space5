/**
 * Multi Convert - API Signup
 * Route d'inscription
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendVerificationEmail } from '@/lib/email';
import { passwordSchema } from '@/lib/password-schema';
import { describeDatabaseError } from '@/lib/db-error';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { DevAuth, isDevMode, createDevToken } from '@/lib/dev-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ========== VALIDATION SCHEMA ==========
// Les règles du mot de passe sont partagées avec la réinitialisation
// (src/lib/password-schema.ts) : un mot de passe accepté ici doit l'être là-bas.

const signupSchema = z.object({
  fullName: z.string().min(2, 'Minimum 2 caractères').max(100),
  email: z.string().email('Email invalide'),
  password: passwordSchema,
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'Vous devez accepter les CGU',
  }),
  acceptMarketing: z.boolean().default(false),
});

type SignupInput = z.infer<typeof signupSchema>;

// ========== HANDLER ==========

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // ✅ Validation stricte avec Zod
    const data = signupSchema.parse(body);

    // 🔧 MODE DEV: Sans base de données
    if (isDevMode()) {
      console.log('🔧 [DEV MODE] Inscription sans base de données');
      
      // Vérifier si l'utilisateur existe déjà
      const existing = DevAuth.findByEmail(data.email);
      if (existing) {
        return NextResponse.json(
          { error: 'Cet email est déjà utilisé' },
          { status: 400 }
        );
      }

      // Créer l'utilisateur dev
      const user = DevAuth.createUser(data.email, data.fullName, data.password);
      const token = createDevToken(user);

      return NextResponse.json({
        success: true,
        message: '✅ Compte créé (mode dev)',
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
        },
        token,
        devMode: true,
      });
    }

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'Cet email est déjà utilisé' },
        { status: 409 }
      );
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(data.password, 12);

    // Créer l'utilisateur
    // `passwordHash` est la colonne de référence ; `password` est conservée
    // (même hash bcrypt) pour la compatibilité avec l'existant.
    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        name: data.fullName,
        passwordHash: hashedPassword,
        password: hashedPassword,
        acceptMarketing: data.acceptMarketing,
        emailVerified: null, // Email non vérifié
        role: 'USER',
      },
    });

    // ✅ Envoyer l'email de confirmation d'inscription
    const emailSent = await sendVerificationEmail(user.email, user.id);

    if (!emailSent) {
      console.warn(`⚠️  Email de vérification non envoyé pour ${user.email}`);
    }

    return NextResponse.json(
      {
        message: emailSent
          ? 'Inscription réussie. Vérifiez votre email pour continuer.'
          : "Inscription réussie, mais l'email de confirmation n'a pas pu être envoyé. Utilisez « Renvoyer l'email » sur la page de vérification.",
        emailSent,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    // Erreurs de validation Zod
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          message: 'Données invalides',
          errors: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    const dbError = describeDatabaseError(error);
    console.error('Erreur signup:', dbError.summary, error);
    return NextResponse.json(
      { message: 'Erreur lors de l\'inscription', code: dbError.code },
      { status: 500 }
    );
  }
}
