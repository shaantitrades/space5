/**
 * 🔐 SESSION UTILISATEUR — cookie httpOnly partagé
 *
 * Source unique de vérité pour :
 *  - le nom du cookie (`auth-token`)
 *  - la signature, la pose et la suppression du cookie
 *  - la lecture de la session côté serveur (`/api/auth/me`, routes protégées)
 *
 * ⚠️ Ce module utilise `jsonwebtoken` (Node) : ne jamais l'importer depuis
 * `src/middleware.ts` (Edge runtime).
 */

import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { verifyDevToken } from '@/lib/dev-auth';

export const AUTH_COOKIE_NAME = 'auth-token';

/** Durée de session : 7 jours (30 jours avec « se souvenir de moi ») */
export const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;
export const SESSION_TTL_REMEMBER_SECONDS = 30 * 24 * 60 * 60;

export interface SessionUser {
  userId: string;
  email: string;
  role: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

/** Signe un jeton de session (même format que `/api/auth/login`). */
export function signSessionToken(user: SessionUser, ttlSeconds: number): string {
  return jwt.sign(
    { userId: user.userId, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: ttlSeconds }
  );
}

/** Pose le cookie de session sur une réponse (httpOnly, SameSite=Lax). */
export function applySessionCookie(
  response: NextResponse,
  token: string,
  ttlSeconds: number
): void {
  response.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: ttlSeconds,
    path: '/',
  });
}

/** Supprime le cookie de session (déconnexion). */
export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set(AUTH_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
}

function readCookieToken(cookieHeader: string): string | null {
  for (const part of cookieHeader.split(';')) {
    const [name, ...rest] = part.trim().split('=');
    if (name === AUTH_COOKIE_NAME) {
      return decodeURIComponent(rest.join('=') || '');
    }
  }
  return null;
}

/**
 * Lit la session depuis la requête :
 *  1. cookie `auth-token` (production — posé par la connexion et par la
 *     confirmation d'email) ;
 *  2. en-tête `Authorization: Bearer …` (mode développement, jeton localStorage).
 */
export function readSession(request: Request): SessionUser | null {
  const cookieToken = readCookieToken(request.headers.get('cookie') || '');
  const bearerToken = (request.headers.get('authorization') || '')
    .replace(/^Bearer\s+/i, '')
    .trim();
  const token = cookieToken || bearerToken;

  if (!token) return null;

  try {
    const payload = jwt.verify(token, JWT_SECRET) as Partial<SessionUser>;
    if (!payload?.userId) return null;

    return {
      userId: payload.userId,
      email: String(payload.email || ''),
      role: String(payload.role || 'USER'),
    };
  } catch {
    // Mode développement : jeton base64 non signé (createDevToken)
    const dev = verifyDevToken(token);
    if (dev && typeof dev.id === 'string') {
      return { userId: dev.id, email: String(dev.email || ''), role: 'USER' };
    }
    return null;
  }
}
