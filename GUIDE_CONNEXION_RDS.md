# 🚀 Guide : Connecter Multi Convert à AWS RDS (SANS EC2)

## ❌ Vous N'AVEZ PAS besoin de créer une instance EC2 !

Pour le développement local, vous pouvez connecter directement votre application Next.js à RDS depuis votre machine Windows.

## ✅ Solution Simple : Rendre la DB Accessible Publiquement

### Étape 1 : Annuler cette page EC2

1. Cliquez sur **"Annuler"** (Cancel) sur la page EC2
2. Retournez à la page de votre base de données `database-1`

### Étape 2 : Rendre la base accessible publiquement

1. Dans **RDS > Bases de données** > Sélectionnez `database-1`
2. Cliquez sur **"Modifier"** (Modify)
3. Section **"Connectivité"** :
   - **"Accessibilité publique"** : Changez à **"Oui"** (Yes)
   - **"Sous-réseau de disponibilité"** : Gardez la valeur par défaut
4. Cliquez sur **"Continuer"** en bas de la page
5. Dans la page de révision, cochez **"Appliquer immédiatement"**
6. Cliquez sur **"Modifier la base de données"**
7. ⏳ Attendez 2-5 minutes que la modification soit appliquée

### Étape 3 : Configurer le Security Group

1. Allez dans **EC2 > Security Groups**
2. Sélectionnez le Security Group de votre DB : `sg-014d5a4e2e9b6c298`
3. Onglet **"Règles entrantes"** (Inbound rules)
4. Cliquez sur **"Modifier les règles entrantes"** (Edit inbound rules)
5. Cliquez sur **"Ajouter une règle"** (Add rule)
6. Configurez la nouvelle règle :
   - **Type** : PostgreSQL
   - **Port** : 5432
   - **Source** : 
     - Option A (Développement) : `0.0.0.0/0` (tous les IPs)
     - Option B (Sécurisé) : Votre IP publique uniquement
   - **Description** : "Accès PostgreSQL pour Multi Convert développement"
7. Cliquez sur **"Enregistrer les règles"** (Save rules)

### Étape 4 : Trouver votre IP publique (Option B)

Si vous choisissez l'option B (plus sécurisé) :

1. Allez sur : https://whatismyipaddress.com/
2. Copiez votre **IPv4 Address**
3. Dans le Security Group, utilisez : `VOTRE_IP/32`

Exemple : Si votre IP est `123.45.67.89`, utilisez `123.45.67.89/32`

### Étape 5 : Configurer .env.local

Éditez votre fichier `.env.local` :

```env
DATABASE_URL="postgresql://postgres:VotreMotDePasse@database-1.cabkaqe8y6p4.us-east-1.rds.amazonaws.com:5432/Multi Convert"
```

**Remplacez :**
- `postgres` : Votre username PostgreSQL (généralement `postgres`)
- `VotreMotDePasse` : Le mot de passe que vous avez défini
- `Multi Convert` : Nom de la base de données (créez-la si nécessaire)

### Étape 6 : Créer la base de données "Multi Convert"

#### Option A : Via AWS RDS Query Editor

1. Allez dans **RDS > Query Editor**
2. Cliquez sur **"Se connecter à la base de données"**
3. Sélectionnez votre instance `database-1`
4. Entrez votre username et password
5. Cliquez sur **"Se connecter"**
6. Dans l'éditeur, exécutez :
   ```sql
   CREATE DATABASE Multi Convert;
   ```

#### Option B : Via psql (si installé)

```bash
psql -h database-1.cabkaqe8y6p4.us-east-1.rds.amazonaws.com -U postgres -d postgres

# Dans psql :
CREATE DATABASE Multi Convert;
\q
```

### Étape 7 : Tester la connexion

```bash
npm run db:test
```

Si tout fonctionne, vous verrez :
```
✅ Connexion réussie !
📊 Informations de la base de données:
   Version: PostgreSQL 15.x
   Base de données: Multi Convert
   Utilisateur: postgres
```

### Étape 8 : Initialiser le schéma

```bash
npm run db:init
```

## 🔒 Sécurité

### Pour le développement local

✅ **Acceptable** :
- Rendre la DB accessible publiquement
- Autoriser votre IP uniquement dans le Security Group
- Utiliser un mot de passe fort

### Pour la production

❌ **Ne JAMAIS** :
- Rendre la DB accessible publiquement
- Utiliser `0.0.0.0/0` dans le Security Group

✅ **Recommandé** :
- Garder la DB dans un VPC privé
- Utiliser un tunnel SSH via EC2
- Utiliser AWS Secrets Manager
- Utiliser IAM Database Authentication

## 🐛 Dépannage

### Erreur : "Connection refused"

**Vérifiez :**
1. ✅ La DB est accessible publiquement (Oui)
2. ✅ Le Security Group autorise le port 5432
3. ✅ Votre IP est autorisée (si vous avez utilisé Option B)

### Erreur : "Password authentication failed"

**Solution :**
1. Réinitialisez le mot de passe dans RDS Console
2. Attendez que la modification soit appliquée
3. Mettez à jour `.env.local`

### Erreur : "Database does not exist"

**Solution :**
1. Créez la base avec `CREATE DATABASE Multi Convert;`
2. Ou utilisez une base existante dans `DATABASE_URL`

## 📊 Résumé

| Méthode | Complexité | Sécurité | Recommandé pour |
|---------|------------|----------|-----------------|
| **DB Publique** | ⭐ Simple | ⚠️ Moyenne | Développement |
| **Tunnel SSH via EC2** | ⭐⭐⭐ Complexe | ✅ Haute | Production |
| **VPC Peering** | ⭐⭐ Moyenne | ✅ Haute | Production |

**Pour commencer rapidement : Utilisez la DB Publique !** 🚀

---

**Besoin d'aide ?** Consultez `GUIDE_AWS_RDS.md` pour plus de détails.
