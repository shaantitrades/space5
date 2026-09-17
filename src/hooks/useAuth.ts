/**
 * Hook React pour gérer l'authentification
 *
 * ⚠️ Avant, ce hook ne lisait que `localStorage` (mode dev) : en production la
 * session est un cookie httpOnly, donc l'en-tête affichait toujours
 * « Connexion / S'inscrire ». Il interroge désormais `/api/auth/me` (cookie),
 * avec repli sur le mode dev (localStorage) et une vraie déconnexion serveur.
 */

'use client';

import { useCallback, useEffect, useState } from 'react';
import { ClientAuth } from '@/lib/client-auth';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role?: string;
  plan?: string;
  emailVerified?: string | Date | null;
  acceptMarketing?: boolean;
  devMode?: boolean;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /** Lit la session côté serveur (cookie) puis, en dev, le localStorage. */
  const refresh = useCallback(async () => {
    const devToken = ClientAuth.getToken();

    try {
      const response = await fetch('/api/auth/me', {
        cache: 'no-store',
        headers: devToken ? { Authorization: `Bearer ${devToken}` } : undefined,
      });

      if (response.ok) {
        const data = await response.json().catch(() => null);
        if (data?.authenticated && data.user) {
          setUser(data.user as AuthUser);
          return;
        }
      }

      // Repli mode dev : la session vit dans le localStorage
      setUser(devToken ? (ClientAuth.getUser() as AuthUser | null) : null);
    } catch {
      setUser(devToken ? (ClientAuth.getUser() as AuthUser | null) : null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();

    const handleAuthChange = () => refresh();
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'dev_user' || e.key === 'dev_token') refresh();
    };

    window.addEventListener('authChange', handleAuthChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('authChange', handleAuthChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [refresh]);

  /** Déconnexion : supprime le cookie côté serveur ET le jeton dev local. */
  const logout = useCallback(async () => {
    setUser(null);

    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Le cookie sera de toute façon ignoré après rechargement
    }

    if (typeof window !== 'undefined') {
      localStorage.removeItem('dev_token');
      localStorage.removeItem('dev_user');
      window.location.href = '/';
    }
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    logout,
    refresh,
  };
}

