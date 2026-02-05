# 🔐 Configuration AWS RDS PostgreSQL pour Multi Convert

## 📋 Informations de votre base de données

D'après votre console AWS RDS, voici les informations de votre instance :

- **Endpoint** : `database-1.cabkaqe8y6p4.us-east-1.rds.amazonaws.com`
- **Port** : `5432`
- **Moteur** : PostgreSQL
- **Région** : `us-east-1`
- **VPC** : `vpc-099824af344de4199`
- **Accessible publiquement** : Non (dans un VPC privé)

## 🔑 Récupérer les credentials

### Option 1 : Credentials créés lors de la création

Si vous avez créé la base de données récemment, vous devriez avoir :
- **Username** : Le nom d'utilisateur que vous avez défini (par défaut souvent `postgres` ou un nom personnalisé)
- **Password** : Le mot de passe que vous avez défini lors de la création

### Option 2 : Réinitialiser le mot de passe

Si vous avez oublié le mot de passe :

1. **Via AWS Console** :
   - Allez dans RDS > Bases de données
   - Sélectionnez `database-1`
   - Cliquez sur "Modifier" (Modify)
   - Dans "Paramètres de base de données" > "Mot de passe du maître"
   - Entrez un nouveau mot de passe
   - Appliquez les modifications immédiatement

2. **Via AWS CLI** :
   ```bash
   aws rds modify-db-instance \
     --db-instance-identifier database-1 \
     --master-user-password VotreNouveauMotDePasse \
     --apply-immediately
   ```

## 🔧 Configuration de la connexion

### Format de la DATABASE_URL

```
postgresql://[username]:[password]@[endpoint]:[port]/[database_name]
```

### Exemple avec vos informations

```env
DATABASE_URL="postgresql://postgres:VotreMotDePasse@database-1.cabkaqe8y6p4.us-east-1.rds.amazonaws.com:5432/Multi Convert"
```

## ⚠️ Important : Accessibilité publique

Votre base de données est **non accessible publiquement** (dans un VPC privé). Cela signifie :

### Option A : Modifier pour accès public (DÉVELOPPEMENT UNIQUEMENT)

1. Dans AWS Console RDS :
   - Sélectionnez `database-1`
   - Cliquez sur "Modifier"
   - Dans "Connectivité" > "Accessibilité publique"
   - Changez à **Oui** (Yes)
   - Appliquez les modifications

2. **Modifier le Security Group** :
   - Allez dans EC2 > Security Groups
   - Sélectionnez `sg-014d5a4e2e9b6c298` (le groupe de sécurité de votre DB)
   - Ajoutez une règle entrante :
     - Type : PostgreSQL
     - Port : 5432
     - Source : `0.0.0.0/0` (pour développement) ou votre IP publique

### Option B : Utiliser un tunnel SSH (RECOMMANDÉ pour production)

Si vous voulez garder la DB privée, utilisez un tunnel SSH via une instance EC2 :

```bash
# Créer un tunnel SSH via une instance EC2 dans le même VPC
ssh -L 5432:database-1.cabkaqe8y6p4.us-east-1.rds.amazonaws.com:5432 ec2-user@votre-instance-ec2.compute.amazonaws.com

# Puis dans .env.local, utilisez localhost
DATABASE_URL="postgresql://postgres:password@localhost:5432/Multi Convert"
```

### Option C : Utiliser AWS Systems Manager Session Manager

Pour un accès sécurisé sans SSH :

```bash
aws rds start-db-instance --db-instance-identifier database-1
aws ssm start-session --target i-xxxxx --document-name AWS-StartPortForwardingSession --parameters '{"portNumber":["5432"],"localPortNumber":["5432"]}'
```

## 📝 Mise à jour de .env.local

Mettez à jour votre fichier `.env.local` :

```env
# Database AWS RDS
DATABASE_URL="postgresql://[USERNAME]:[PASSWORD]@database-1.cabkaqe8y6p4.us-east-1.rds.amazonaws.com:5432/Multi Convert"
```

Remplacez :
- `[USERNAME]` : Votre nom d'utilisateur PostgreSQL
- `[PASSWORD]` : Votre mot de passe PostgreSQL
- `Multi Convert` : Le nom de la base de données (créez-la si elle n'existe pas)

## 🗄️ Créer la base de données

Si la base `Multi Convert` n'existe pas encore :

### Via psql (si accessible)

```bash
# Se connecter à l'instance RDS
psql -h database-1.cabkaqe8y6p4.us-east-1.rds.amazonaws.com -U postgres -d postgres

# Créer la base de données
CREATE DATABASE Multi Convert;

# Créer un utilisateur dédié (optionnel mais recommandé)
CREATE USER Multi Convert_user WITH PASSWORD 'votre_mot_de_passe_securise';
GRANT ALL PRIVILEGES ON DATABASE Multi Convert TO Multi Convert_user;
```

### Via AWS RDS Query Editor

1. Allez dans RDS > Query Editor
2. Connectez-vous à votre instance
3. Exécutez :
   ```sql
   CREATE DATABASE Multi Convert;
   ```

## 🔒 Sécurité recommandée

1. **Ne jamais commiter `.env.local`** (déjà dans `.gitignore`)
2. **Utiliser AWS Secrets Manager** pour stocker les credentials en production
3. **Activer SSL** pour les connexions :
   ```env
   DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
   ```
4. **Utiliser IAM Database Authentication** (optionnel mais recommandé)

## ✅ Tester la connexion

```bash
# Avec psql
psql "postgresql://postgres:password@database-1.cabkaqe8y6p4.us-east-1.rds.amazonaws.com:5432/Multi Convert"

# Ou avec Node.js
node -e "require('pg').Client({connectionString: process.env.DATABASE_URL}).connect().then(() => console.log('✅ Connexion réussie')).catch(e => console.error('❌ Erreur:', e.message))"
```

## 🚀 Initialiser le schéma

Une fois connecté, initialisez le schéma :

```bash
# Via psql
psql "postgresql://postgres:password@database-1.cabkaqe8y6p4.us-east-1.rds.amazonaws.com:5432/Multi Convert" -f scripts/init-db.sql

# Ou via npm
npm run db:init
```

---

**Besoin d'aide ?** Consultez la [documentation AWS RDS](https://docs.aws.amazon.com/rds/latest/UserGuide/CHAP_GettingStarted.CreatingConnecting.PostgreSQL.html)
