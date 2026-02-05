/**
 * 🔐 TYPES D'AUTHENTIFICATION TYPE-SAFE - Multi Convert
 * 
 * Remplace les "as any" par des types stricts
 */

import type { JWT } from 'next-auth/jwt';
import type { Session, User } from 'next-auth';
import type { Plan } from '@prisma/client';

/**
 * JWT token personnalisé avec infos utilisateur
 */
export interface CustomJWT extends JWT {
  userId: string;
  email?: string;
  plan: Plan;
  role: 'USER' | 'ADMIN' | 'MODERATOR';
  emailVerified: Date | null;
  iat?: number;
  exp?: number;
}

/**
 * Session personnalisée avec infos utilisateur
 */
export interface CustomSession extends Session {
  user: Session['user'] & {
    id: string;
    email: string;
    plan: Plan;
    role: 'USER' | 'ADMIN' | 'MODERATOR';
    emailVerified: Date | null;
  };
}

/**
 * Paramètres pour le callback JWT
 */
export interface CustomJWTCallbackParams {
  token: JWT;
  user?: User;
  account?: any;
  isNewUser?: boolean;
}

/**
 * Paramètres pour le callback session
 */
export interface CustomSessionCallbackParams {
  session: Session;
  token: JWT;
}
