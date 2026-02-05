'use client';

import { Link } from '@/i18n/routing';
import { Facebook, Twitter, Linkedin, Github, Youtube, Instagram } from 'lucide-react';

export function Footer() {
  const footerLinks = {
    product: [
      { name: 'Fonctionnalités', href: '/features' },
      { name: 'Tarifs', href: '/pricing' },
      { name: 'API', href: '/documentation' },
      { name: 'Applications', href: '/apps' },
      { name: 'Intégrations', href: '/integrations' },
    ],
    company: [
      { name: 'À propos', href: '/about' },
      { name: 'Sécurité', href: '/security' },
      { name: 'Entreprise', href: '/entreprise' },
      { name: 'Blog', href: '/blog' },
      { name: 'Carrières', href: '/careers' },
    ],
    legal: [
      { name: 'Confidentialité', href: '/privacy' },
      { name: 'Conditions', href: '/terms' },
      { name: 'RGPD', href: '/gdpr' },
      { name: 'Cookies', href: '/cookies' },
      { name: 'Mentions légales', href: '/legal' },
    ],
    resources: [
      { name: 'Documentation', href: '/docs' },
      { name: 'Aide', href: '/help' },
      { name: 'Contact', href: '/contact' },
      { name: 'Statut', href: '/status' },
      { name: 'Changelog', href: '/changelog' },
    ],
  };

  const socialLinks = [
    { name: 'Twitter', icon: Twitter, href: 'https://twitter.com/Multi Convert' },
    { name: 'Facebook', icon: Facebook, href: 'https://facebook.com/Multi Convert' },
    { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com/company/Multi Convert' },
    { name: 'GitHub', icon: Github, href: 'https://github.com/Multi Convert' },
    { name: 'YouTube', icon: Youtube, href: 'https://youtube.com/Multi Convert' },
    { name: 'Instagram', icon: Instagram, href: 'https://instagram.com/Multi Convert' },
  ];

  const languages = [
    { code: 'fr', name: 'Français' },
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'de', name: 'Deutsch' },
  ];

  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto px-4 py-12">
        {/* Grille principale 4 colonnes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Colonne 1 : Produit */}
          <div>
            <h4 className="font-bold mb-4 text-foreground">Produit</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Colonne 2 : Société */}
          <div>
            <h4 className="font-bold mb-4 text-foreground">Société</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Colonne 3 : Légal */}
          <div>
            <h4 className="font-bold mb-4 text-foreground">Légal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Colonne 4 : Ressources */}
          <div>
            <h4 className="font-bold mb-4 text-foreground">Ressources</h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
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
                © {new Date().getFullYear()} Tous droits réservés
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
              <select className="text-sm bg-background border border-border rounded px-3 py-1 text-foreground">
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
