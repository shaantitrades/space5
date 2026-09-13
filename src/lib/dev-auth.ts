/**
 * Mode développement - Authentification sans base de données
 * À utiliser uniquement pour tester l'interface
 *
 * Les comptes créés sont persistés dans `.dev-users.json` afin de survivre
 * aux redémarrages du serveur et aux rechargements à chaud (HMR) de Next.js.
 */

import fs from 'fs';
import path from 'path';

interface DevUser {
  id: string;
  email: string;
  fullName: string;
  password: string; // En clair en dev (jamais en prod!)
  emailVerified: boolean;
  createdAt: Date;
}

// Fichier de persistance (à la racine du projet)
const DEV_USERS_FILE = path.join(process.cwd(), '.dev-users.json');

// Utilisateur de test par défaut (recréé à chaque démarrage)
const DEFAULT_DEV_USERS: Array<Omit<DevUser, 'createdAt'>> = [
  {
    id: 'dev-user-1',
    email: 'test@multi-convert.com',
    fullName: 'Test User',
    password: 'Test1234!@#$',
    emailVerified: true,
  },
];

function makeDefaultUsers(): Map<string, DevUser> {
  const users = new Map<string, DevUser>();
  for (const u of DEFAULT_DEV_USERS) {
    users.set(u.email, { ...u, createdAt: new Date() });
  }
  return users;
}

function loadDevUsers(): Map<string, DevUser> {
  const users = makeDefaultUsers();

  try {
    const raw = fs.readFileSync(DEV_USERS_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      for (const u of parsed) {
        if (u && typeof u.email === 'string' && typeof u.password === 'string') {
          const email = u.email.toLowerCase();
          // Ne pas écraser le compte de test par défaut
          if (DEFAULT_DEV_USERS.some((d) => d.email === email)) continue;
          users.set(email, {
            id: String(u.id ?? `dev-${Date.now()}`),
            email,
            fullName: String(u.fullName ?? 'Dev User'),
            password: u.password,
            emailVerified: Boolean(u.emailVerified ?? true),
            createdAt: u.createdAt ? new Date(u.createdAt) : new Date(),
          });
        }
      }
    }
  } catch {
    // Fichier absent ou illisible → on garde uniquement le compte de test
  }

  return users;
}

function persistDevUsers(users: Map<string, DevUser>): void {
  try {
    const list = Array.from(users.values()).filter(
      (u) => !DEFAULT_DEV_USERS.some((d) => d.email === u.email)
    );
    fs.writeFileSync(DEV_USERS_FILE, JSON.stringify(list, null, 2), 'utf8');
  } catch {
    // Écriture impossible → on continue en mémoire uniquement
  }
}

// `globalThis` garantit que la Map survit au HMR (rechargement des modules)
const globalForDevAuth = globalThis as unknown as {
  __devAuthUsers?: Map<string, DevUser>;
};

const devUsers: Map<string, DevUser> =
  globalForDevAuth.__devAuthUsers ?? loadDevUsers();
globalForDevAuth.__devAuthUsers = devUsers;

export const DevAuth = {
  /**
   * Créer un utilisateur dev
   */
  createUser: (email: string, fullName: string, password: string): DevUser => {
    const user: DevUser = {
      id: `dev-${Date.now()}`,
      email: email.toLowerCase(),
      fullName,
      password, // En clair en dev seulement!
      emailVerified: true, // Auto-vérifié en mode dev
      createdAt: new Date(),
    };

    devUsers.set(user.email, user);
    persistDevUsers(devUsers);
    console.log('👤 [DEV] Utilisateur créé:', user.email);
    return user;
  },

  /**
   * Trouver un utilisateur par email
   */
  findByEmail: (email: string): DevUser | undefined => {
    return devUsers.get(email.toLowerCase());
  },

  /**
   * Vérifier les identifiants
   */
  verifyCredentials: (email: string, password: string): DevUser | null => {
    const user = devUsers.get(email.toLowerCase());
    if (!user) return null;

    // Comparaison simple en mode dev
    if (user.password === password) {
      console.log('✅ [DEV] Login réussi:', email);
      return user;
    }

    console.log('❌ [DEV] Mot de passe incorrect:', email);
    return null;
  },

  /**
   * Lister tous les utilisateurs dev
   */
  listUsers: (): DevUser[] => {
    return Array.from(devUsers.values());
  },

  /**
   * Réinitialiser (pour tests)
   */
  reset: (): void => {
    devUsers.clear();
    persistDevUsers(devUsers);
    console.log('🔄 [DEV] Utilisateurs réinitialisés');
  },
};

/**
 * Vérifier si on est en mode dev
 */
export const isDevMode = (): boolean => {
  return process.env.DEV_MODE === 'true' || process.env.SKIP_DB === 'true';
};

/**
 * Token JWT simple pour le mode dev
 */
export const createDevToken = (user: DevUser): string => {
  // En mode dev, on encode juste les données en base64
  const payload = {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    iat: Date.now(),
  };

  return Buffer.from(JSON.stringify(payload)).toString('base64');
};

export const verifyDevToken = (token: string): any => {
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString());
    return payload;
  } catch {
    return null;
  }
};
