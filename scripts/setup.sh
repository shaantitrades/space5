#!/bin/bash

# Script de configuration initiale pour OMNIVERSA

echo "🚀 Configuration de OMNIVERSA..."

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Veuillez installer Node.js 20+"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Node.js version 20+ requis. Version actuelle: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) détecté"

# Installer les dépendances
echo "📦 Installation des dépendances npm..."
npm install

# Créer .env.local si n'existe pas
if [ ! -f .env.local ]; then
    echo "📝 Création du fichier .env.local..."
    cp .env.example .env.local
    echo "⚠️  Veuillez éditer .env.local avec vos clés API"
else
    echo "✅ .env.local existe déjà"
fi

# Vérifier Docker
if command -v docker &> /dev/null; then
    echo "✅ Docker détecté"
    
    # Vérifier si les conteneurs sont déjà en cours d'exécution
    if docker ps | grep -q "omniversa"; then
        echo "⚠️  Des conteneurs Docker sont déjà en cours d'exécution"
    else
        echo "🐳 Démarrage des services Docker (PostgreSQL, Redis)..."
        docker-compose up -d postgres redis
        echo "⏳ Attente du démarrage de PostgreSQL..."
        sleep 5
    fi
else
    echo "⚠️  Docker n'est pas installé. Vous devrez démarrer PostgreSQL et Redis manuellement"
fi

echo ""
echo "✅ Configuration terminée !"
echo ""
echo "Prochaines étapes :"
echo "1. Éditer .env.local avec vos clés API"
echo "2. Lancer: npm run dev"
echo "3. Ouvrir: http://localhost:3000"
echo ""
