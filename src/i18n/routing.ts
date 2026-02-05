import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';
import { getAvailableLocales } from '@/config/i18n';

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: getAvailableLocales(1), // Langues actives (EN, FR, ES, DE, IT, PT, HI, RU, SV, NO)

  // Used when no locale matches
  defaultLocale: 'en',
});

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);
