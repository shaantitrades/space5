/**
 * 🛡️ CONFIGURATION SÉCURITÉ MILITAIRE - Multi Convert
 * 
 * Blocage géographique et protection anti-fraude
 */

export const BLOCKED_COUNTRIES = {
  // Niveau 1 : Blocage total (pas d'accès)
  LEVEL_1: [
    'IN', // Inde - Hackers #1
    'CN', // Chine - Espionnage industriel
    'RU', // Russie - Ransomware étatique
    'NG', // Nigeria - Fraude 419
    'BR', // Brésil - Banking trojans
    'PK', // Pakistan - Hacktivistes
    'BD', // Bangladesh - Carding
    'VN', // Vietnam - Scammers organisés
    'ID', // Indonésie
    'PH', // Philippines - BPO fraud
  ],

  // Niveau 2 : Surveillance extrême
  LEVEL_2: [
    'UA', 'BY', 'MD', // Europe de l'Est
    'RO', 'BG', 'AL', // Balkans
    'TR', 'IR', 'IQ', // Moyen-Orient risque
    'GH', 'KE', 'ZA', // Afrique
    'MX', 'CO', 'PE', // Amérique Latine
  ],
} as const;

export const SECURITY_ACTIONS = {
  LEVEL_1: {
    access: 'BLOCKED',
    logging: 'FULL',
    alert: 'IMMEDIATE',
    pricing: 'DISSASIVE', // 10x prix normal
  },
  LEVEL_2: {
    access: 'CHALLENGE',
    rateLimit: 'STRICT',
    verification: 'ENHANCED',
    monitoring: '24/7',
  },
} as const;

// ASNs suspects (data centers de hackers)
export const SUSPICIOUS_ASNS = [
  'AS134963', 'AS14061', 'AS394695', // DigitalOcean/linode Inde
  'AS14618', 'AS55836', 'AS24560', // AWS/Reliance/Bharti Inde
  'AS20473', 'AS2906', 'AS12389', // Russie/Ukraine
];

// Rate limits par tier utilisateur
export const RATE_LIMITS = {
  free: {
    requests: 15,
    window: 60 * 60 * 1000, // 1 heure
    fileSize: 100 * 1024 * 1024, // 100 MB
  },
  pro: {
    requests: 200,
    window: 60 * 60 * 1000, // 1 heure
    fileSize: 1024 * 1024 * 1024, // 1 GB
  },
  business: {
    requests: 1000,
    window: 60 * 60 * 1000, // 1 heure
    fileSize: 10 * 1024 * 1024 * 1024, // 10 GB
  },
  enterprise: {
    requests: Infinity,
    window: 60 * 60 * 1000,
    fileSize: Infinity,
  },
} as const;

// Multiplicateurs de prix dissuasifs
export const DISSUASIVE_PRICING_MULTIPLIERS: Record<string, number> = {
  IN: 10.0, // Inde - 10x le prix
  NG: 8.0, // Nigeria
  PK: 7.0, // Pakistan
  BD: 6.0, // Bangladesh
  VN: 5.0, // Vietnam
  CN: 4.0, // Chine
  RU: 4.0, // Russie
  BR: 3.5, // Brésil
  DEFAULT: 1.0,
};

// Prix minimums dissuasifs (USD)
export const DISSUASIVE_MINIMUM_PRICES: Record<string, number> = {
  IN: 299.99,
  NG: 249.99,
  PK: 199.99,
  BD: 179.99,
  VN: 149.99,
  CN: 129.99,
  RU: 129.99,
  BR: 99.99,
};

// Types de fichiers autorisés avec MIME types
export const ALLOWED_FILE_TYPES = {
  pdf: ['application/pdf'],
  image: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/bmp',
    'image/tiff',
    'image/svg+xml',
  ],
  video: [
    'video/mp4',
    'video/avi',
    'video/mov',
    'video/webm',
    'video/mkv',
    'video/x-msvideo',
  ],
  audio: [
    'audio/mpeg',
    'audio/wav',
    'audio/aac',
    'audio/flac',
    'audio/ogg',
    'audio/mp4',
    'audio/x-m4a',
  ],
  document: [
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ],
} as const;

// Tailles maximales par tier (en bytes)
export const MAX_FILE_SIZES = {
  free: 100 * 1024 * 1024, // 100 MB
  pro: 1024 * 1024 * 1024, // 1 GB
  business: 10 * 1024 * 1024 * 1024, // 10 GB
  enterprise: Infinity,
} as const;

// Timeout pour conversions (en millisecondes)
export const CONVERSION_TIMEOUTS = {
  image: 30000, // 30 secondes
  pdf: 60000, // 1 minute
  video: 300000, // 5 minutes
  audio: 120000, // 2 minutes
  document: 90000, // 1.5 minutes
} as const;

// Configuration Threat Score Cloudflare
export const THREAT_SCORE_THRESHOLD = 20;

// Configuration VPN/Proxy detection
export const VPN_DETECTION = {
  enabled: true,
  strictMode: true,
  requireCaptcha: true,
} as const;
