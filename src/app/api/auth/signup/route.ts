/**
 * Multi Convert - API Signup
 * Route d'inscription
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendVerificationEmail } from '@/lib/email';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { DevAuth, isDevMode, createDevToken } from '@/lib/dev-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ========== VALIDATION SCHEMA ==========

const passwordSchema = z.string()
  .min(8, 'Minimum 8 caractères')
  .max(128)
  .regex(/[A-Z]/, 'Minimum 1 majuscule')
  .regex(/[a-z]/, 'Minimum 1 minuscule')
  .regex(/[0-9]/, 'Minimum 1 chiffre')
  .regex(/[!@#$%^&*()_+=\[\]{};:'",.<>?\/\\|-]/, 'Minimum 1 caractère spécial');

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
    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        name: data.fullName,
        passwordHash: hashedPassword,
        acceptMarketing: data.acceptMarketing,
        emailVerified: null, // Email non vérifié
        role: 'USER',
      },
    });

    // ✅ Envoyer l'email de vérification
    const emailSent = await sendVerificationEmail(user.email, user.id);

    if (!emailSent) {
      console.warn(`⚠️  Email de vérification non envoyé pour ${user.email}`);
    }

    return NextResponse.json(
      {
        message: 'Inscription réussie. Vérifiez votre email pour continuer.',
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

    console.error('Erreur signup:', error);
    return NextResponse.json(
      { message: 'Erreur lors de l\'inscription' },
      { status: 500 }
    );
  }
}
