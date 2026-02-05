# 🛠️ PLAN DE CORRECTION DÉTAILLÉ - Multi Convert
**Priorité:** 🔴 CRITIQUE  
**Durée estimée:** 3-4 semaines  
**Équipe:** 2-3 développeurs

---

## 📋 CORRECTIONS À APPORTER

### CORRECTION 1: Sécuriser les Variables d'Environnement

**Problème:** Secrets hardcoded ou avec valeurs par défaut dangereuses

**Fichiers à modifier:**
- `src/lib/auth.ts`
- `src/app/api/auth/login/route.ts`
- `src/lib/security/rate-limiter.ts`
- `docker-compose.yml`

**Code de solution:**

```typescript
// src/lib/env-validation.ts (NOUVEAU FICHIER)
import { z } from 'zod';

const envSchema = z.object({
  // Requis (sera lancé si manquant)
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  JWT_SECRET: z.string().min(32),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  ENCRYPTION_KEY: z.string().min(32),
  
  // Optionnels
  ADMIN_EMAILS: z.string().default(''),
  NODE_ENV: z.enum(['development', 'production']).default('production'),
  SENTRY_DSN: z.string().url().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
});

export const env = envSchema.parse(process.env);
```

**Utilisation dans le code:**

```typescript
// src/lib/auth.ts (MODIFIER)
import { env } from '@/lib/env-validation';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,  // ✅ Lance une erreur si manquant
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  secret: env.NEXTAUTH_SECRET,
};
```

---

### CORRECTION 2: Créer un Système de Typage Strict

**Problème:** `as any` cassent la sécurité TypeScript

**Fichier:** src/lib/types/auth.ts (NOUVEAU)

```typescript
import type { JWT } from 'next-auth/jwt';
import type { Session } from 'next-auth';
import { Plan } from '@prisma/client';

export interface CustomJWT extends JWT {
  userId: string;
  plan: Plan;
  role: 'USER' | 'ADMIN' | 'MODERATOR';
  emailVerified: Date | null;
}

export interface CustomSession extends Session {
  user: Session['user'] & {
    id: string;
    plan: Plan;
    role: 'USER' | 'ADMIN' | 'MODERATOR';
  };
}

export interface CustomJWTCallback {
  token: CustomJWT;
  user?: any;
}

export interface CustomSessionCallback {
  session: CustomSession;
  token: CustomJWT;
}
```

**Utilisation:**

```typescript
// src/lib/auth.ts (MODIFIER)
import type { CustomJWT, CustomSession } from '@/lib/types/auth';

export const authOptions: NextAuthOptions = {
  callbacks: {
    async jwt(params: CustomJWTCallback) {
      const { token, user } = params;
      const email = (user?.email || token.email) as string | undefined;
      
      if (email) {
        const dbUser = await prisma.user.findUnique({ 
          where: { email: email.toLowerCase() } 
        });
        
        if (dbUser) {
          token.userId = dbUser.id;  // ✅ Type-safe!
          token.plan = dbUser.plan;
          token.role = dbUser.role as 'USER' | 'ADMIN' | 'MODERATOR';
        }
      }
      return token;
    },
    
    async session(params: CustomSessionCallback): Promise<CustomSession> {
      const { session, token } = params;
      
      session.user = {
        ...session.user,
        id: token.userId,  // ✅ Typescript vérifie la propriété
        plan: token.plan,
        role: token.role,
      };
      
      return session;
    },
  },
};
```

---

### CORRECTION 3: Valider les Mots de Passe Stricts

**Problème:** Pas de validation de force

**Fichier:** src/lib/schemas/auth.ts (NOUVEAU)

```typescript
import { z } from 'zod';

export const signupSchema = z.object({
  fullName: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string()
    .min(12, 'Minimum 12 caractères')
    .max(128)
    .regex(/[A-Z]/, 'Minimum 1 majuscule')
    .regex(/[a-z]/, 'Minimum 1 minuscule')
    .regex(/[0-9]/, 'Minimum 1 chiffre')
    .regex(/[!@#$%^&*()_+=\[\]{};:'",.<>?\/\\|-]/, 'Minimum 1 caractère spécial'),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'Vous devez accepter les CGU'
  }),
  acceptMarketing: z.boolean().default(false),
});

export type SignupInput = z.infer<typeof signupSchema>;
```

**Utilisation:**

```typescript
// src/app/api/auth/signup/route.ts (MODIFIER)
import { signupSchema } from '@/lib/schemas/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // ✅ Validation stricte
    const data = signupSchema.parse(body);
    
    // Vérifier l'email
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'Cet email est déjà utilisé' },
        { status: 409 }
      );
    }

    // Hasher avec bcrypt
    const hashedPassword = await bcrypt.hash(data.password, 12);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        name: data.fullName,
        passwordHash: hashedPassword,
        acceptMarketing: data.acceptMarketing,
      },
    });

    // 🆕 Envoyer email de vérification (voir CORRECTION 4)
    await sendVerificationEmail(user.email, user.id);

    return NextResponse.json({ 
      message: 'Inscription réussie. Vérifiez votre email.' 
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { errors: error.errors },
        { status: 400 }
      );
    }
    
    // ✅ Ne JAMAIS exposer l'erreur réelle
    console.error('Signup error:', error);
    return NextResponse.json(
      { message: 'Erreur lors de l\'inscription' },
      { status: 500 }
    );
  }
}
```

---

### CORRECTION 4: Ajouter Email Verification

**Fichier:** src/lib/email.ts (NOUVEAU)

```typescript
import nodemailer from 'nodemailer';
import { env } from '@/lib/env-validation';

// Configuration SendGrid (recommandé) ou SMTP
const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST || 'smtp.sendgrid.net',
  port: 587,
  auth: {
    user: 'apikey',
    pass: env.SENDGRID_API_KEY || env.SMTP_PASSWORD,
  },
});

export async function sendVerificationEmail(email: string, userId: string) {
  const token = generateSecureToken(); // Voir ci-dessous
  
  // Sauvegarder le token dans la base de données
  await prisma.user.update({
    where: { id: userId },
    data: {
      resetToken: token,
      resetTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
    },
  });

  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify?token=${token}`;

  await transporter.sendMail({
    from: 'noreply@Multi Convert.com',
    to: email,
    subject: 'Vérifiez votre email Multi Convert',
    html: `
      <h1>Bienvenue sur Multi Convert!</h1>
      <p>Cliquez le lien ci-dessous pour vérifier votre email:</p>
      <a href="${verificationUrl}">Vérifier mon email</a>
      <p>Ce lien expire dans 24 heures.</p>
    `,
  });
}

function generateSecureToken(): string {
  return require('crypto').randomBytes(32).toString('hex');
}
```

**Endpoint de vérification:** src/app/api/auth/verify/route.ts (NOUVEAU)

```typescript
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Token manquant' }, { status: 400 });
  }

  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiry: { gt: new Date() }, // Token pas expiré
    },
  });

  if (!user) {
    return NextResponse.json({ error: 'Token invalide' }, { status: 400 });
  }

  // Marquer comme vérifié
  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: new Date(),
      resetToken: null,
      resetTokenExpiry: null,
    },
  });

  return NextResponse.json({ message: 'Email vérifié!' });
}
```

---

### CORRECTION 5: Ajouter CORS & CSP Headers

**Fichier:** next.config.js (MODIFIER)

```javascript
/** @type {import('next').NextConfig} */
const withNextIntl = require('next-intl/plugin')('./i18n.ts');

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // ✅ AJOUTER CES HEADERS
  headers: async () => {
    return [
      {
        source: '/api/:path*',
        headers: [
          // CORS
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.ALLOWED_ORIGINS || 'https://Multi Convert.com',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
          
          // Sécurité
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          
          // CSP
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'",
          },
        ],
      },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'Multi Convert.com',
      },
      {
        protocol: 'https',
        hostname: '*.cloudfront.net',
      },
    ],
  },
};

module.exports = withNextIntl(nextConfig);
```

---

### CORRECTION 6: Implémenter Rate Limiting

**Fichier:** src/middleware.ts (MODIFIER)

```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Rate limiter avec Upstash (gratuit jusqu'à 3000/jour)
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '60 s'), // 10 requêtes par minute
});

export async function middleware(request: NextRequest) {
  // API rate limiting
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const ip = request.ip || 'unknown';
    
    try {
      const { success, limit, reset, remaining } = await ratelimit.limit(ip);

      if (!success) {
        return NextResponse.json(
          { error: 'Too many requests' },
          {
            status: 429,
            headers: {
              'Retry-After': Math.ceil(reset / 1000).toString(),
            },
          }
        );
      }

      // Ajouter les headers rate limit
      const response = NextResponse.next();
      response.headers.set('X-RateLimit-Limit', limit.toString());
      response.headers.set('X-RateLimit-Remaining', remaining.toString());
      response.headers.set('X-RateLimit-Reset', reset.toString());
      
      return response;
    } catch (error) {
      console.error('Rate limit error:', error);
      return NextResponse.next(); // Fail open
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
```

**Installation:**
```bash
npm install @upstash/ratelimit @upstash/redis
```

---

### CORRECTION 7: Configurer Sentry pour les Logs

**Fichier:** sentry.client.config.ts (NOUVEAU)

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  release: process.env.NEXT_PUBLIC_VERSION,
});
```

**Fichier:** sentry.server.config.ts (NOUVEAU)

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
```

**Utilisation dans les erreurs:**

```typescript
// src/app/api/convert/route.ts
try {
  // ...
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      section: 'conversion',
      userId: userId || 'anonymous',
    },
  });
  
  return NextResponse.json(
    { error: 'Conversion failed' },
    { status: 500 }
  );
}
```

---

### CORRECTION 8: Supprimer le Champ Password en Plain Text

**Fichier:** prisma/schema.prisma (MODIFIER)

```prisma
model User {
  id                   String         @id @default(uuid())
  email                String         @unique
  passwordHash         String?        @map("password_hash")
  // ❌ SUPPRIMER CETTE LIGNE:
  // password             String?        // Pour compatibilité
  
  // ... reste du modèle
}
```

**Exécuter la migration:**
```bash
npx prisma migrate dev --name remove_plain_text_password
```

---

### CORRECTION 9: Ajouter Tests Unitaires

**Fichier:** jest.config.js (NOUVEAU)

```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
}

module.exports = createJestConfig(customJestConfig)
```

**Fichier:** src/__tests__/auth.test.ts (EXEMPLE)

```typescript
import { signupSchema } from '@/lib/schemas/auth';

describe('Auth Validation', () => {
  it('should reject weak passwords', () => {
    expect(() => {
      signupSchema.parse({
        fullName: 'John Doe',
        email: 'john@example.com',
        password: '123456',  // Trop faible
        acceptTerms: true,
      });
    }).toThrow();
  });

  it('should accept strong passwords', () => {
    const result = signupSchema.parse({
      fullName: 'John Doe',
      email: 'john@example.com',
      password: 'MyStr0ng!Password123',
      acceptTerms: true,
    });

    expect(result.email).toBe('john@example.com');
  });
});
```

**Ajouter au package.json:**
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

---

### CORRECTION 10: Documenter l'API avec Swagger

**Installation:**
```bash
npm install swagger-jsdoc swagger-ui-express
npm install -D @types/swagger-jsdoc @types/swagger-ui-express
```

**Fichier:** src/lib/swagger.ts (NOUVEAU)

```typescript
import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Multi Convert API',
      version: '1.0.0',
      description: 'API de conversion de fichiers universelle',
    },
    servers: [
      {
        url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
        description: 'API Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
        },
      },
    },
  },
  apis: ['./src/app/api/**/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
```

**Endpoint Swagger:** src/app/api/docs/route.ts (NOUVEAU)

```typescript
import { swaggerSpec } from '@/lib/swagger';

export async function GET() {
  return Response.json(swaggerSpec);
}
```

---

## 📋 ORDRE D'IMPLÉMENTATION RECOMMANDÉ

### Semaine 1 (URGENT)
1. ✅ CORRECTION 1: Sécuriser variables d'env
2. ✅ CORRECTION 2: Types stricts (enlever `as any`)
3. ✅ CORRECTION 3: Validation mots de passe
4. ✅ Supprimer champ `password` de Prisma

### Semaine 2
5. ✅ CORRECTION 4: Email verification
6. ✅ CORRECTION 5: CORS & CSP headers
7. ✅ CORRECTION 7: Sentry logging

### Semaine 3
8. ✅ CORRECTION 6: Rate limiting
9. ✅ CORRECTION 9: Tests unitaires (80% coverage)

### Semaine 4
10. ✅ CORRECTION 10: Swagger docs
11. ✅ Audit externe
12. ✅ Load testing

---

## 🧪 TESTER LES CORRECTIONS

```bash
# 1. Vérifier les types TypeScript
npm run type-check

# 2. Exécuter les tests
npm run test

# 3. Linter
npm run lint

# 4. Build production
npm run build

# 5. Démarrer locally
npm run dev

# 6. Vérifier les variables d'env
npm run setup
```

---

## ✅ CHECKLIST AVANT PROD

- [ ] Tous les TODO implémentés
- [ ] Tous les tests passent (80%+ coverage)
- [ ] Lint passe sans warnings
- [ ] Build prod réussie
- [ ] CORS configuré pour les bons domaines
- [ ] Email verification fonctionne
- [ ] Rate limiting en prod (Upstash)
- [ ] Sentry logs collectés
- [ ] Secrets correctement configurés
- [ ] SSL certificate installé (A+ rating)
- [ ] Backup base de données configuré
- [ ] Monitoring alertes activées
- [ ] Runbook opérationnel documenté

---

**Maintenant, vous êtes prêt pour un lancement MONDE en toute confiance! 🚀**
