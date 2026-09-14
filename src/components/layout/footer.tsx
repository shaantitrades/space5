'use client';

import { Link, usePathname, useRouter } from '@/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';
import { Twitter, Github } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { getAvailableLocales, LANGUAGES } from '@/config/i18n';
export function Footer() {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  /** Traduit la clé si elle existe, sinon conserve le texte français d'origine */
  const tr = (key: string, fallback: string): string => {
    const fullKey = `footer.${key}`;
    return t.has(fullKey) ? (t(fullKey) as string) : fallback;
  };

  const footerLinks = {
    product: [
      { name: 'Fonctionnalités', href: '/features' },
      { name: 'Tous les outils', href: '/tools' },
      ...(siteConfig.features.showPricing ? [{ name: 'Tarifs', href: '/pricing' }] : []),
      { name: 'API', href: '/documentation' },
      { name: 'Générateur QR', href: '/qr' },
    ],
    company: [
      { name: 'Entreprise', href: '/entreprise' },
      { name: 'Blog', href: '/blog' },
      { name: 'Archive', href: '/archive' },
    ],
    legal: [
      { name: 'Confidentialité', href: '/privacy' },
      { name: 'Conditions', href: '/terms' },
      { name: 'Cookies', href: '/cookies' },
      { name: 'Mentions légales', href: '/legal' },
    ],
    resources: [
      { name: 'Documentation', href: '/documentation' },
      { name: 'Contact', href: '/contact' },
    ],
  };

  /**
   * Réseaux sociaux : uniquement des comptes réellement tenus.
   * Un lien mort (ou un compte inexistant) est immédiatement repéré
   * par un prospect et décrédibilise le site.
   */
  const socialLinks = [
    { name: 'Twitter', icon: Twitter, href: siteConfig.links.twitter },
    { name: 'GitHub', icon: Github, href: siteConfig.links.github },
  ];

  const languageOrder = ['en', 'fr', 'es', 'de', 'it', 'pt', 'hi', 'ru', 'sv', 'no'];
  const availableLocales = new Set(getAvailableLocales(1));
  const languages = languageOrder
    .filter((code) => availableLocales.has(code))
    .map((code) => ({
      code,
      name: LANGUAGES[code]?.nativeName ?? code.toUpperCase(),
    }));

  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto px-4 py-12">
        {/* Grille principale 4 colonnes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Colonne 1 : Produit */}
          <div>
            <h4 className="font-bold mb-4 text-foreground">{tr('product', 'Produit')}</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {tr(`links.${link.name}`, link.name)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Colonne 2 : Société */}
          <div>
            <h4 className="font-bold mb-4 text-foreground">{tr('company', 'Société')}</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {tr(`links.${link.name}`, link.name)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Colonne 3 : Légal */}
          <div>
            <h4 className="font-bold mb-4 text-foreground">{tr('legal', 'Légal')}</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {tr(`links.${link.name}`, link.name)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Colonne 4 : Ressources */}
          <div>
            <h4 className="font-bold mb-4 text-foreground">{tr('resources', 'Ressources')}</h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {tr(`links.${link.name}`, link.name)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Séparateur */}
        <div className="border-t pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Copyright + Logo */}
            <div className="flex items-center gap-4">
              <div className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Multi Convert
              </div>
              <span className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} {tr('rights', 'Tous droits réservés')}
              </span>
            </div>

            {/* Réseaux sociaux */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-all flex items-center justify-center"
                    aria-label={social.name}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>

            {/* Sélecteur de langue */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">🌍</span>
              <select
                value={locale}
                onChange={(e) => router.replace(pathname || '/', { locale: e.target.value })}
                aria-label="Language"
                className="text-sm bg-background border border-border rounded px-3 py-1 text-foreground"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
