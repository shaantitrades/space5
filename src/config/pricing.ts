/**
 * 💳 PRICING & QUOTAS - Multi Convert
 *
 * Source of truth pour:
 * - limites mensuelles de conversions
 * - tailles max (par requête / total upload)
 *
 * NB: Les conversions audio/vidéo sont volontairement très limitées en Free.
 */
export const pricing = {
  free: { limit: 10, maxSize: '100MB' },
  pro: { limit: 1000, maxSize: '1GB', price: '9.99€/mois' },
  business: { limit: 10000, maxSize: '10GB', price: '49.99€/mois' },
} as const;

export type PricingTier = keyof typeof pricing;

export const MEDIA_QUOTAS = {
  free: {
    // "Très limité ou presque pas"
    audioMonthlyLimit: 1,
    videoMonthlyLimit: 0,
    // Taille max plus stricte que les autres outils
    maxSize: '25MB',
  },
  pro: {
    audioMonthlyLimit: 200,
    videoMonthlyLimit: 200,
    maxSize: pricing.pro.maxSize,
  },
  business: {
    audioMonthlyLimit: 2000,
    videoMonthlyLimit: 2000,
    maxSize: pricing.business.maxSize,
  },
} as const satisfies Record<PricingTier, any>;

export function parseSizeToBytes(input: string): number {
  const raw = String(input || '').trim().toUpperCase();
  const match = raw.match(/^(\d+(?:\.\d+)?)\s*(B|KB|MB|GB)$/);
  if (!match) throw new Error(`Taille invalide: "${input}"`);
  const value = Number(match[1]);
  const unit = match[2];
  const k = 1024;
  const mult =
    unit === 'B'
      ? 1
      : unit === 'KB'
        ? k
        : unit === 'MB'
          ? k * k
          : k * k * k;
  return Math.floor(value * mult);
}

/**
 * 💰 CONFIGURATION PRICING - Multi Convert
 * 
 * Plans d'abonnement et pricing dissuasif pour pays à risque
 */

import { DISSUASIVE_MINIMUM_PRICES, DISSUASIVE_PRICING_MULTIPLIERS } from '@/config/security';

export interface PricingPlan {
  id: string;
  name: string;
  nameKey: string; // Pour i18n
  price: {
    USD: number;
    EUR: number;
    AED: number;
  } | 0;
  features: {
    conversions: number | 'unlimited';
    maxSize: number | 'custom'; // En MB
    watermark: boolean;
    speed: 'normal' | 'priority' | 'express' | 'instant';
    support: 'community' | 'email_24h' | 'chat_2h' | 'phone_24/7';
    batch: number | 'unlimited'; // Nombre de fichiers
    api?: number | 'unlimited'; // Requêtes/mois
    ai?: boolean | 'full';
    whiteLabel?: boolean;
    sso?: boolean;
    sla?: string;
    accountManager?: boolean;
  };
  popular?: boolean;
}

export const PRICING_PLANS: Record<string, PricingPlan> = {
  FREE: {
    id: 'free',
    name: 'Starter',
    nameKey: 'pricing.plans.starter',
    price: 0,
    features: {
      conversions: 10,
      maxSize: 100,
      watermark: true,
      speed: 'normal',
      support: 'community',
      batch: 1,
    },
  },

  PRO: {
    id: 'pro',
    name: 'Professional',
    nameKey: 'pricing.plans.professional',
    price: {
      USD: 9.99,
      EUR: 9.99,
      AED: 39,
    },
    features: {
      conversions: 1000,
      maxSize: 1024,
      watermark: false,
      speed: 'priority',
      support: 'email_24h',
      batch: 10,
      api: 1000,
    },
    popular: true,
  },

  BUSINESS: {
    id: 'business',
    name: 'Business',
    nameKey: 'pricing.plans.business',
    price: {
      USD: 49.99,
      EUR: 49.99,
      AED: 190,
    },
    features: {
      conversions: 10000,
      maxSize: 10240,
      watermark: false,
      speed: 'express',
      support: 'chat_2h',
      batch: 50,
      api: 10000,
      ai: 'full',
    },
  },

  ENTERPRISE: {
    id: 'enterprise',
    name: 'Enterprise',
    nameKey: 'pricing.plans.enterprise',
    price: 'custom' as unknown as string,
    features: {
      conversions: 'unlimited',
      maxSize: 'custom',
      watermark: false,
      speed: 'instant',
      support: 'phone_24/7',
      batch: 'unlimited',
      api: 'unlimited',
      ai: 'full',
      whiteLabel: true,
      sso: true,
      sla: '99.9%',
      accountManager: true,
    },
  },
};

// API Pricing tiers
export const API_PRICING = {
  developer: {
    price: { USD: 49, EUR: 39, AED: 180 },
    requests: 10000,
    name: 'Developer',
  },
  startup: {
    price: { USD: 199, EUR: 169, AED: 730 },
    requests: 100000,
    name: 'Startup',
  },
  enterprise: {
    price: 'custom' as unknown as string,
    requests: 'unlimited',
    name: 'Enterprise',
  },
} as const;

// Fonction pour obtenir le prix avec pricing dissuasif
export function getPriceWithDissuasive(
  countryCode: string,
  planId: string,
  currency: 'USD' | 'EUR' | 'AED' = 'USD',
  isVerified: boolean = false
): {
  amount: number;
  currency: string;
  warning: string | null;
  requiresVerification: boolean;
  fraudRisk: 'HIGH' | 'NORMAL';
} {
  const plan = PRICING_PLANS[planId.toUpperCase()];
  if (!plan || plan.price === 0 || plan.price === 'custom') {
    return {
      amount: 0,
      currency,
      warning: null,
      requiresVerification: false,
      fraudRisk: 'NORMAL',
    };
  }

  const basePrice = plan.price[currency];
  const multiplier = DISSUASIVE_PRICING_MULTIPLIERS[countryCode] || DISSUASIVE_PRICING_MULTIPLIERS.DEFAULT;

  let price = basePrice * multiplier;

  // Appliquer le prix minimum dissuasif si nécessaire
  const minimum = DISSUASIVE_MINIMUM_PRICES[countryCode];
  if (minimum && price < minimum) {
    price = minimum;
  }

  // Arrondir à des prix "bizarres" pour montrer que c'est dissuasif
  price = Math.ceil(price / 50) * 50;

  return {
    amount: price,
    currency,
    warning:
      multiplier > 1
        ? `Enhanced security pricing applied for ${countryCode}`
        : null,
    requiresVerification: multiplier > 3 || !isVerified,
    fraudRisk: multiplier > 2 ? 'HIGH' : 'NORMAL',
  };
}
