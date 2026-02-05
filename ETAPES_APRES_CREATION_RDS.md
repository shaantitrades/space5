# ✅ Étapes Après la Création de votre Base RDS

## 📋 Checklist Post-Création

### Étape 1 : Récupérer les Credentials

#### Si vous avez choisi "Générer automatiquement un mot de passe" :

1. Après la création, allez dans **RDS > Bases de données** > `database-1`
2. Cliquez sur l'onglet **"Configuration"**
3. Cherchez **"Informations d'identification"** ou **"Master username"**
4. Le mot de passe sera affiché UNE SEULE FOIS lors de la création
5. **⚠️ IMPORTANT** : Si vous l'avez perdu, vous devrez le réinitialiser

#### Si vous avez choisi AWS Secrets Manager :

1. Allez dans **AWS Secrets Manager**
2. Cherchez le secret associé à `database-1`
3. Cliquez sur **"Récupérer la valeur secrète"**
4. Copiez le username et password

#### Si vous avez défini votre propre mot de passe :

- Utilisez le mot de passe que vous avez défini

### Étape 2 : Vérifier l'Accessibilité Publique

1. Allez dans **RDS > Bases de données** > `database-1`
2. Cliquez sur l'onglet **"Connectivité et sécurité"**
3. Vérifiez **"Accessible publiquement"** :
   - Si **"Non"** → Cliquez sur **"Modifier"** et changez à **"Oui"**
   - Si **"Oui"** → ✅ Parfait, continuez

### Étape 3 : Configurer le Security Group

1. Allez dans **EC2 > Security Groups**
2. Trouvez le Security Group associé à votre DB (probablement `default` ou `sg-014d5a4e2e9b6c298`)
3. Onglet **"Règles entrantes"** (Inbound rules)
4. Cliquez sur **"Modifier les règles entrantes"**
5. Cliquez sur **"Ajouter une règle"**
6. Configurez :
   - **Type** : PostgreSQL
   - **Port** : 5432
   - **Source** : 
     - Pour développement : `0.0.0.0/0` (tous les IPs)
     - Pour sécurité : Votre IP publique uniquement (`VOTRE_IP/32`)
   - **Description** : "Accès PostgreSQL pour Multi Convert"
7. Cliquez sur **"Enregistrer les règles"**

### Étape 4 : Récupérer l'Endpoint

1. Dans **RDS > Bases de données** > `database-1`
2. Onglet **"Connectivité et sécurité"**
3. Copiez le **"Point de terminaison"** (Endpoint)
   - Exemple : `database-1.cabkaqe8y6p4.us-east-1.rds.amazonaws.com`
4. Notez le **Port** : `5432`

### Étape 5 : Créer la Base de Données "Multi Convert"

#### Option A : Via AWS RDS Query Editor (Recommandé)

1. Allez dans **RDS > Query Editor**
2. Cliquez sur **"Se connecter à la base de données"**
3. Sélectionnez votre instance `database-1`
4. Entrez :
   - **Username** : `postgres` (ou celui que vous avez défini)
   - **Password** : Votre mot de passe
5. Cliquez sur **"Se connecter"**
6. Dans l'éditeur SQL, exécutez :
   ```sql
   CREATE DATABASE Multi Convert;
   ```
7. Cliquez sur **"Exécuter"**

#### Option B : Via psql (si installé)

```bash
psql -h database-1.cabkaqe8y6p4.us-east-1.rds.amazonaws.com -U postgres -d postgres

# Dans psql :
CREATE DATABASE Multi Convert;
\q
```

### Étape 6 : Configurer .env.local

Éditez votre fichier `.env.local` :

```env
DATABASE_URL="postgresql://postgres:VotreMotDePasse@database-1.cabkaqe8y6p4.us-east-1.rds.amazonaws.com:5432/Multi Convert"
```

**Remplacez :**
- `postgres` : Votre username (généralement `postgres`)
- `VotreMotDePasse` : Le mot de passe que vous avez défini/récupéré
- `database-1.cabkaqe8y6p4.us-east-1.rds.amazonaws.com` : Votre endpoint RDS
- `Multi Convert` : Nom de la base de données créée

### Étape 7 : Tester la Connexion

```bash
npm run db:test
```

**Résultat attendu :**
```
✅ Connexion réussie !
📊 Informations de la base de données:
   Version: PostgreSQL 17.6
   Base de données: Multi Convert
   Utilisateur: postgres
```

### Étape 8 : Initialiser le Schéma

Une fois la connexion testée avec succès :

```bash
npm run db:init
```

Ou manuellement :

```bash
psql "postgresql://postgres:password@database-1.cabkaqe8y6p4.us-east-1.rds.amazonaws.com:5432/Multi Convert" -f scripts/init-db.sql
```

## 🐛 Dépannage

### Erreur : "Connection refused"

**Solutions :**
1. Vérifiez que "Accessibilité publique" est sur "Oui"
2. Vérifiez que le Security Group autorise le port 5432
3. Vérifiez que votre IP est autorisée (si vous avez utilisé Option B)

### Erreur : "Password authentication failed"

**Solutions :**
1. Vérifiez le username (généralement `postgres`)
2. Vérifiez le mot de passe (attention aux caractères spéciaux)
3. Si perdu, réinitialisez-le dans RDS Console

### Erreur : "Database does not exist"

**Solutions :**
1. Créez la base avec `CREATE DATABASE Multi Convert;`
2. Vérifiez que vous utilisez le bon nom dans `DATABASE_URL`

## 📊 Informations à Noter

Après la création, notez ces informations :

- ✅ **Endpoint** : `database-1.xxxxx.us-east-1.rds.amazonaws.com`
- ✅ **Port** : `5432`
- ✅ **Username** : `postgres` (ou celui défini)
- ✅ **Password** : `VotreMotDePasse`
- ✅ **Database** : `Multi Convert`

---

**Besoin d'aide ?** Consultez `GUIDE_CONNEXION_RDS.md` pour plus de détails.
