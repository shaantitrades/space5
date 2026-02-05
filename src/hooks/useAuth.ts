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
