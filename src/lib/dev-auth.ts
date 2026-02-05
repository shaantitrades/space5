/**
 * Mode développement - Authentification sans base de données
 * À utiliser uniquement pour tester l'interface
 */

interface DevUser {
  id: string;
  email: string;
  fullName: string;
  password: string; // En clair en dev (jamais en prod!)
  emailVerified: boolean;
  createdAt: Date;
}

// Stockage en mémoire des utilisateurs dev
const devUsers: Map<string, DevUser> = new Map();

// Utilisateur de test par défaut
devUsers.set('test@multi-convert.com', {
  id: 'dev-user-1',
  email: 'test@multi-convert.com',
  fullName: 'Test User',
  password: 'Test1234!@#$',
  emailVerified: true,
  createdAt: new Date(),
});

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
