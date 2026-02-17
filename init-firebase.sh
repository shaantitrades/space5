#!/bin/bash

# Script d'initialisation Firebase
# Usage: ./init-firebase.sh PROJECT_ID

PROJECT_ID="$1"

echo "🔥 Configuration Firebase Hosting"

# Vérifier si Firebase CLI est installée
echo ""
echo "Vérification de Firebase CLI..."
firebase --version

if [ $? -ne 0 ]; then
    echo "❌ Firebase CLI n'est pas installée"
    echo "Installation de Firebase CLI..."
    npm install -g firebase-tools
fi

# Demander le Project ID si non fourni
if [ -z "$PROJECT_ID" ]; then
    echo ""
    echo "📋 Allez sur: https://console.firebase.google.com"
    echo "Créez un nouveau projet ou sélectionnez un existant"
    read -p "Entrez votre ID de projet Firebase: " PROJECT_ID
fi

# Créer/mettre à jour .firebaserc
echo ""
echo "⚙️ Configuration du fichier .firebaserc..."

cat > .firebaserc << EOF
{
  "projects": {
    "default": "$PROJECT_ID"
  }
}
EOF

echo "✅ .firebaserc créé avec le projet: $PROJECT_ID"

# Vérifier la structure du projet
echo ""
echo "📁 Vérification de la structure du projet..."

if [ ! -f "firebase.json" ]; then
    echo "⚠️ firebase.json non trouvé"
    echo "Création de firebase.json..."
fi

if [ ! -f "next.config.js" ]; then
    echo "❌ next.config.js non trouvé"
    echo "Ce n'est pas un projet Next.js valide"
    exit 1
fi

echo "✅ Structure du projet vérifiée"

# Authentification Firebase
echo ""
echo "🔐 Authentification Firebase..."
echo "Un navigateur va s'ouvrir pour vous connecter"
echo ""

firebase login

if [ $? -eq 0 ]; then
    echo "✅ Authentification réussie"
else
    echo "❌ Authentification échouée"
    exit 1
fi

# Afficher les commandes disponibles
echo ""
echo "✨ Configuration terminée!"
echo ""
echo "📖 Commandes disponibles:"
echo "  npm run build           - Construire l'application"
echo "  npm run firebase:deploy - Déployer sur Firebase Hosting"
echo "  ./deploy-firebase.sh    - Script de déploiement (optionnel)"
echo "  firebase hosting:sites:list - Voir les sites déployés"
echo ""
echo "🚀 Pour déployer maintenant:"
echo "  npm run firebase:deploy"
