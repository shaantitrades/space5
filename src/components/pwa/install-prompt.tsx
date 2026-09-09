'use client';

import { useEffect, useState } from 'react';

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
 */
export function InstallPrompt() {
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

  const lang = typeof navigator !== 'undefined' && navigator.language?.startsWith('fr') ? 'fr' : 'en';
  const copy =
    lang === 'fr'
      ? {
          title: '📲 Multi Convert est disponible sur tous vos appareils',
          subtitle: 'Installez l\u2019application pour un accès rapide, même hors ligne',
          install: 'Installer',
          ok: 'OK',
          dismiss: 'Fermer',
          iosHint: 'Disponible sur tous vos appareils \u2014 Partager → « Sur l\u2019écran d\u2019accueil »',
        }
      : {
          title: '📲 Multi Convert is available on all your devices',
          subtitle: 'Install the app for one-tap access, even offline',
          install: 'Install',
          ok: 'OK',
          dismiss: 'Close',
          iosHint: "Available on all your devices — Share → 'Add to Home Screen'",
        };

  return (
    <div className="sticky top-0 inset-x-0 z-[100] w-full border-b border-border bg-primary/95 text-primary-foreground backdrop-blur">
      <div className="container mx-auto flex items-center gap-3 px-4 py-2.5">
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
