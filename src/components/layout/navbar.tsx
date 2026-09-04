'use client';

import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { Globe, Menu, X, PenLine, Check } from 'lucide-react';
import { useState } from 'react';
import { ToolsModal } from '@/components/modals/tools-modal';
import { getAvailableLocales } from '@/config/i18n';
import  UserMenu from '@/components/layout/user-menu';
import { siteConfig } from '@/config/site';

export function Navbar() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toolsModalOpen, setToolsModalOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const navItems = [
    { href: '/', label: t('home') },
    { href: '/tools', label: t('tools') },
    { href: '/convert', label: t('convert') },
    { href: '/archive', label: t('archive') },
    ...(siteConfig.features.showPricing
      ? [
          { href: '/pricing', label: t('pricing') },
          { href: '/enterprise', label: t('enterprise') },
        ]
      : []),
    { href: '/features', label: t('features') },
    { href: '/api', label: t('api') },
  ];

  const languageOrder = ['en', 'fr', 'es', 'de', 'it', 'pt', 'hi', 'ru', 'sv', 'no'];
  const available = new Set(getAvailableLocales(1));
  const languages = languageOrder.filter((c) => available.has(c));


  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Multi Convert
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === item.href ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </Link>
            ))}
            
            {/* Remplir et Signer - Lien direct */}
            <Link
              href="/pdf?tool=sign"
              className={`text-sm font-medium transition-colors hover:text-primary flex items-center space-x-1 ${
                pathname?.includes('/pdf') && pathname?.includes('sign') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <PenLine className="w-4 h-4" />
              <span>Remplir et Signer</span>
            </Link>
            
            {/* Bouton Outils - Ouvre la modale */}
            <button
              onClick={() => setToolsModalOpen(true)}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname?.startsWith('/pdf') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              Outils
            </button>
          </div>

          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <div className="hidden md:block relative">
              <button
                type="button"
                onClick={() => setLangOpen((v) => !v)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm"
                aria-label="Choisir la langue"
              >
                <Globe className="w-4 h-4" />
                <span className="uppercase">{locale}</span>
              </button>
              {langOpen && (
                <div className="absolute right-0 top-full mt-2 w-44 max-h-80 overflow-y-auto bg-background border border-border rounded-xl shadow-lg z-[9999]">
                  {languages.map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => {
                        setLangOpen(false);
                        router.replace(pathname || '/', { locale: code });
                      }}
                      className="w-full px-3 py-2 text-sm flex items-center justify-between hover:bg-muted transition-colors"
                    >
                      <span className="uppercase">{code}</span>
                      {code === locale && <Check className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Auth Buttons */}
            <UserMenu />

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-4 py-2 text-sm font-medium hover:bg-accent rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            
            {/* Remplir et Signer Mobile */}
            <Link
              href="/pdf?tool=sign"
              className="block px-4 py-2 text-sm font-medium hover:bg-accent rounded-md flex items-center space-x-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <PenLine className="w-4 h-4" />
              <span>Remplir et Signer</span>
            </Link>
            
            {/* Bouton Outils Mobile */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setToolsModalOpen(true);
              }}
              className="block px-4 py-2 text-sm font-medium hover:bg-accent rounded-md text-left w-full"
            >
              Outils
            </button>
            
            <div className="px-4 py-2 border-t">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Globe className="w-4 h-4" /> Langue
                </span>
                <select
                  className="bg-transparent border border-border rounded-md px-2 py-1 text-sm"
                  value={locale}
                  onChange={(e) => router.replace(pathname || '/', { locale: e.target.value })}
                >
                  {languages.map((code) => (
                    <option key={code} value={code}>
                      {code.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
              <Link
                href="/login"
                className="block py-2 text-sm font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('login')}
              </Link>
              <Link
                href="/signup"
                className="block py-2 text-sm font-medium text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('signup')}
              </Link>
            </div>
          </div>
        )}
      </div>
      
      {/* Modale des Outils */}
      <ToolsModal 
        isOpen={toolsModalOpen} 
        onClose={() => setToolsModalOpen(false)} 
      />
    </nav>
  );
}
