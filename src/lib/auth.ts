import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { prisma } from '@/lib/prisma';
import { env } from '@/lib/env-validation';
import type { CustomJWT, CustomJWTCallbackParams, CustomSessionCallbackParams } from '@/lib/types/auth';

function parseAdminEmails() {
  const raw = env.ADMIN_EMAILS || '';
  return raw
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;
      const email = user.email.toLowerCase();
      const adminEmails = parseAdminEmails();
      const shouldBeAdmin = adminEmails.includes(email);

      await prisma.user.upsert({
        where: { email },
        update: {
          name: user.name || undefined,
          emailVerified: new Date(),
          lastLogin: new Date(),
          role: shouldBeAdmin ? 'ADMIN' : undefined,
        },
        create: {
          email,
          name: user.name || null,
          emailVerified: new Date(),
          lastLogin: new Date(),
          role: shouldBeAdmin ? 'ADMIN' : 'USER',
        },
      });
      return true;
    },
    async jwt(params: CustomJWTCallbackParams) {
      const { token, user } = params;
      const email = (user?.email || token.email) as string | undefined;
      
      if (email) {
        const dbUser = await prisma.user.findUnique({ 
          where: { email: email.toLowerCase() } 
        });
        
        if (dbUser) {
          (token as CustomJWT).userId = dbUser.id;
          (token as CustomJWT).plan = dbUser.plan;
          (token as CustomJWT).role = dbUser.role as 'USER' | 'ADMIN' | 'MODERATOR';
          (token as CustomJWT).emailVerified = dbUser.emailVerified;
        }
      }
      return token;
    },
    async session(params: CustomSessionCallbackParams) {
      const { session, token } = params;
      const customToken = token as CustomJWT;
      
      session.user = {
        ...session.user,
        id: customToken.userId,
        email: customToken.email || session.user?.email || '',
        plan: customToken.plan,
        role: customToken.role,
        emailVerified: customToken.emailVerified,
      };
      
      return session;
    },
  },
  secret: env.NEXTAUTH_SECRET,
};

