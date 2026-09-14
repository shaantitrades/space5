/**
 * 📧 SERVICE D'EMAIL - Multi Convert
 * 
 * Envoi d'emails de vérification et réinitialisation
 * Utilise SendGrid ou SMTP
 */

import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { env } from '@/lib/env-validation';
import { prisma } from '@/lib/prisma';
import { isDevMode } from '@/lib/dev-auth';

// ========== CONFIGURATION ==========

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;

  // Préférer SendGrid si disponible, sinon SMTP générique
  if (env.SENDGRID_API_KEY) {
    transporter = nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      auth: {
        user: 'apikey',
        pass: env.SENDGRID_API_KEY,
      },
    });
  } else {
    // SMTP générique pour développement
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
      port: parseInt(process.env.SMTP_PORT || '587'),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  return transporter;
}

// ========== FONCTIONS PUBLIQUES ==========

/**
 * Générer un token sécurisé
 */
export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Envoyer email de vérification
 */
export async function sendVerificationEmail(
  email: string,
  userId: string
): Promise<boolean> {
  // 🔧 MODE DEV: pas d'envoi d'email réel
  if (isDevMode()) {
    console.log(`🔧 [DEV MODE] Email de vérification simulé pour ${email}`);
    return true;
  }
  try {
    const token = generateSecureToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    // Sauvegarder le token
    await prisma.user.update({
      where: { id: userId },
      data: {
        resetToken: token,
        resetTokenExpiry: expiresAt,
      },
    });

    const appUrl = env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const verificationUrl = `${appUrl}/api/auth/verify?token=${token}`;

    const transporter = getTransporter();

    await transporter.sendMail({
      from: env.EMAIL_FROM || 'noreply@multi-convert.com',
      to: email,
      subject: 'Vérifiez votre email - Multi Convert',
      html: `
        <h1>Bienvenue sur Multi Convert! 🎉</h1>
        <p>Cliquez le lien ci-dessous pour vérifier votre email:</p>
        <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
          Vérifier mon email
        </a>
        <p>Ou copiez ce lien dans votre navigateur:</p>
        <code>${verificationUrl}</code>
        <p><small>Ce lien expire dans 24 heures.</small></p>
      `,
      text: `Vérifiez votre email en visitant: ${verificationUrl}`,
    });

    console.log(`✅ Email de vérification envoyé à ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email de vérification:', error);
    return false;
  }
}

/**
 * Vérifier un token et marquer l'email comme vérifié
 */
export async function verifyEmail(token: string) {
  try {
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(), // Token pas expiré
        },
      },
    });

    if (!user) {
      console.warn('⚠️  Token de vérification invalide ou expiré');
      return null;
    }

    // Marquer comme vérifié
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    console.log(`✅ Email vérifié pour ${updatedUser.email}`);
    return updatedUser;
  } catch (error) {
    console.error('❌ Erreur lors de la vérification de l\'email:', error);
    return null;
  }
}

/**
 * Envoyer email de réinitialisation de mot de passe
 */
export async function sendPasswordResetEmail(
  email: string,
  userId: string
): Promise<boolean> {
  try {
    const token = generateSecureToken();
    const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1h

    // Sauvegarder le token
    await prisma.user.update({
      where: { id: userId },
      data: {
        resetToken: token,
        resetTokenExpiry: expiresAt,
      },
    });

    const appUrl = env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetUrl = `${appUrl}/reset-password?token=${token}`;

    const transporter = getTransporter();

    await transporter.sendMail({
      from: env.EMAIL_FROM || 'noreply@multi-convert.com',
      to: email,
      subject: 'Réinitialiser votre mot de passe - Multi Convert',
      html: `
        <h1>Réinitialisation de mot de passe</h1>
        <p>Vous avez demandé une réinitialisation de mot de passe. Cliquez le lien ci-dessous:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
          Réinitialiser mon mot de passe
        </a>
        <p><small>Ce lien expire dans 1 heure. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</small></p>
      `,
    });

    console.log(`✅ Email de réinitialisation envoyé à ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email de réinitialisation:', error);
    return false;
  }
}

// ========== LEADS B2B ==========

export interface LeadPayload {
  company: string;
  name: string;
  email: string;
  phone?: string | null;
  employees?: string | null;
  message?: string | null;
  source?: string;
  locale?: string | null;
}

/**
 * Destinataires internes des notifications de leads.
 *
 * Priorité **exclusive** (et non cumulative) : envoyer à une adresse qui
 * n'existe pas peut faire rejeter le message entier par le fournisseur.
 *   1. LEADS_NOTIFICATION_EMAIL (destinataire dédié)
 *   2. ADMIN_EMAILS (adresses réellement surveillées)
 *   3. CONTACT_EMAIL (dernier recours seulement)
 */
function getLeadRecipients(): string[] {
  const parse = (value?: string): string[] =>
    (value || '')
      .split(',')
      .map((entry) => entry.trim())
      .filter((entry) => entry.includes('@'));

  const explicit = parse(env.LEADS_NOTIFICATION_EMAIL);
  if (explicit.length > 0) return explicit;

  const admins = parse(env.ADMIN_EMAILS);
  if (admins.length > 0) return admins;

  return parse(env.CONTACT_EMAIL);
}

/** Échappe le HTML pour éviter toute injection dans l'email de notification */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Notifier l'équipe qu'une nouvelle demande entreprise est arrivée.
 * Ne bloque jamais la réponse HTTP : l'appelant ignore le retour.
 */
export async function sendLeadNotificationEmail(lead: LeadPayload): Promise<boolean> {
  const recipients = getLeadRecipients();

  if (recipients.length === 0) {
    console.warn(
      '⚠️  Aucun destinataire pour la notification de lead. ' +
        'Définissez LEADS_NOTIFICATION_EMAIL ou ADMIN_EMAILS dans .env.local'
    );
    return false;
  }

  const row = (label: string, value?: string | null) =>
    value
      ? `<tr><td style="padding:4px 12px 4px 0;color:#666">${label}</td><td style="padding:4px 0"><strong>${escapeHtml(
          value
        )}</strong></td></tr>`
      : '';

  const html = `
    <h2>Nouvelle demande entreprise 🚀</h2>
    <table style="border-collapse:collapse">
      ${row('Entreprise', lead.company)}
      ${row('Contact', lead.name)}
      ${row('Email', lead.email)}
      ${row('Téléphone', lead.phone)}
      ${row('Effectif', lead.employees)}
      ${row('Source', lead.source)}
      ${row('Langue', lead.locale)}
    </table>
    <p style="margin-top:16px"><strong>Message :</strong></p>
    <p style="white-space:pre-wrap">${escapeHtml(lead.message || '(aucun message)')}</p>
  `;

  // Aucun moyen d'envoi configuré : on le dit explicitement dans les logs.
  // Le lead reste enregistré en base, mais personne n'est prévenu.
  if (isDevMode() || (!env.SENDGRID_API_KEY && !process.env.SMTP_PASSWORD)) {
    console.warn(
      '⚠️  [LEAD] Aucun email envoyé : ' +
        (isDevMode()
          ? 'mode développement actif.'
          : "SENDGRID_API_KEY (ou SMTP_PASSWORD) n'est pas configurée dans Coolify.") +
        ` Destinataires prévus : ${recipients.join(', ') || 'aucun'}.` +
        ' Le lead est bien enregistré en base.'
    );
    return false;
  }

  try {
    const transporter = getTransporter();

    await transporter.sendMail({
      from: env.EMAIL_FROM || 'noreply@multi-convert.com',
      to: recipients.join(','),
      replyTo: lead.email,
      subject: `[Entreprise] ${lead.company} — ${lead.name}`,
      html,
      text: `Nouvelle demande entreprise\n\nEntreprise: ${lead.company}\nContact: ${lead.name}\nEmail: ${lead.email}\nTéléphone: ${lead.phone || '-'}\nEffectif: ${lead.employees || '-'}\n\n${lead.message || '(aucun message)'}`,
    });

    console.log(`✅ Notification de lead envoyée à ${recipients.join(', ')}`);
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de la notification de lead:', error);
    return false;
  }
}
