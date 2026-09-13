'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const DISMISS_KEY = 'mc-install-dismissed';
const COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // 7 jours avant de re-proposer

/**
 * Bannière « Installer l'application » (PWA).
 * - Android / Chrome / Edge : s'affiche via l'événement `beforeinstallprompt`.
 * - iOS Safari : s'affiche après un délai (iOS ne déclenche pas l'événement).
 * - Ne s'affiche pas si déjà installée ou récemment refusée.
 * Tous les textes viennent du namespace i18n `install` (10 langues).
 */
export function InstallPrompt() {
  const t = useTranslations('install');
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);


  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(standalone);
    if (standalone) return;

    const iOS =
      /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase()) &&
      !(window as unknown as { MSStream?: unknown }).MSStream;
    setIsIOS(iOS);

    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    const inCooldown = dismissedAt ? Date.now() - Number(dismissedAt) < COOLDOWN_MS : false;

    const show = () => {
      if (!inCooldown) {
        setTimeout(() => setVisible(true), 2500);
      }
    };

    const onBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      show();
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);

    // iOS ne déclenche pas `beforeinstallprompt` → on propose après un délai
    if (iOS) show();

    const onAppInstalled = () => {
      setIsStandalone(true);
      setVisible(false);
    };
    window.addEventListener('appinstalled', onAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, []);

  async function handleInstall() {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setVisible(false);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      // iOS : l'installation se fait via Partage → « Sur l'écran d'accueil »
      setVisible(false);
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    }
  }

  function handleDismiss() {
    setVisible(false);
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  }

  if (!visible || isStandalone) return null;

  const copy = {
    title: t('title'),
    subtitle: t('subtitle'),
    install: t('install'),
    ok: t('ok'),
    dismiss: t('dismiss'),
    iosHint: t('iosHint'),
  };

  return (
    <div className="fixed inset-x-3 bottom-4 z-[9999] mx-auto max-w-md rounded-xl border border-border bg-primary/95 text-primary-foreground shadow-2xl backdrop-blur">
      <div className="flex items-center gap-3 px-4 py-3">
        <img src="/icon-192.png" alt="Multi Convert" className="h-8 w-8 shrink-0 rounded-lg" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{copy.title}</p>
          <p className="truncate text-xs opacity-90">
            {isIOS ? copy.iosHint : copy.subtitle}
          </p>
        </div>
        <button
          onClick={handleInstall}
          className="shrink-0 rounded-lg bg-primary-foreground px-3 py-1.5 text-xs font-semibold text-primary hover:opacity-90"
        >
          {isIOS ? copy.ok : copy.install}
        </button>
        <button
          onClick={handleDismiss}
          aria-label={copy.dismiss}
          className="shrink-0 rounded-lg p-1.5 text-primary-foreground/80 hover:bg-primary-foreground/10"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
