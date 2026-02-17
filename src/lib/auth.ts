import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import { env } from '@/lib/env-validation';
import type { CustomJWT, CustomJWTCallbackParams, CustomSessionCallbackParams } from '@/lib/types/auth';
import { isDevMode, DevAuth } from '@/lib/dev-auth';

function parseAdminEmails() {
  const raw = env.ADMIN_EMAILS || '';
  return raw
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

// Fournisseurs d'auth: CredentialsProvider en dev, GoogleProvider en prod
function getProviders() {
  if (isDevMode()) {
    return [
      CredentialsProvider({
        name: 'Dev Login',
        credentials: {
          email: { label: 'Email', type: 'email' },
          password: { label: 'Password', type: 'password' },
        },
        async authorize(credentials) {
          if (!credentials?.email || !credentials?.password) return null;
          const user = DevAuth.verifyCredentials(credentials.email, credentials.password);
          if (!user) return null;
          return {
            id: user.id,
            email: user.email,
            name: user.fullName,
          };
        },
      }),
    ];
  }
  
  // Production: Google OAuth
  const GoogleProvider = require('next-auth/providers/google').default;
  return [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
  ];
}

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  providers: getProviders(),
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;
      
      // 🔧 MODE DEV: pas de DB
      if (isDevMode()) {
        console.log('🔧 [DEV MODE] signIn:', user.email);
        return true;
      }
      
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
      
      // 🔧 MODE DEV: données mock
      if (isDevMode()) {
        if (user) {
          (token as CustomJWT).userId = user.id || 'dev-user-1';
          (token as CustomJWT).role = 'USER';
        }
        return token;
      }

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

