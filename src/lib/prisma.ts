import { PrismaClient } from '@prisma/client';

const isDevMode = process.env.DEV_MODE === 'true' || process.env.SKIP_DB === 'true';

// Mock Prisma pour le mode dev (pas de DB réelle)
function createMockPrisma(): any {
  const handler: ProxyHandler<any> = {
    get(_target, prop) {
      // Retourne un proxy pour chaque modèle (user, conversion, etc.)
      if (typeof prop === 'string' && prop !== 'then' && prop !== '$connect' && prop !== '$disconnect') {
        if (prop === '$connect' || prop === '$disconnect') {
          return async () => {};
        }
        return new Proxy({}, {
          get(_t, method) {
            // Toutes les méthodes retournent des valeurs vides
            return async (..._args: any[]) => {
              if (method === 'findMany') return [];
              if (method === 'findFirst' || method === 'findUnique') return null;
              if (method === 'count') return 0;
              if (method === 'create') return { id: `dev-${Date.now()}` };
              if (method === 'update') return { id: `dev-${Date.now()}` };
              if (method === 'updateMany') return { count: 1 };
              if (method === 'upsert') return { id: `dev-${Date.now()}` };
              if (method === 'delete') return {};
              if (method === 'deleteMany') return { count: 0 };
              return null;
            };
          },
        });
      }
      return undefined;
    },
  };
  
  return new Proxy({}, handler);
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let prismaInstance: any;

if (isDevMode) {
  console.log('🔧 [DEV MODE] Utilisation du mock Prisma (pas de connexion DB)');
  prismaInstance = createMockPrisma();
} else {
  prismaInstance = globalForPrisma.prisma ??
    new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  
  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prismaInstance;
}

export const prisma = prismaInstance as PrismaClient;
export default prisma;
