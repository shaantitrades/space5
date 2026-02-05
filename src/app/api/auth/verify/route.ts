/**
 * 🔐 ROUTE API POUR VÉRIFIER L'EMAIL - Multi Convert
 * 
 * GET /api/auth/verify?token=xxxxx
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyEmail } from '@/lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: 'Token manquant',
        },
        { status: 400 }
      );
    }

    // Vérifier le token
    const user = await verifyEmail(token);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Token invalide ou expiré',
        },
        { status: 400 }
      );
    }

    // ✅ Email vérifié avec succès
    return NextResponse.json({
      success: true,
      message: 'Email vérifié avec succès!',
      email: user.email,
      redirectTo: '/login',
    });
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'email:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la vérification',
      },
      { status: 500 }
    );
  }
}
