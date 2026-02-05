# 🔐 Guide Complet - Configuration AWS RDS pour Multi Convert

## 📋 Informations de votre base de données

- **Endpoint** : `database-1.cabkaqe8y6p4.us-east-1.rds.amazonaws.com`
- **Port** : `5432`
- **Moteur** : PostgreSQL
- **Région** : `us-east-1`
- **Accessible publiquement** : ❌ Non (dans un VPC privé)

## 🔑 Étape 1 : Récupérer les Credentials

### Si vous vous souvenez du mot de passe

Utilisez le username et password que vous avez définis lors de la création.

### Si vous avez oublié le mot de passe

**Réinitialiser via AWS Console :**

1. Allez dans **RDS > Bases de données**
2. Sélectionnez `database-1`
3. Cliquez sur **"Modifier"** (Modify)
4. Dans **"Paramètres de base de données"** > **"Mot de passe du maître"**
5. Entrez un nouveau mot de passe sécurisé
6. Cochez **"Appliquer immédiatement"**
7. Cliquez sur **"Continuer"** puis **"Modifier la base de données"**
8. ⏳ Attendez 2-5 minutes que la modification soit appliquée

## 🌐 Étape 2 : Rendre la base accessible publiquement (DÉVELOPPEMENT)

⚠️ **ATTENTION** : Cette étape est pour le développement uniquement. En production, utilisez un tunnel SSH.

### 2.1 Modifier l'accessibilité publique

1. Dans **RDS > Bases de données** > `database-1`
2. Cliquez sur **"Modifier"**
3. Section **"Connectivité"**
4. **"Accessibilité publique"** : Changez à **"Oui"** (Yes)
5. Cliquez sur **"Continuer"** puis **"Modifier la base de données"**

### 2.2 Configurer le Security Group

1. Allez dans **EC2 > Security Groups**
2. Sélectionnez le Security Group de votre DB : `sg-014d5a4e2e9b6c298`
3. Onglet **"Règles entrantes"** (Inbound rules)
4. Cliquez sur **"Modifier les règles entrantes"** (Edit inbound rules)
5. Ajoutez une nouvelle règle :
   - **Type** : PostgreSQL
   - **Port** : 5432
   - **Source** : 
     - Pour développement : `0.0.0.0/0` (tous les IPs)
     - Pour sécurité : Votre IP publique uniquement
   - **Description** : "Accès PostgreSQL pour Multi Convert"
6. Cliquez sur **"Enregistrer les règles"**

## 🔧 Étape 3 : Configurer DATABASE_URL

### Option A : Utiliser le script PowerShell (Recommandé)

```powershell
.\scripts\update-rds-config.ps1 -Username "postgres" -Password "VotreMotDePasse"
```

### Option B : Éditer manuellement .env.local

Ouvrez `.env.local` et modifiez la ligne `DATABASE_URL` :

```env
DATABASE_URL="postgresql://postgres:VotreMotDePasse@database-1.cabkaqe8y6p4.us-east-1.rds.amazonaws.com:5432/Multi Convert"
```

**Remplacez :**
- `postgres` : Votre nom d'utilisateur PostgreSQL
- `VotreMotDePasse` : Votre mot de passe PostgreSQL
- `Multi Convert` : Nom de la base de données (créez-la si elle n'existe pas)

## 🗄️ Étape 4 : Créer la base de données "Multi Convert"

### Option A : Via AWS RDS Query Editor

1. Allez dans **RDS > Query Editor**
2. Connectez-vous à votre instance `database-1`
3. Exécutez :
   ```sql
   CREATE DATABASE Multi Convert;
   ```

### Option B : Via psql (si accessible)

```bash
# Installer psql si nécessaire
# Windows: https://www.postgresql.org/download/windows/
# Mac: brew install postgresql
# Linux: sudo apt-get install postgresql-client

# Se connecter
psql -h database-1.cabkaqe8y6p4.us-east-1.rds.amazonaws.com -U postgres -d postgres

# Créer la base de données
CREATE DATABASE Multi Convert;

# Quitter
\q
```

## ✅ Étape 5 : Tester la connexion

```bash
npm run db:test
```

Ce script va :
- ✅ Tester la connexion à votre base RDS
- ✅ Vérifier que la base "Multi Convert" existe
- ✅ Afficher les informations de connexion

## 🚀 Étape 6 : Initialiser le schéma

Une fois la connexion testée avec succès :

```bash
npm run db:init
```

Ou manuellement avec psql :

```bash
psql "postgresql://postgres:password@database-1.cabkaqe8y6p4.us-east-1.rds.amazonaws.com:5432/Multi Convert" -f scripts/init-db.sql
```

## 🔒 Sécurité Recommandée

### Pour le développement

1. ✅ Utilisez un mot de passe fort
2. ✅ Limitez l'accès au Security Group à votre IP uniquement
3. ✅ Activez SSL dans la connexion :
   ```env
   DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
   ```

### Pour la production

1. ✅ **Ne jamais** rendre la DB accessible publiquement
2. ✅ Utilisez un tunnel SSH via EC2
3. ✅ Utilisez AWS Secrets Manager pour les credentials
4. ✅ Activez IAM Database Authentication
5. ✅ Utilisez VPC Peering ou PrivateLink

## 🐛 Dépannage

### Erreur : "Connection refused"

**Cause** : La base n'est pas accessible publiquement ou le Security Group bloque l'accès.

**Solution** :
1. Vérifiez que "Accessibilité publique" est sur "Oui"
2. Vérifiez les règles du Security Group (port 5432 ouvert)

### Erreur : "Password authentication failed"

**Cause** : Mauvais username ou password.

**Solution** :
1. Réinitialisez le mot de passe dans AWS Console
2. Attendez que la modification soit appliquée
3. Mettez à jour `.env.local`

### Erreur : "Database does not exist"

**Cause** : La base "Multi Convert" n'existe pas.

**Solution** :
1. Créez la base avec `CREATE DATABASE Multi Convert;`
2. Ou utilisez une base existante dans `DATABASE_URL`

### Erreur : "Connection timeout"

**Cause** : Le Security Group bloque votre IP.

**Solution** :
1. Ajoutez votre IP publique au Security Group
2. Vérifiez votre IP : https://whatismyipaddress.com/

## 📚 Ressources

- [Documentation AWS RDS PostgreSQL](https://docs.aws.amazon.com/rds/latest/UserGuide/CHAP_GettingStarted.CreatingConnecting.PostgreSQL.html)
- [Guide de sécurité RDS](https://docs.aws.amazon.com/rds/latest/UserGuide/UsingWithRDS.html)
- [Scripts de configuration](./scripts/)

---

**Besoin d'aide ?** Consultez `docs/AWS_RDS_SETUP.md` pour plus de détails.
