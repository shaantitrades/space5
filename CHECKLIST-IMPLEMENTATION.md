# ✅ CHECKLIST IMPLÉMENTATION - Multi Convert
**Durée totale:** 3-4 semaines avec une équipe de 2-3 devs  
**Priorité:** 🔴 CRITIQUE

---

## 🎯 OVERVIEW DES PRIORITÉS

```
URGENT (Semaine 1-2)        IMPORTANT (Semaine 3-4)      OPTIMIZATION (Mois 2+)
├─ Env variables     ├─ Email verification        ├─ Performance tuning
├─ Type safety       ├─ Rate limiting              ├─ Caching strategy
├─ Auth security     ├─ Tests unit (80%)           ├─ Global CDN
├─ CORS/CSP          ├─ API documentation          ├─ Advanced monitoring
├─ Remove password   └─ Backup strategy            └─ ML-based detection
└─ Logs (Sentry)
```

---

## SEMAINE 1: SÉCURITÉ DES SECRETS & TYPES

### ✅ Tâche 1.1: Créer Validation des Variables d'Env

**Fichier:** `src/lib/env-validation.ts`

```typescript
import { z } from 'zod';

const envSchema = z.object({
  // Requis - lance une erreur si manquant
  DATABASE_URL: z.string().url('DATABASE_URL doit être une URL valide'),
  DIRECT_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET doit faire 32+ caractères'),
  JWT_SECRET: z.string().min(32),
  GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID manquant'),
  GOOGLE_CLIENT_SECRET: z.string().min(1, 'GOOGLE_CLIENT_SECRET manquant'),
  ENCRYPTION_KEY: z.string().min(32),
  
  // Optionnels
  ADMIN_EMAILS: z.string().default(''),
  NODE_ENV: z.enum(['development', 'production']).default('production'),
  SENTRY_DSN: z.string().url().optional(),
  SENDGRID_API_KEY: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

export const env = envSchema.parse(process.env);

// Validé au démarrage
if (process.env.NODE_ENV === 'production') {
  try {
    envSchema.parse(process.env);
    console.log('✅ Variables d\'env validées');
  } catch (error) {
    console.error('❌ Variables d\'env invalides:', error);
    process.exit(1);
  }
}
```

**Checklist:**
- [ ] Fichier créé
- [ ] Toutes les variables requises listées
- [ ] Export du type `Env`
- [ ] Validation au démarrage implémentée
- [ ] Test en dev: `npm run dev` doit afficher "✅ Variables validées"

---

### ✅ Tâche 1.2: Remplacer les Imports dans le Code

**Fichiers à modifier:**
1. `src/lib/auth.ts`
2. `src/app/api/auth/login/route.ts`
3. `src/lib/security/rate-limiter.ts`

**Exemple - avant/après:**

```typescript
// ❌ AVANT
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

// ✅ APRÈS
import { env } from '@/lib/env-validation';
const JWT_SECRET = env.JWT_SECRET;  // Lance une erreur si manquant
```

**Checklist:**
- [ ] `src/lib/auth.ts` line 6 modifiée
- [ ] `src/app/api/auth/login/route.ts` line 14 modifiée
- [ ] `src/lib/security/rate-limiter.ts` line 16 modifiée
- [ ] Build réussie: `npm run build`
- [ ] Aucun warning de TypeScript

---

### ✅ Tâche 1.3: Créer Types Stricts pour Auth

**Fichier:** `src/lib/types/auth.ts` (NOUVEAU)

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
```

**Utilisation dans `src/lib/auth.ts`:**

```typescript
import type { CustomJWT, CustomSession } from '@/lib/types/auth';

// Enlever tous les "as any"
async jwt(params: { token: CustomJWT; user?: any }) {
  const { token, user } = params;
  // Maintenant token.userId est type-safe
}
```

**Checklist:**
- [ ] Fichier `src/lib/types/auth.ts` créé
- [ ] Types exportés correctement
- [ ] `src/lib/auth.ts` utilise les types
- [ ] Tous les `as any` enlevés
- [ ] TypeScript compile: `npm run type-check`

---

### ✅ Tâche 1.4: Configurer CORS & CSP Headers

**Fichier:** `next.config.js` (MODIFIER)

```javascript
const nextConfig = {
  // ... autres configs
  
  headers: async () => {
    return [
      {
        source: '/api/:path*',
        headers: [
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
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self'",
          },
        ],
      },
    ];
  },
};
```

**Checklist:**
- [ ] Headers CORS ajoutés
- [ ] CSP configurée
- [ ] Testée: `curl -I https://localhost:3000/api/convert`
- [ ] Headers X-* ajoutées pour sécurité

---

### ✅ Tâche 1.5: Supprimer le Champ `password` de Prisma

**Fichier:** `prisma/schema.prisma` (MODIFIER)

```prisma
model User {
  id                   String         @id @default(uuid())
  email                String         @unique
  passwordHash         String?        @map("password_hash")
  // ❌ SUPPRIMER LA LIGNE SUIVANTE:
  // password             String?        // Pour compatibilité
  
  // ... reste du modèle
}
```

**Exécuter la migration:**

```bash
npx prisma migrate dev --name remove_plain_text_password
```

**Checklist:**
- [ ] Ligne `password` commentée/supprimée
- [ ] Migration créée avec succès
- [ ] DB mise à jour localement
- [ ] Prisma client regeneré

---

### ✅ Tâche 1.6: Ajouter Sentry pour les Logs

**Installation:**

```bash
npm install @sentry/nextjs
npm install --save-dev @sentry/cli
```

**Fichier:** `src/lib/sentry.ts` (NOUVEAU)

```typescript
import * as Sentry from "@sentry/nextjs";
import { env } from '@/lib/env-validation';

if (env.SENTRY_DSN) {
  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    tracesSampleRate: env.NODE_ENV === 'production' ? 0.1 : 1.0,
    beforeSend(event) {
      // Ne JAMAIS envoyer d'infos sensibles
      if (event.request?.cookies) {
        delete event.request.cookies;
      }
      return event;
    },
  });
}

export { Sentry };
```

**Utilisation dans les routes API:**

```typescript
import { Sentry } from '@/lib/sentry';

export async function POST(request: NextRequest) {
  try {
    // Code API
  } catch (error) {
    Sentry.captureException(error, {
      tags: { endpoint: '/api/convert' },
      contexts: { userId: userId || 'anonymous' },
    });
    
    return NextResponse.json({ error: 'Conversion failed' }, { status: 500 });
  }
}
```

**Checklist:**
- [ ] Installation complétée
- [ ] `src/lib/sentry.ts` créé
- [ ] Projet Sentry créé (sentry.io)
- [ ] DSN configurée en .env.local
- [ ] Erreur test envoyée: `throw new Error('test')`

---

## SEMAINE 2: AUTHENTIFICATION & EMAIL

### ✅ Tâche 2.1: Créer Schemas de Validation Zod

**Fichier:** `src/lib/schemas/auth.ts` (NOUVEAU)

```typescript
import { z } from 'zod';

const passwordRegex = {
  uppercase: /[A-Z]/,
  lowercase: /[a-z]/,
  number: /[0-9]/,
  special: /[!@#$%^&*()_+=\[\]{};:'",.<>?\/\\|-]/,
};

export const passwordSchema = z.string()
  .min(12, 'Minimum 12 caractères')
  .max(128)
  .regex(passwordRegex.uppercase, 'Minimum 1 majuscule')
  .regex(passwordRegex.lowercase, 'Minimum 1 minuscule')
  .regex(passwordRegex.number, 'Minimum 1 chiffre')
  .regex(passwordRegex.special, 'Minimum 1 caractère spécial');

export const signupSchema = z.object({
  fullName: z.string().min(2).max(100),
  email: z.string().email('Email invalide'),
  password: passwordSchema,
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'Vous devez accepter les CGU'
  }),
  acceptMarketing: z.boolean().default(false),
});

export type SignupInput = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type LoginInput = z.infer<typeof loginSchema>;
```

**Checklist:**
- [ ] Fichier créé
- [ ] Tous les schemas générés
- [ ] Types TypeScript exportés
- [ ] Regex de password couvre tous les critères

---

### ✅ Tâche 2.2: Implémenter Email Verification

**Installation:**

```bash
npm install nodemailer
npm install -D @types/nodemailer
```

**Fichier:** `src/lib/email.ts` (NOUVEAU)

```typescript
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { env } from '@/lib/env-validation';
import { prisma } from '@/lib/prisma';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.sendgrid.net',
  port: 587,
  auth: {
    user: 'apikey',
    pass: env.SENDGRID_API_KEY || process.env.SMTP_PASSWORD,
  },
});

export async function sendVerificationEmail(email: string, userId: string) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

  // Sauvegarder le token
  await prisma.user.update({
    where: { id: userId },
    data: {
      resetToken: token,
      resetTokenExpiry: expiresAt,
    },
  });

  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify?token=${token}`;

  try {
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
    return true;
  } catch (error) {
    console.error('Failed to send verification email:', error);
    return false;
  }
}

export async function verifyEmail(token: string) {
  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiry: { gt: new Date() },
    },
  });

  if (!user) return null;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: new Date(),
      resetToken: null,
      resetTokenExpiry: null,
    },
  });

  return user;
}
```

**Fichier:** `src/app/api/auth/signup/route.ts` (MODIFIER)

```typescript
import { signupSchema } from '@/lib/schemas/auth';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = signupSchema.parse(body); // ✅ Validation stricte

    // Vérifier l'email
    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existing) {
      return NextResponse.json(
        { message: 'Cet email est déjà utilisé' },
        { status: 409 }
      );
    }

    // Créer l'utilisateur
    const hashedPassword = await bcrypt.hash(data.password, 12);
    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        name: data.fullName,
        passwordHash: hashedPassword,
        acceptMarketing: data.acceptMarketing,
      },
    });

    // ✅ Envoyer email de vérification
    await sendVerificationEmail(user.email, user.id);

    return NextResponse.json({
      message: 'Inscription réussie. Vérifiez votre email.',
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { errors: error.errors },
        { status: 400 }
      );
    }

    console.error('Signup error:', error);
    return NextResponse.json(
      { message: 'Erreur lors de l\'inscription' },
      { status: 500 }
    );
  }
}
```

**Fichier:** `src/app/api/auth/verify/route.ts` (NOUVEAU)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { verifyEmail } from '@/lib/email';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json(
      { error: 'Token manquant' },
      { status: 400 }
    );
  }

  const user = await verifyEmail(token);

  if (!user) {
    return NextResponse.json(
      { error: 'Token invalide ou expiré' },
      { status: 400 }
    );
  }

  return NextResponse.json({
    message: 'Email vérifié avec succès!',
    redirectTo: '/login',
  });
}
```

**Checklist:**
- [ ] `src/lib/email.ts` créé
- [ ] SendGrid ou SMTP configuré
- [ ] Email de test envoyé avec succès
- [ ] Route `/api/auth/verify` créée
- [ ] Base de données contient les tokens
- [ ] Lien de vérification reçu
- [ ] Verificaton fonctionne end-to-end

---

### ✅ Tâche 2.3: Ajouter Rate Limiting

**Installation:**

```bash
npm install @upstash/ratelimit @upstash/redis
```

**Fichier:** `src/middleware.ts` (MODIFIER)

```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextRequest, NextResponse } from 'next/server';

const redis = new Redis({
  url: process.env.REDIS_URL!,
  token: process.env.REDIS_TOKEN,
});

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '60 s'),
});

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';

    try {
      const { success, limit, reset, remaining } = await ratelimit.limit(ip);

      if (!success) {
        return NextResponse.json(
          { error: 'Too many requests' },
          {
            status: 429,
            headers: {
              'Retry-After': Math.ceil(reset / 1000).toString(),
              'X-RateLimit-Limit': limit.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': reset.toString(),
            },
          }
        );
      }

      const response = NextResponse.next();
      response.headers.set('X-RateLimit-Limit', limit.toString());
      response.headers.set('X-RateLimit-Remaining', remaining.toString());
      response.headers.set('X-RateLimit-Reset', reset.toString());

      return response;
    } catch (error) {
      console.error('Rate limit error:', error);
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
```

**Checklist:**
- [ ] `@upstash/ratelimit` installé
- [ ] Redis URL configurée
- [ ] Middleware appliquée aux `/api/:path*`
- [ ] Tester: 11 requêtes rapides → 429 error
- [ ] Headers rate limit présents

---

## SEMAINE 3: TESTS & DOCUMENTATION

### ✅ Tâche 3.1: Configurer Jest

**Installation:**

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom @types/jest ts-node
```

**Fichier:** `jest.config.js` (NOUVEAU)

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
}

module.exports = createJestConfig(customJestConfig)
```

**Fichier:** `jest.setup.js` (NOUVEAU)

```javascript
import '@testing-library/jest-dom'
```

**Modifier `package.json`:**

```json
{
  "scripts": {
    "test": "jest --watch",
    "test:ci": "jest --ci --coverage",
    "test:coverage": "jest --coverage"
  }
}
```

**Checklist:**
- [ ] Jest configuré
- [ ] `jest.config.js` créé
- [ ] `jest.setup.js` créé
- [ ] Test simple s'exécute: `npm test`

---

### ✅ Tâche 3.2: Créer Tests d'Authentification

**Fichier:** `src/__tests__/auth.test.ts` (NOUVEAU)

```typescript
import { signupSchema } from '@/lib/schemas/auth';
import { z } from 'zod';

describe('Auth Validation', () => {
  describe('signupSchema', () => {
    it('should accept valid signup data', () => {
      const validData = {
        fullName: 'John Doe',
        email: 'john@example.com',
        password: 'MyStr0ng!Password123',
        acceptTerms: true,
      };

      const result = signupSchema.parse(validData);
      expect(result.email).toBe('john@example.com');
    });

    it('should reject weak passwords', () => {
      const invalidData = {
        fullName: 'John Doe',
        email: 'john@example.com',
        password: '123456',  // Trop faible
        acceptTerms: true,
      };

      expect(() => signupSchema.parse(invalidData)).toThrow(z.ZodError);
    });

    it('should reject emails without @', () => {
      expect(() => {
        signupSchema.parse({
          fullName: 'John Doe',
          email: 'invalid',
          password: 'MyStr0ng!Pass123',
          acceptTerms: true,
        });
      }).toThrow();
    });

    it('should require acceptTerms', () => {
      expect(() => {
        signupSchema.parse({
          fullName: 'John Doe',
          email: 'john@example.com',
          password: 'MyStr0ng!Pass123',
          acceptTerms: false,
        });
      }).toThrow();
    });

    it('password must contain uppercase', () => {
      expect(() => {
        signupSchema.parse({
          fullName: 'John Doe',
          email: 'john@example.com',
          password: 'mystr0ng!password123',  // Pas de majuscule
          acceptTerms: true,
        });
      }).toThrow();
    });

    it('password must contain special character', () => {
      expect(() => {
        signupSchema.parse({
          fullName: 'John Doe',
          email: 'john@example.com',
          password: 'MyStr0ng123Password',  // Pas de caractère spécial
          acceptTerms: true,
        });
      }).toThrow();
    });
  });
});
```

**Fichier:** `src/__tests__/api/signup.test.ts` (NOUVEAU)

```typescript
import { POST } from '@/app/api/auth/signup/route';
import { NextRequest } from 'next/server';

describe('POST /api/auth/signup', () => {
  it('should return 201 for valid signup', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'MyStr0ng!Password123',
        acceptTerms: true,
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(201);
  });

  it('should return 400 for invalid data', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        fullName: 'Test',
        email: 'invalid-email',
        password: '123',
        acceptTerms: false,
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});
```

**Checklist:**
- [ ] Tests créés dans `src/__tests__/`
- [ ] Tests d'authentification couvrent 15+ cas
- [ ] Coverage: `npm run test:coverage`
- [ ] Coverage > 80%
- [ ] Tous les tests passent

---

### ✅ Tâche 3.3: Documenter l'API avec Swagger

**Installation:**

```bash
npm install swagger-jsdoc swagger-ui-express
npm install -D @types/swagger-ui-express
```

**Fichier:** `src/lib/swagger.ts` (NOUVEAU)

```typescript
import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Multi Convert API',
      version: '1.0.0',
      description: 'API de conversion de fichiers universelle',
      contact: {
        name: 'Multi Convert Support',
        url: 'https://Multi Convert.com',
      },
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
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            name: { type: 'string' },
            plan: { type: 'string', enum: ['STARTER', 'PROFESSIONAL', 'BUSINESS', 'ENTERPRISE'] },
          },
        },
        SignupRequest: {
          type: 'object',
          required: ['fullName', 'email', 'password', 'acceptTerms'],
          properties: {
            fullName: { type: 'string' },
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 12 },
            acceptTerms: { type: 'boolean' },
            acceptMarketing: { type: 'boolean' },
          },
        },
      },
    },
  },
  apis: ['./src/app/api/**/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
```

**Fichier:** `src/app/api/docs/route.ts` (NOUVEAU)

```typescript
import { swaggerSpec } from '@/lib/swagger';

export async function GET() {
  return Response.json(swaggerSpec, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
```

**Fichier:** `src/app/api/docs/ui/route.tsx` (NOUVEAU)

```typescript
'use client';

import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

export default function SwaggerPage() {
  return (
    <SwaggerUI
      url="/api/docs"
      onComplete={() => console.log('Swagger UI loaded')}
    />
  );
}
```

**Documenter chaque endpoint:**

```typescript
// src/app/api/auth/signup/route.ts
/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Inscription utilisateur
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignupRequest'
 *     responses:
 *       201:
 *         description: Utilisateur créé
 *       400:
 *         description: Données invalides
 *       409:
 *         description: Email existe déjà
 */
export async function POST(request: NextRequest) {
  // ...
}
```

**Checklist:**
- [ ] Swagger installé
- [ ] Tous les endpoints documentés
- [ ] UI accessible sur `/api/docs/ui`
- [ ] Schema des modèles créés
- [ ] Exemples de réponse incluent
- [ ] Authentification documentée

---

## SEMAINE 4: DEPLOYMENT & MONITORING

### ✅ Tâche 4.1: Configurer CI/CD GitHub Actions

**Fichier:** `.github/workflows/test.yml` (NOUVEAU)

```yaml
name: Test & Lint

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: Multi Convert_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci

      - run: npm run type-check
        name: Type Check

      - run: npm run lint
        name: Lint

      - run: npm run test:ci
        name: Unit Tests
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/Multi Convert_test

      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
          fail_ci_if_error: true

      - run: npm run build
        name: Build
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/Multi Convert_test
```

**Checklist:**
- [ ] Workflow créé
- [ ] Tests exécutés sur chaque PR
- [ ] Build succès requis pour merge
- [ ] Coverage rapporté à Codecov
- [ ] Lint passe

---

### ✅ Tâche 4.2: Préparer Docker pour Production

**Fichier:** `Dockerfile` (MODIFIER)

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Installer les dépendances
COPY package.json package-lock.json ./
RUN npm ci

# Copier le code source
COPY . .

# Build
RUN npm run build

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Créer user non-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copier les fichiers buildés
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Prisma pour les migrations
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

USER nextjs

EXPOSE 3000
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

CMD ["node", "server.js"]
```

**Fichier:** `.dockerignore` (NOUVEAU)

```
node_modules
.git
.gitignore
README.md
.next
.env
.env.local
.env.*.local
coverage
```

**Checklist:**
- [ ] Dockerfile créé/modifié
- [ ] Image build réussie: `docker build -t Multi Convert .`
- [ ] Container démarre: `docker run -p 3000:3000 Multi Convert`
- [ ] Health check fonctionne

---

### ✅ Tâche 4.3: Créer Monitoring & Alertes

**Fichier:** `src/lib/monitoring.ts` (NOUVEAU)

```typescript
import * as Sentry from "@sentry/nextjs";
import { env } from '@/lib/env-validation';

export function initializeMonitoring() {
  if (!env.SENTRY_DSN) {
    console.warn('⚠️  SENTRY_DSN not configured - monitoring disabled');
    return;
  }

  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    tracesSampleRate: env.NODE_ENV === 'production' ? 0.1 : 1.0,
    replaysSessionSampleRate: 0.01,
    replaysOnErrorSampleRate: 1.0,
  });

  console.log('✅ Monitoring initialized');
}

export function captureException(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, {
    contexts: context,
  });
}

export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  Sentry.captureMessage(message, level);
}
```

**Fichier:** `src/app/api/health/route.ts` (NOUVEAU)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Vérifier la DB
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        error: 'Database connection failed',
      },
      { status: 503 }
    );
  }
}
```

**Checklist:**
- [ ] Health endpoint créé
- [ ] Monitoring initié au démarrage
- [ ] Sentry intégré
- [ ] Tests d'alerte: `captureException(new Error('test'))`

---

### ✅ Tâche 4.4: Configuration Finale & Checklists

**Fichier:** `DEPLOYMENT_CHECKLIST.md` (NOUVEAU)

```markdown
# ✅ Deployment Checklist

## Pre-Deployment (24h avant)
- [ ] Tous les tests passent
- [ ] Build prod réussie
- [ ] Zéro console.error en dev
- [ ] Variables d'env prod configurées
- [ ] Secrets générés et sauvegardes (Secrets Manager)
- [ ] SSL A+ rating vérifié
- [ ] DB backups configurés
- [ ] Runbook préparé
- [ ] On-call schedule établi
- [ ] Communication utilisateurs prête

## Deployment (Go/No-go)
- [ ] Backup DB effectué manuellement
- [ ] Smoke tests passent en staging
- [ ] Load test réussi (3000 req/s)
- [ ] Incident response plan prêt
- [ ] Team réunie et prête
- [ ] Rollback plan documenté

## Post-Deployment (1h après)
- [ ] Health checks vert
- [ ] Erreurs 5XX < 1%
- [ ] Latency < 500ms (p95)
- [ ] CPU < 70%
- [ ] Memory < 1GB
- [ ] No new Sentry errors
- [ ] Manual smoke test pass
- [ ] 1 utilisateur test complet
- [ ] Signup → Email → Verify flow
- [ ] Conversion test réussie

## Monitoring (Jour 1)
- [ ] Aucune anomalie
- [ ] User feedback positif
- [ ] Pas d'escalade sécurité
- [ ] Performance stable
- [ ] Database queries normales
```

**Checklist:**
- [ ] Toutes les tâches semaine 1-4 complétées
- [ ] Tests coverage > 80%
- [ ] Lint passe
- [ ] Build production réussit
- [ ] Docker image créée
- [ ] GitHub Actions workflow actif
- [ ] Sentry project prêt
- [ ] Monitoring endpoints testés
- [ ] Documentation API complète
- [ ] DEPLOYMENT_CHECKLIST.md créé

---

## 🎯 FINAL STATUS

### ✅ Completions Criteria

**Avant de lancer en PROD, vérifier:**

```bash
# 1. Type safety
npm run type-check
# Expected: 0 errors

# 2. Linting
npm run lint
# Expected: 0 errors

# 3. Testing
npm run test:ci
# Expected: All pass, coverage > 80%

# 4. Build
npm run build
# Expected: Build successful

# 5. Security
npm audit --audit-level=moderate
# Expected: 0 vulnerabilities

# 6. Docker
docker build -t Multi Convert . && docker run -p 3000:3000 Multi Convert
# Expected: Container starts, health check passes
```

---

## 📊 TIMELINE ESTIMÉE

| Semaine | Tâches | Effort | Status |
|---------|--------|--------|--------|
| 1 | Env + Types + CORS + Logs | 40h | 🔴 URGENT |
| 2 | Auth + Email + Rate limit | 35h | 🔴 URGENT |
| 3 | Tests + Documentation | 30h | 🟡 Important |
| 4 | CI/CD + Monitoring + Deploy | 25h | 🟡 Important |
| **TOTAL** | | **130h** | |

**Équipe requise:** 2 devs full-time (4 semaines)

---

**Vous êtes maintenant prêt pour le MONDE! 🚀**
