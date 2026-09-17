/**
 * 📦 EXPORT DES DONNÉES PERSONNELLES — Multi Convert
 *
 * GET /api/auth/export-data
 *
 * Renvoie un fichier JSON contenant les données du compte connecté
 * (profil, conversions, clés API sans le secret). Sert au droit à la
 * portabilité (RGPD art. 20).
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { readSession } from '@/lib/auth-session';
import { isDevMode } from '@/lib/dev-auth';
import { describeDatabaseError } from '@/lib/db-error';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const session = readSession(request);

  if (!session) {
    return NextResponse.json({ message: 'Non authentifié' }, { status: 401 });
  }

  if (isDevMode()) {
    return NextResponse.json(
      { message: 'Export indisponible en mode développement (base désactivée).' },
      { status: 503 }
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        plan: true,
        credits: true,
        emailVerified: true,
        acceptMarketing: true,
        createdAt: true,
        lastLogin: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: 'Compte introuvable' }, { status: 404 });
    }

    const conversions = await prisma.conversion.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 1000,
      select: {
        id: true,
        inputFileName: true,
        inputFormat: true,
        outputFormat: true,
        fileSizeMb: true,
        status: true,
        creditsUsed: true,
        createdAt: true,
        completedAt: true,
      },
    });

    const apiKeys = await prisma.apiKey.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      // JAMAIS keyHash : on n'exporte que les métadonnées
      select: { id: true, name: true, lastUsedAt: true, createdAt: true },
    });

    const exportPayload = {
      exportedAt: new Date().toISOString(),
      service: 'Multi Convert',
      note:
        'Export de vos données personnelles (RGPD art. 20). Les fichiers envoyés pour ' +
        'conversion ne sont pas stockés : seules ces métadonnées existent.',
      account: user,
      conversions,
      apiKeys,
    };

    const filename = `multi-convert-donnees-${new Date().toISOString().slice(0, 10)}.json`;

    return new NextResponse(JSON.stringify(exportPayload, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    const dbError = describeDatabaseError(error);
    console.error('Erreur export-data:', dbError.summary, error);
    return NextResponse.json(
      { message: 'Erreur lors de l\'export', code: dbError.code },
      { status: 500 }
    );
  }
}
