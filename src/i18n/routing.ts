import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';
import { getAvailableLocales } from '@/config/i18n';

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: getAvailableLocales(1), // Langues actives (EN, FR, ES, DE, IT, PT, HI, RU, SV, NO)

  // Used when no locale matches
  defaultLocale: 'en',

  /**
   * Les balises hreflang sont déclarées à UN SEUL endroit : les metadata Next
   * (`lib/seo.ts` → `buildAlternates`) et `app/sitemap.ts`.
   *
   * L'en-tête `Link` généré par next-intl annonçait `x-default` → `/`
   * (une redirection 307 vers `/en`) alors que le HTML ET le sitemap annoncent
   * `x-default` → `/en` : deux signaux contradictoires envoyés à Google pour la
   * même URL (rapport hreflang de Search Console). Le HTML couvrant déjà les
   * 10 langues + `x-default`, on désactive l'en-tête redondant.
   */
  alternateLinks: false,
});

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);
