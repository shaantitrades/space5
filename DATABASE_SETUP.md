# 🗄️ Configuration de la Base de Données Multi Convert

## ✅ Prérequis

- ✅ Base de données PostgreSQL AWS RDS créée (database-1)
- ✅ `DATABASE_URL` configuré dans `.env.local`
- ✅ Node.js et npm installés

## 🚀 Installation Rapide

### Option 1 : Script automatique (Recommandé)

```powershell
.\scripts\setup-database.ps1
```

### Option 2 : Commandes manuelles

```powershell
# 1. Installer Prisma
npm install

# 2. Générer le client Prisma
npm run db:generate

# 3. Créer les tables dans la base de données
npm run db:push

# 4. (Optionnel) Ouvrir Prisma Studio pour visualiser les données
npm run db:studio
```

## 📊 Structure de la Base de Données

### Tables créées

1. **users** - Utilisateurs et authentification
   - Plan (STARTER, PROFESSIONAL, BUSINESS, ENTERPRISE)
   - Crédits disponibles
   - Conversions ce mois-ci

2. **conversions** - Historique des conversions
   - Fichiers input/output
   - Statut (PENDING, PROCESSING, COMPLETED, FAILED)
   - Suppression automatique selon le plan

3. **credit_packs** - Achats de crédits
   - Montant de crédits
   - Prix payé
   - Date d'expiration (12 mois)

4. **subscriptions** - Abonnements actifs
   - Plan souscrit
   - Limites mensuelles
   - Période de facturation

5. **api_keys** - Clés API des utilisateurs
   - Hash sécurisé
   - Dernière utilisation

6. **security_events** - Logs de sécurité
   - Type d'événement
   - IP, User-Agent, Pays

## 🔐 Configuration AWS RDS

Votre `DATABASE_URL` doit être au format :

```
DATABASE_URL="postgresql://USER:PASSWORD@ENDPOINT:5432/DATABASE_NAME"
```

Exemple :
```
DATABASE_URL="postgresql://postgres:mypassword@database-1.cabkaqe8y6p4.us-east-1.rds.amazonaws.com:5432/Multi Convert"
```

## 📝 Commandes Prisma Utiles

```powershell
# Générer le client après modification du schéma
npm run db:generate

# Pousser les changements vers la base (développement)
npm run db:push

# Créer une migration (production)
npm run db:migrate

# Ouvrir l'interface graphique
npm run db:studio

# Réinitialiser la base (⚠️ SUPPRIME TOUTES LES DONNÉES)
npx prisma migrate reset
```

## 🔄 Migrations

### Créer une nouvelle migration

Après avoir modifié `prisma/schema.prisma` :

```powershell
npm run db:migrate
```

Cela va :
1. Créer un fichier de migration SQL
2. Appliquer les changements à la base
3. Régénérer le client Prisma

## 🧪 Tester la Connexion

```javascript
// Test rapide dans Node.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const userCount = await prisma.user.count();
  console.log(`Nombre d'utilisateurs: ${userCount}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

## 📦 Données de Test (Optionnel)

Créez un fichier `prisma/seed.ts` :

```typescript
import { PrismaClient, Plan } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Créer un utilisateur de test
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const user = await prisma.user.create({
    data: {
      email: 'test@Multi Convert.com',
      passwordHash: hashedPassword,
      name: 'Test User',
      plan: Plan.PROFESSIONAL,
      credits: 50,
    },
  });

  console.log('✅ Utilisateur de test créé:', user.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Puis exécutez :
```powershell
npx ts-node prisma/seed.ts
```

## 🔍 Prisma Studio

Pour visualiser et éditer vos données graphiquement :

```powershell
npm run db:studio
```

Ouvre une interface web sur `http://localhost:5555`

## ⚠️ Sécurité

1. **Ne commitez JAMAIS** votre `DATABASE_URL` dans Git
2. Utilisez des **variables d'environnement**
3. Activez **SSL** pour la connexion RDS (ajoutez `?sslmode=require`)
4. Créez des **sauvegardes régulières** sur AWS RDS
5. Limitez les **accès IP** dans le Security Group

## 🆘 Dépannage

### Erreur : "Can't reach database server"

1. Vérifiez que le Security Group AWS autorise votre IP
2. Vérifiez que `DATABASE_URL` est correct dans `.env.local`
3. Testez avec : `npm run db:test`

### Erreur : "Schema validation error"

```powershell
# Régénérer le client
npm run db:generate
```

### Erreur : "Migration failed"

```powershell
# Forcer la synchronisation (développement uniquement)
npm run db:push -- --accept-data-loss
```

## 📚 Ressources

- [Documentation Prisma](https://www.prisma.io/docs)
- [AWS RDS PostgreSQL](https://aws.amazon.com/rds/postgresql/)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)

## ✅ Checklist de Configuration

- [ ] PostgreSQL RDS créé sur AWS
- [ ] Security Group configuré (port 5432)
- [ ] `DATABASE_URL` ajouté à `.env.local`
- [ ] Prisma installé (`npm install`)
- [ ] Client généré (`npm run db:generate`)
- [ ] Tables créées (`npm run db:push`)
- [ ] Connexion testée (`npm run db:studio`)
- [ ] Données de test créées (optionnel)

---

**🎉 Une fois ces étapes terminées, votre base de données est prête pour Multi Convert !**
