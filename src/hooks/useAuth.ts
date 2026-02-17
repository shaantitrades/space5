/**
 * Hook React pour gérer l'authentification
 */

'use client';

import { useState, useEffect } from 'react';
import { ClientAuth, DevUser } from '@/lib/client-auth';

export function useAuth() {
  const [user, setUser] = useState<DevUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Charger l'utilisateur depuis localStorage au montage
    const currentUser = ClientAuth.getUser();
    setUser(currentUser);
    setIsLoading(false);

    // Écouter les changements de localStorage (pour les autres onglets)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'dev_user' || e.key === 'dev_token') {
        const updatedUser = ClientAuth.getUser();
        setUser(updatedUser);
      }
    };

    // Écouter les événements personnalisés de connexion/déconnexion
    const handleAuthChange = () => {
      const updatedUser = ClientAuth.getUser();
      setUser(updatedUser);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authChange', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []);

  const logout = () => {
    ClientAuth.logout();
    setUser(null);
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    logout,
  };
}
