/**
 * Multi Convert - API Leads (demandes entreprise / contact)
 *
 * Reçoit les demandes de démo et de contact, les persiste en base
 * puis notifie l'équipe par email.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { sendLeadNotificationEmail } from '@/lib/email';
import { rateLimitByIP } from '@/lib/rate-limiter';
import { isDevMode } from '@/lib/dev-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ========== VALIDATION SCHEMA ==========

const leadSchema = z.object({
  company: z.string().trim().min(2, "Le nom de l'entreprise est requis").max(120),
  name: z.string().trim().min(2, 'Votre nom est requis').max(120),
  email: z.string().trim().toLowerCase().email('Email professionnel invalide').max(180),
  phone: z.string().trim().max(40).optional().or(z.literal('')),
  employees: z.string().trim().max(40).optional().or(z.literal('')),
  message: z.string().trim().max(5000).optional().or(z.literal('')),
  source: z.string().trim().max(60).optional(),
  locale: z.string().trim().max(10).optional(),
  /**
   * Champ leurre anti-robot : un humain ne le voit pas et le laisse vide.
   * On ne le rejette pas en erreur, sinon un robot comprend qu'il a été
   * détecté et s'adapte : on accepte la requête sans rien enregistrer.
   */
  website: z.string().max(200).optional().or(z.literal('')),
});

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  // Anti-spam : 5 demandes max par IP toutes les 10 minutes
  const limit = rateLimitByIP(`leads:${ip}`, 5, 10 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      { success: false, error: 'Trop de demandes envoyées. Réessayez dans quelques minutes.' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const data = leadSchema.parse(body);

    // Champ leurre rempli => robot. On répond OK sans rien enregistrer.
    if (data.website) {
      return NextResponse.json({ success: true });
    }

    const payload = {
      company: data.company,
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      employees: data.employees || null,
      message: data.message || null,
      source: data.source || 'entreprise',
      locale: data.locale || null,
    };

    let leadId: string | null = null;

    if (!isDevMode()) {
      const lead = await prisma.lead.create({
        data: {
          ...payload,
          ipAddress: ip,
          userAgent: request.headers.get('user-agent')?.slice(0, 255) || null,
        },
      });
      leadId = lead.id;
    } else {
      console.log('🔧 [DEV MODE] Lead non persisté (base de données désactivée) :', payload);
    }

    // La notification ne doit jamais faire échouer la demande du prospect.
    await sendLeadNotificationEmail(payload);

    return NextResponse.json(
      {
        success: true,
        leadId,
        message: 'Merci ! Nous vous répondons sous 24 h ouvrées.',
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Données invalides',
          errors: error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    console.error('Erreur API leads:', error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de l'envoi de votre demande" },
      { status: 500 }
    );
  }
}
