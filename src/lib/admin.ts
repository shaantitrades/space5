import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from '@/i18n/routing';
import type { CustomSession } from '@/lib/types/auth';
import { isAdmin, getUserRole } from '@/lib/auth-utils';

export async function requireSession(locale: string): Promise<CustomSession> {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect({ href: '/login', locale });
  return session as CustomSession;
}

export async function requireAdmin(locale: string): Promise<CustomSession> {
  const session = await requireSession(locale);
  if (!isAdmin(session)) redirect({ href: '/403', locale });
  return session;
}

