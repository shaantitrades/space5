import { prisma } from '@/lib/prisma';
import { isDevMode } from '@/lib/dev-auth';

export type CreditFileType = 'pdf' | 'image' | 'audio' | 'video';

export type CreditOptions = {
  ocr?: boolean;
  compression?: boolean;
  ai?: boolean;
};

export function inferCreditFileType(params: { filename?: string; mimeType?: string | null }): CreditFileType {
  const filename = (params.filename || '').toLowerCase();
  const mime = (params.mimeType || '').toLowerCase();
  const ext = filename.includes('.') ? filename.split('.').pop() || '' : '';

  if (mime.startsWith('video/')) return 'video';
  if (mime.startsWith('audio/')) return 'audio';
  if (mime.startsWith('image/')) return 'image';
  if (mime === 'application/pdf') return 'pdf';

  if (['mp4', 'avi', 'mov', 'webm', 'mkv'].includes(ext)) return 'video';
  if (['mp3', 'wav', 'aac', 'flac', 'ogg', 'm4a'].includes(ext)) return 'audio';
  if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp', 'tiff', 'svg'].includes(ext)) return 'image';
  return 'pdf';
}

export function isQuotaExceededError(err: unknown): boolean {
  const e: any = err;
  return e?.payload?.error === 'QUOTA_EXCEEDED' || e?.message === 'QUOTA_EXCEEDED';
}

/**
 * Même logique que le calculateur UI (`src/app/[locale]/credits/page.tsx`).
 * On garde un algo simple, prédictible, et on arrondit au supérieur.
 */
export function calculateCredits(params: {
  fileType: CreditFileType;
  fileSizeBytes: number;
  options?: CreditOptions;
}): number {
  const { fileType, fileSizeBytes, options } = params;
  const fileSizeMb = fileSizeBytes / (1024 * 1024);

  let credits = 1; // Base

  // Facteur taille
  if (fileSizeMb > 50) credits += 1;
  if (fileSizeMb > 100) credits += 2;

  // Facteur type
  if (fileType === 'video') credits += 3;
  if (fileType === 'audio') credits += 2;

  // Options
  if (options?.ocr) credits += 1;
  if (options?.compression) credits += 0.5;
  if (options?.ai) credits += 2;

  return Math.max(1, Math.ceil(credits));
}

export async function reserveCreditsOrThrow(params: { userId?: string; credits: number }) {
  const { userId, credits } = params;
  if (!credits || credits <= 0) return;

  // 🔧 MODE DEV: toujours autoriser
  if (isDevMode()) {
    console.log(`🔧 [DEV MODE] Crédits réservés: ${credits} pour ${userId}`);
    return;
  }

  if (!userId) {
    const err = new Error('AUTH_REQUIRED');
    (err as any).status = 401;
    (err as any).payload = {
      error: 'AUTH_REQUIRED',
      message: "Connectez-vous pour utiliser des crédits (paiement à l'usage).",
    };
    throw err;
  }

  // Débit atomique si (credits >= demandé)
  const updated = await prisma.user.updateMany({
    where: { id: userId, credits: { gte: credits } },
    data: { credits: { decrement: credits } },
  });

  if (updated.count !== 1) {
    const dbUser = await prisma.user.findUnique({ where: { id: userId }, select: { credits: true } }).catch(() => null);
    const err = new Error('INSUFFICIENT_CREDITS');
    (err as any).status = 402;
    (err as any).payload = {
      error: 'INSUFFICIENT_CREDITS',
      required: credits,
      available: dbUser?.credits ?? 0,
      message: "Crédits insuffisants. Achetez un pack ou passez à un abonnement.",
    };
    throw err;
  }
}

export async function refundCredits(params: { userId?: string; credits: number }) {
  const { userId, credits } = params;
  if (!userId || !credits || credits <= 0) return;
  
  // 🔧 MODE DEV: no-op
  if (isDevMode()) {
    console.log(`🔧 [DEV MODE] Crédits remboursés: ${credits} pour ${userId}`);
    return;
  }

  await prisma.user.update({ where: { id: userId }, data: { credits: { increment: credits } } }).catch(() => null);
}

