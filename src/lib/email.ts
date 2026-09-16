/**
 * 📧 SERVICE D'EMAIL - Multi Convert
 * 
 * Envoi d'emails de vérification et réinitialisation
 * Trois fournisseurs possibles, par ordre de priorité :
 *   1. Resend (RESEND_API_KEY) — API HTTP https://api.resend.com
 *   2. SendGrid (SENDGRID_API_KEY) — SMTP
 *   3. SMTP générique (SMTP_HOST / SMTP_USER / SMTP_PASSWORD)
 *
 * Aucun repli silencieux : sans fournisseur configuré, l'échec est journalisé
 * explicitement (avant, tout partait vers smtp.mailtrap.io sans identifiants).
 */

import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { env } from '@/lib/env-validation';
import { prisma } from '@/lib/prisma';
import { isDevMode } from '@/lib/dev-auth';

// ========== CONFIGURATION ==========

export type EmailProvider = 'resend' | 'sendgrid' | 'smtp' | null;

/**
 * Fournisseur réellement utilisable d'après les variables d'environnement.
 * Priorité : Resend > SendGrid > SMTP générique.
 */
export function getEmailProvider(): EmailProvider {
  if (env.RESEND_API_KEY) return 'resend';
  if (env.SENDGRID_API_KEY) return 'sendgrid';
  if (env.SMTP_HOST && env.SMTP_PASSWORD) return 'smtp';
  return null;
}

let smtpTransporter: nodemailer.Transporter | null = null;

function getSmtpTransporter(): nodemailer.Transporter {
  if (smtpTransporter) return smtpTransporter;

  // SendGrid (repli historique) ou SMTP générique / SMTP Resend
  if (env.SENDGRID_API_KEY) {
    smtpTransporter = nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      auth: {
        user: 'apikey',
        pass: env.SENDGRID_API_KEY,
      },
    });
    return smtpTransporter;
  }

  const port = parseInt(env.SMTP_PORT || '587', 10);
  smtpTransporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASSWORD,
    },
  });

  return smtpTransporter;
}

export interface EmailMessage {
  /** Un ou plusieurs destinataires (séparés par des virgules) */
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  /** Expéditeur personnalisé (par défaut EMAIL_FROM) */
  from?: string;
}

/**
 * URL de base de l'API Resend. Une valeur mal formée ne doit jamais casser
 * l'envoi (ni le démarrage) : on retombe sur l'API officielle.
 */
function resolveResendBaseUrl(): string {
  const configured = (env.RESEND_BASE_URL || '').trim().replace(/\/+$/, '');

  if (!configured) return 'https://api.resend.com';

  if (/^https?:\/\/[^\s]+$/i.test(configured)) return configured;

  console.warn(`⚠️  RESEND_BASE_URL ignorée (URL http(s) attendue) : « ${configured} »`);
  return 'https://api.resend.com';
}

/**
 * Envoi bas niveau — Resend si configuré, sinon SendGrid / SMTP.
 * Retourne `true` uniquement si le fournisseur a accepté le message.
 */
export async function sendEmail(message: EmailMessage): Promise<boolean> {
  const provider = getEmailProvider();

  if (!provider) {
    console.error(
      '❌ Aucun fournisseur email configuré (RESEND_API_KEY, SENDGRID_API_KEY ' +
        'ou SMTP_HOST/SMTP_PASSWORD). ' +
        `Email non envoyé à ${message.to} — sujet « ${message.subject} ».`
    );
    return false;
  }

  const from = message.from || env.EMAIL_FROM || 'noreply@multi-convert.com';
  const recipients = message.to
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  try {
    if (provider === 'resend') {
      const baseUrl = resolveResendBaseUrl();
      const response = await fetch(`${baseUrl}/emails`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to: recipients,
          subject: message.subject,
          html: message.html,
          ...(message.text ? { text: message.text } : {}),
          ...(message.replyTo ? { reply_to: message.replyTo } : {}),
        }),
      });

      if (!response.ok) {
        // Resend renvoie un JSON d'erreur (domaine non vérifié, clé invalide…)
        const detail = await response.text().catch(() => '');
        console.error(`❌ Resend a refusé l'email (HTTP ${response.status}) : ${detail}`);
        return false;
      }
    } else {
      await getSmtpTransporter().sendMail({
        from,
        to: recipients.join(','),
        subject: message.subject,
        html: message.html,
        text: message.text,
        replyTo: message.replyTo,
      });
    }

    console.log(`✅ Email envoyé via ${provider} à ${recipients.join(', ')} (${message.subject})`);
    return true;
  } catch (error) {
    console.error(`❌ Échec de l'envoi via ${provider} à ${recipients.join(', ')} :`, error);
    return false;
  }
}

// ========== FONCTIONS PUBLIQUES ==========

/** Rôle d'un token : `v1` = confirmation d'email, `r1` = réinitialisation de mot de passe */
export type TokenPurpose = 'v1' | 'r1';

/**
 * Générer un token sécurisé, préfixé par son usage.
 *
 * Les deux parcours partagent la colonne historique `reset_token` (donc AUCUNE
 * migration de base n'est nécessaire) : le préfixe garantit qu'un lien de
 * confirmation ne peut pas servir à changer le mot de passe, et inversement.
 */
export function generateSecureToken(purpose: TokenPurpose): string {
  return `${purpose}_${crypto.randomBytes(32).toString('hex')}`;
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
    const token = generateSecureToken('v1');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    // Colonne `reset_token` partagée avec le reset de mot de passe : le préfixe
    // `v1_` distingue les usages, sans migration de base de données.
    await prisma.user.update({
      where: { id: userId },
      data: {
        resetToken: token,
        resetTokenExpiry: expiresAt,
      },
    });

    const appUrl = env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const verificationUrl = `${appUrl}/api/auth/verify?token=${token}`;

    return sendEmail({
      to: email,
      subject: 'Confirmez votre adresse email - Multi Convert',
      html: `
        <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto">
          <h1 style="font-size:22px">Bienvenue sur Multi Convert 🎉</h1>
          <p>Confirmez votre adresse email pour activer votre compte :</p>
          <p>
            <a href="${verificationUrl}" style="display:inline-block;padding:12px 20px;background:#7c3aed;color:#ffffff;text-decoration:none;border-radius:6px">
              Confirmer mon email
            </a>
          </p>
          <p>Ou copiez ce lien dans votre navigateur :<br /><code>${verificationUrl}</code></p>
          <p style="color:#666;font-size:13px">
            Ce lien expire dans 24 heures. Si vous n'êtes pas à l'origine de cette
            inscription, ignorez cet email.
          </p>
        </div>
      `,
      text: `Confirmez votre adresse email en visitant : ${verificationUrl} (lien valable 24 heures)`,
    });
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
    // Un lien de confirmation ne peut pas réinitialiser un mot de passe
    if (!token.startsWith('v1_')) {
      console.warn('⚠️  Token de vérification refusé (usage non conforme)');
      return null;
    }

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
  // 🔧 MODE DEV: pas d'envoi d'email réel (et pas d'accès base de données)
  if (isDevMode()) {
    console.log(`🔧 [DEV MODE] Email de réinitialisation simulé pour ${email}`);
    return true;
  }

  try {
    const token = generateSecureToken('r1');
    const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1h

    // Même colonne que la confirmation d'email, mais préfixe `r1_` (usage dédié)
    await prisma.user.update({
      where: { id: userId },
      data: {
        resetToken: token,
        resetTokenExpiry: expiresAt,
      },
    });

    const appUrl = env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetUrl = `${appUrl}/reset-password?token=${token}`;

    return sendEmail({
      to: email,
      subject: 'Réinitialisation de votre mot de passe - Multi Convert',
      html: `
        <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto">
          <h1 style="font-size:22px">Réinitialisation de mot de passe</h1>
          <p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le lien ci-dessous :</p>
          <p>
            <a href="${resetUrl}" style="display:inline-block;padding:12px 20px;background:#7c3aed;color:#ffffff;text-decoration:none;border-radius:6px">
              Réinitialiser mon mot de passe
            </a>
          </p>
          <p>Ou copiez ce lien dans votre navigateur :<br /><code>${resetUrl}</code></p>
          <p style="color:#666;font-size:13px">
            Ce lien expire dans 1 heure. Si vous n'êtes pas à l'origine de cette demande,
            ignorez cet email : votre mot de passe reste inchangé.
          </p>
        </div>
      `,
      text: `Réinitialisez votre mot de passe en visitant : ${resetUrl} (lien valable 1 heure)`,
    });
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
  if (isDevMode() || !getEmailProvider()) {
    console.warn(
      '⚠️  [LEAD] Aucun email envoyé : ' +
        (isDevMode()
          ? 'mode développement actif.'
          : 'aucun fournisseur configuré (RESEND_API_KEY, SENDGRID_API_KEY ou SMTP_PASSWORD).') +
        ` Destinataires prévus : ${recipients.join(', ') || 'aucun'}.` +
        ' Le lead est bien enregistré en base.'
    );
    return false;
  }

  try {
    const sent = await sendEmail({
      to: recipients.join(','),
      replyTo: lead.email,
      subject: `[Entreprise] ${lead.company} — ${lead.name}`,
      html,
      text: `Nouvelle demande entreprise\n\nEntreprise: ${lead.company}\nContact: ${lead.name}\nEmail: ${lead.email}\nTéléphone: ${lead.phone || '-'}\nEffectif: ${lead.employees || '-'}\n\n${lead.message || '(aucun message)'}`,
    });

    if (sent) {
      console.log(`✅ Notification de lead envoyée à ${recipients.join(', ')}`);
    }
    return sent;
  } catch (error) {
    // On indique l'expediteur et les destinataires : la cause la plus
    // frequente d'echec est un expediteur non verifie chez le fournisseur.
    console.error(
      `❌ [LEAD] Echec de l'envoi a ${recipients.join(', ')} ` +
        `depuis "${env.EMAIL_FROM || 'noreply@multi-convert.com'}" :`,
      error
    );
    return false;
  }
}
