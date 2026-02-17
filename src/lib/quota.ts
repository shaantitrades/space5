import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { MEDIA_QUOTAS, parseSizeToBytes, pricing, type PricingTier } from '@/config/pricing';
import { getUserId } from '@/lib/auth-utils';
import type { CustomSession } from '@/lib/types/auth';
import { isDevMode } from '@/lib/dev-auth';

type Tier = 'free' | 'pro' | 'business' | 'enterprise';
type MediaKind = 'audio' | 'video';

function planToTier(plan: unknown): Tier {
  const p = String(plan || '').toUpperCase();
  if (p === 'PROFESSIONAL') return 'pro';
  if (p === 'BUSINESS') return 'business';
  if (p === 'ENTERPRISE') return 'enterprise';
  return 'free'; // STARTER + défaut
}

function tierToPricingTier(tier: Tier): PricingTier {
  if (tier === 'pro') return 'pro';
  if (tier === 'business') return 'business';
  if (tier === 'enterprise') return 'business';
  return 'free';
}

export async function getSessionTierAndUserId(): Promise<{ tier: Tier; userId?: string }> {
  // 🔧 MODE DEV: retourner un utilisateur dev par défaut
  if (isDevMode()) {
    return { tier: 'pro', userId: 'dev-user-1' };
  }
  const session = await getServerSession(authOptions);
  const customSession = session as CustomSession | null;
  const userId = customSession?.userId || getUserId(session);
  const plan = customSession?.user?.plan;
  return { tier: planToTier(plan), userId };
}

const AUDIO_EXTS = ['mp3', 'wav', 'aac', 'flac', 'ogg', 'm4a', 'mp4'] as const;
const VIDEO_EXTS = ['mp4', 'avi', 'mov', 'webm', 'mkv'] as const;

function monthRange(date = new Date()) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 1, 0, 0, 0, 0);
  return { start, end };
}

export function bytesFromTierMaxSize(tier: Tier): number {
  const pt = tierToPricingTier(tier);
  return parseSizeToBytes(pricing[pt].maxSize);
}

export function bytesFromMediaMaxSize(tier: Tier): number {
  const pt = tierToPricingTier(tier);
  const mediaQuota = MEDIA_QUOTAS[pt] || MEDIA_QUOTAS.free;
  const maxSize = mediaQuota?.maxSize ?? pricing[pt].maxSize;
  return parseSizeToBytes(maxSize);
}

export async function assertMonthlyQuotaOrThrow(params: {
  userId?: string;
  tier: Tier;
  kind: 'general' | 'media-audio' | 'media-video';
}) {
  const { userId, tier, kind } = params;
  if (!userId) return; // pas de quota mensuel fiable sans user

  // 🔧 MODE DEV: pas de vérification de quota
  if (isDevMode()) {
    console.log('🔧 [DEV MODE] Quota check skipped');
    return;
  }

  const pt = tierToPricingTier(tier);
  const { start, end } = monthRange();

  const whereBase: any = { userId, createdAt: { gte: start, lt: end } };
  const where =
    kind === 'general'
      ? whereBase
      : kind === 'media-audio'
        ? {
            ...whereBase,
            OR: [
              { inputFormat: { in: [...AUDIO_EXTS] } },
              { outputFormat: { in: [...AUDIO_EXTS] } },
            ],
          }
        : {
            ...whereBase,
            OR: [
              { inputFormat: { in: [...VIDEO_EXTS] } },
              { outputFormat: { in: [...VIDEO_EXTS] } },
            ],
          };

  const used = await prisma.conversion.count({ where });

  const monthlyLimit =
    kind === 'general'
      ? pricing[pt].limit
      : kind === 'media-video'
        ? MEDIA_QUOTAS[pt]?.videoMonthlyLimit || 0
        : MEDIA_QUOTAS[pt]?.audioMonthlyLimit || 0;

  if (typeof monthlyLimit === 'number' && used >= monthlyLimit) {
    const err = new Error('QUOTA_EXCEEDED') as Error & { status?: number; payload?: any };
    err.status = 402;
    err.payload = {
      error: 'QUOTA_EXCEEDED',
      tier: pt,
      limit: monthlyLimit,
      used,
      resetAt: end.toISOString(),
    };
    throw err;
  }
}

export function assertUploadSizeOrThrow(params: {
  tier: Tier;
  totalBytes: number;
  kind: 'general' | 'media';
}) {
  const { tier, totalBytes, kind } = params;
  const maxBytes = kind === 'media' ? bytesFromMediaMaxSize(tier) : bytesFromTierMaxSize(tier);
  if (totalBytes > maxBytes) {
    const pt = tierToPricingTier(tier);
    const err = new Error('FILE_TOO_LARGE') as Error & { status?: number; payload?: any };
    err.status = 413;
    const mediaQuota = MEDIA_QUOTAS[pt] || MEDIA_QUOTAS.free;
    err.payload = {
      error: 'FILE_TOO_LARGE',
      tier: pt,
      maxSize: kind === 'media' ? mediaQuota?.maxSize : pricing[pt].maxSize,
      totalBytes,
      maxBytes,
    };
    throw err;
  }
}

export function assertMediaAllowedOrThrow(params: { tier: Tier; mediaKind: MediaKind }) {
  const { tier, mediaKind } = params;
  const pt = tierToPricingTier(tier);
  if (pt === 'free' && mediaKind === 'video') {
    const err = new Error('MEDIA_NOT_ALLOWED');
    (err as any).status = 402;
    (err as any).payload = {
      error: 'MEDIA_NOT_ALLOWED',
      message: "La conversion vidéo est désactivée sur l'offre gratuite.",
      tier: pt,
    };
    throw err;
  }
}

export async function recordConversion(params: {
  userId?: string;
  inputFileName: string;
  inputFormat: string;
  outputFormat: string;
  fileSizeBytes?: number;
  creditsUsed?: number;
  status: 'COMPLETED' | 'FAILED';
  errorMessage?: string;
}) {
  if (!params.userId) return;

  // 🔧 MODE DEV: pas d'enregistrement en DB
  if (isDevMode()) {
    console.log(`🔧 [DEV MODE] Conversion enregistrée: ${params.inputFileName} → ${params.outputFormat} (${params.status})`);
    return;
  }

  const fileSizeMb = typeof params.fileSizeBytes === 'number' ? params.fileSizeBytes / (1024 * 1024) : null;
  await prisma.conversion
    .create({
      data: {
        userId: params.userId,
        inputFileName: params.inputFileName,
        inputFormat: params.inputFormat,
        outputFormat: params.outputFormat,
        fileSizeMb,
        creditsUsed: typeof params.creditsUsed === 'number' ? params.creditsUsed : 0,
        status: params.status as any,
        errorMessage: params.errorMessage || null,
        completedAt: params.status === 'COMPLETED' ? new Date() : null,
      } as any,
    })
    .catch(() => null);
}

export function inferExt(name: string): string {
  const n = String(name || '');
  const idx = n.lastIndexOf('.');
  return idx >= 0 ? n.slice(idx + 1).toLowerCase() : '';
}

