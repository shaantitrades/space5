/**
 * Gestion de l'authentification côté client (mode dev)
 */

'use client';

export interface DevUser {
  id: string;
  email: string;
  fullName: string;
}

export const ClientAuth = {
  /**
   * Sauvegarder le token et les infos utilisateur
   */
  login: (token: string, user: DevUser): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('dev_token', token);
      localStorage.setItem('dev_user', JSON.stringify(user));
      window.dispatchEvent(new CustomEvent('authChange'));
    }
  },

  /**
   * Récupérer l'utilisateur connecté
   */
  getUser: (): DevUser | null => {
    if (typeof window === 'undefined') return null;
    
    const userStr = localStorage.getItem('dev_user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  /**
   * Récupérer le token
   */
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('dev_token');
  },

  /**
   * Vérifier si l'utilisateur est connecté
   */
  isAuthenticated: (): boolean => {
    return !!ClientAuth.getToken();
  },

  /**
   * Déconnexion
   */
  logout: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('dev_token');
      localStorage.removeItem('dev_user');
      window.dispatchEvent(new CustomEvent('authChange'));
      window.location.href = '/';
    }
  },
};
