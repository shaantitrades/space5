/**
 * 🌍 CONFIGURATION INTERNATIONALISATION - Multi Convert
 * 
 * Support de 10 langues progressives avec focus sur les marchés premium
 */

export interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  completion: number; // Pourcentage de traduction
  priority: number; // Priorité de développement
  rtl?: boolean; // Right-to-left
  phase: 1 | 2 | 3 | 4;
}

export const LANGUAGES: Record<string, LanguageConfig> = {
  // Langues actives (capture)
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    completion: 100,
    priority: 1,
    phase: 1,
  },
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    completion: 100,
    priority: 1,
    phase: 1,
  },
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    completion: 100,
    priority: 1,
    phase: 1,
  },
  de: {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    completion: 100,
    priority: 1,
    phase: 1,
  },
  it: {
    code: 'it',
    name: 'Italian',
    nativeName: 'Italiano',
    completion: 100,
    priority: 1,
    phase: 1,
  },
  pt: {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    completion: 100,
    priority: 1,
    phase: 1,
  },
  hi: {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    completion: 100,
    priority: 1,
    phase: 1,
  },
  ru: {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    completion: 100,
    priority: 1,
    phase: 1,
  },
  sv: {
    code: 'sv',
    name: 'Swedish',
    nativeName: 'Svenska',
    completion: 100,
    priority: 1,
    phase: 1,
  },
  no: {
    code: 'no',
    name: 'Norwegian',
    nativeName: 'Norsk',
    completion: 100,
    priority: 1,
    phase: 1,
  },
};

// Marchés prioritaires
export const PRIORITY_MARKETS = {
  PRIORITY_1: [
    'US', // USA
    'CA', // Canada
    'DE', // Germany
    'FR', // France
    'GB', // United Kingdom
    'AE', // UAE
    'SA', // Saudi Arabia
    'QA', // Qatar
  ],
  PRIORITY_2: [
    'ES', // Spain
    'IT', // Italy
    'NL', // Netherlands
    'BE', // Belgium
    'CH', // Switzerland
    'AT', // Austria
    'SE', // Sweden
    'NO', // Norway
  ],
  PRIORITY_3: [
    'PT', // Portugal
    'PL', // Poland
    'CZ', // Czech Republic
    'HU', // Hungary
    'GR', // Greece
    'IE', // Ireland
  ],
} as const;

// Locale par défaut
export const DEFAULT_LOCALE = 'en';

// Locales disponibles (selon la phase)
export function getAvailableLocales(phase: 1 | 2 | 3 | 4 = 1): string[] {
  return Object.values(LANGUAGES)
    .filter((lang) => lang.phase <= phase)
    .map((lang) => lang.code);
}
