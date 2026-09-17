'use client';

import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { Globe, Menu, X, PenLine, Check, User, LayoutDashboard, Settings, LogOut } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { ToolsModal } from '@/components/modals/tools-modal';
import { getAvailableLocales, LANGUAGES } from '@/config/i18n';
import  UserMenu from '@/components/layout/user-menu';
import { siteConfig } from '@/config/site';
import { useAuth } from '@/hooks/useAuth';
import ConfirmDialog from '@/components/ui/confirm-dialog';

export function Navbar() {
  const t = useTranslations('nav');
  const tUser = useTranslations('userMenu');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toolsModalOpen, setToolsModalOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  // Le menu utilisateur complet est masqué sous md (md:flex) : sans cette
  // session partagée, le menu mobile affichait « Connexion / S'inscrire »
  // même une fois connecté.
  const { user, isAuthenticated, logout } = useAuth();

  // Ferme automatiquement le menu des langues au clic à l'extérieur ou avec Échap
  useEffect(() => {
    if (!langOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setLangOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setLangOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [langOpen]);

  const navItems = [
    { href: '/', label: t('home') },
    { href: '/tools', label: t('tools') },
    { href: '/convert', label: t('convert') },
    { href: '/archive', label: t('archive') },
    ...(siteConfig.features.showPricing ? [{ href: '/pricing', label: t('pricing') }] : []),
    // La page pilote entreprise reste accessible même quand les tarifs sont masqués :
    // c'est une page d'offre commerciale, pas une grille tarifaire.
    { href: '/entreprise', label: t('enterprise') },
    { href: '/features', label: t('features') },
  ];

  const languageOrder = ['en', 'fr', 'es', 'de', 'it', 'pt', 'hi', 'ru', 'sv', 'no'];
  const available = new Set(getAvailableLocales(1));
  const languages = languageOrder
    .filter((code) => available.has(code))
    .map((code) => ({
      code,
      name: LANGUAGES[code]?.nativeName ?? code.toUpperCase(),
    }));


  return (
    <nav className="relative z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <img
              src="/logo.svg"
              alt=""
              aria-hidden="true"
              width={32}
              height={32}
              className="h-8 w-8 shrink-0"
            />
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
              <span>{t('fillSign')}</span>
            </Link>
            
            {/* Bouton Outils - Ouvre la modale */}
            <button
              onClick={() => setToolsModalOpen(true)}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname?.startsWith('/pdf') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              {t('tools')}
            </button>
          </div>

          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <div ref={langMenuRef} className="hidden md:block relative">
              <button
                type="button"
                onClick={() => setLangOpen((v) => !v)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm"
                aria-label={t('chooseLanguage')}
                aria-expanded={langOpen}
                aria-haspopup="menu"
              >
                <Globe className="w-4 h-4" />
                <span className="uppercase">{locale}</span>
              </button>
              {langOpen && (
                <div className="absolute right-0 top-full mt-2 w-44 max-h-80 overflow-y-auto bg-background border border-border rounded-xl shadow-lg z-[9999]">
                  {languages.map((language) => (
                    <Link
                      key={language.code}
                      href={pathname || '/'}
                      locale={language.code}
                      onClick={() => setLangOpen(false)}
                      className="w-full px-3 py-2 text-sm flex items-center justify-between gap-2 hover:bg-muted transition-colors"
                    >
                      <span className="truncate">{language.name}</span>
                      {language.code === locale && <Check className="w-4 h-4 shrink-0" />}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Auth Buttons */}
            <UserMenu />

            {/* Rappel visuel de la session sur mobile (le UserMenu complet est
                masqué par `hidden md:flex`) : sans lui, rien n'indiquait que
                l'on était connecté. */}
            {isAuthenticated && (
              <Link
                href="/dashboard"
                className="md:hidden flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary"
                title={user?.fullName || user?.email || undefined}
                aria-label={tUser('dashboard')}
              >
                <User className="w-4 h-4" />
              </Link>
            )}

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
              <span>{t('fillSign')}</span>
            </Link>
            
            {/* Bouton Outils Mobile */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setToolsModalOpen(true);
              }}
              className="block px-4 py-2 text-sm font-medium hover:bg-accent rounded-md text-left w-full"
            >
              {t('tools')}
            </button>
            
            <div className="px-4 py-2 border-t">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Globe className="w-4 h-4" /> {t('language')}
                </span>
                <select
                  className="bg-transparent border border-border rounded-md px-2 py-1 text-sm"
                  value={locale}
                  onChange={(e) => router.replace(pathname || '/', { locale: e.target.value })}
                >
                  {languages.map((language) => (
                    <option key={language.code} value={language.code}>
                      {language.name}
                    </option>
                  ))}
                </select>
              </div>
              {isAuthenticated ? (
                <div className="pt-1 border-t border-border mt-1">
                  <div className="py-2">
                    <p className="text-sm font-medium truncate">{user?.fullName}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 py-2 text-sm font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    {tUser('dashboard')}
                  </Link>
                  <Link
                    href="/dashboard/settings"
                    className="flex items-center gap-2 py-2 text-sm font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Settings className="w-4 h-4" />
                    {tUser('settings')}
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setConfirmLogout(true);
                    }}
                    className="flex w-full items-center gap-2 py-2 text-sm font-medium text-red-600"
                  >
                    <LogOut className="w-4 h-4" />
                    {tUser('logout')}
                  </button>
                </div>
              ) : (
                <>
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
                </>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Modale des Outils */}
      <ToolsModal 
        isOpen={toolsModalOpen} 
        onClose={() => setToolsModalOpen(false)} 
      />

      {/* Confirmation avant déconnexion (aussi accessible depuis le menu mobile) */}
      <ConfirmDialog
        open={confirmLogout}
        title="Se déconnecter ?"
        description="Vous devrez saisir votre email et votre mot de passe pour vous reconnecter."
        confirmLabel="Se déconnecter"
        onCancel={() => setConfirmLogout(false)}
        onConfirm={() => {
          setConfirmLogout(false);
          logout();
        }}
      />
    </nav>
  );
}
