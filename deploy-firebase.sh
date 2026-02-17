#!/bin/bash

# Script de déploiement Firebase Hosting
# Prérequis: Firebase CLI installée et authentifiée

echo "🚀 Déploiement Firebase Hosting"

# Vérifier si Firebase CLI est installée
echo "Vérification de Firebase CLI..."
firebase --version

if [ $? -ne 0 ]; then
    echo "❌ Firebase CLI n'est pas installée"
    echo "Installez-la avec: npm install -g firebase-tools"
    exit 1
fi

# Étape 1: Nettoyer les builds précédents
echo ""
echo "📁 Nettoyage des builds précédents..."
rm -rf .next
rm -rf .firebase

# Étape 2: Construire l'application
echo ""
echo "🔨 Construction de l'application Next.js..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ La construction a échoué"
    exit 1
fi

# Étape 3: Déployer sur Firebase
echo ""
echo "📤 Déploiement sur Firebase Hosting..."
firebase deploy --only hosting

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Déploiement réussi!"
    echo "Votre application est disponible sur votre URL Firebase"
else
    echo ""
    echo "❌ Le déploiement a échoué"
    exit 1
fi
