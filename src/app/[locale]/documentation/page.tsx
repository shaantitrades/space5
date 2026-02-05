'use client';

import { useState } from 'react';
import { Code, Copy, Check, Key, Zap, Shield, Book } from 'lucide-react';
import { BackButton } from '@/components/ui/back-button';

export default function DocumentationPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const codeExamples = {
    curl: `curl -X POST https://api.omniversa.com/v1/convert \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -F "file=@document.pdf" \\
  -F "output_format=docx"`,
    
    javascript: `const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');

const form = new FormData();
form.append('file', fs.createReadStream('document.pdf'));
form.append('output_format', 'docx');

const response = await axios.post(
  'https://api.omniversa.com/v1/convert',
  form,
  {
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      ...form.getHeaders()
    }
  }
);`,
    
    python: `import requests

url = "https://api.omniversa.com/v1/convert"
headers = {"Authorization": "Bearer YOUR_API_KEY"}
files = {"file": open("document.pdf", "rb")}
data = {"output_format": "docx"}

response = requests.post(url, headers=headers, files=files, data=data)
print(response.json())`,
    
    php: `<?php
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "https://api.omniversa.com/v1/convert");
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer YOUR_API_KEY"
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, [
    "file" => new CURLFile("document.pdf"),
    "output_format" => "docx"
]);
$response = curl_exec($ch);
curl_close($ch);
?>`,
  };

  const endpoints = [
    {
      method: 'POST',
      path: '/v1/convert',
      description: 'Convertir un fichier',
      params: ['file (required)', 'output_format (required)', 'options (optional)'],
    },
    {
      method: 'GET',
      path: '/v1/conversions',
      description: 'Liste des conversions',
      params: ['page', 'limit', 'status'],
    },
    {
      method: 'GET',
      path: '/v1/conversions/:id',
      description: 'Détails d\'une conversion',
      params: ['id (required)'],
    },
    {
      method: 'DELETE',
      path: '/v1/conversions/:id',
      description: 'Supprimer une conversion',
      params: ['id (required)'],
    },
    {
      method: 'GET',
      path: '/v1/formats',
      description: 'Formats supportés',
      params: [],
    },
  ];

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        {/* Bouton retour */}
        <div className="mb-6">
          <BackButton />
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Documentation API
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Intégrez OMNIVERSA dans vos applications avec notre API REST puissante et simple
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12 max-w-5xl mx-auto">
          <div className="p-6 bg-card rounded-xl border text-center">
            <Zap className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">{'< 2s'}</div>
            <div className="text-sm text-muted-foreground">Temps de réponse moyen</div>
          </div>
          <div className="p-6 bg-card rounded-xl border text-center">
            <Shield className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">99.9%</div>
            <div className="text-sm text-muted-foreground">Uptime SLA</div>
          </div>
          <div className="p-6 bg-card rounded-xl border text-center">
            <Code className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">6</div>
            <div className="text-sm text-muted-foreground">SDKs disponibles</div>
          </div>
          <div className="p-6 bg-card rounded-xl border text-center">
            <Book className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">50+</div>
            <div className="text-sm text-muted-foreground">Formats supportés</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-6xl mx-auto">
          <div className="flex gap-2 mb-6 overflow-x-auto">
            {['overview', 'quickstart', 'endpoints', 'authentication', 'examples'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                  activeTab === tab
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="bg-card rounded-xl border p-8">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-4">Vue d&apos;ensemble</h2>
                  <p className="text-muted-foreground mb-4">
                    L&apos;API OMNIVERSA vous permet d&apos;intégrer nos fonctionnalités de conversion dans vos applications.
                    REST, JSON, authentification par clé API.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-muted/50 rounded-lg">
                    <h3 className="font-semibold mb-3">🚀 Démarrage rapide</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>1. Créez un compte OMNIVERSA</li>
                      <li>2. Générez une clé API</li>
                      <li>3. Faites votre première requête</li>
                      <li>4. Intégrez dans votre app</li>
                    </ul>
                  </div>

                  <div className="p-6 bg-muted/50 rounded-lg">
                    <h3 className="font-semibold mb-3">📊 Limites par plan</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>Starter: 100 req/mois</li>
                      <li>Professional: 1 500 req/mois</li>
                      <li>Business: 15 000 req/mois</li>
                      <li>Enterprise: Illimité</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Quickstart Tab */}
            {activeTab === 'quickstart' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-4">Démarrage Rapide</h2>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Key className="w-5 h-5 text-primary" />
                    1. Obtenez votre clé API
                  </h3>
                  <div className="p-4 bg-muted/50 rounded-lg mb-4">
                    <p className="text-sm text-muted-foreground mb-3">
                      Connectez-vous à votre tableau de bord et générez une clé API :
                    </p>
                    <a
                      href="/dashboard/api-keys"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      <Key className="w-4 h-4" />
                      Générer une clé API
                    </a>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">2. Faites votre première requête</h3>
                  <div className="relative">
                    <pre className="p-4 bg-slate-900 text-slate-100 rounded-lg overflow-x-auto text-sm">
                      <code>{codeExamples.curl}</code>
                    </pre>
                    <button
                      onClick={() => copyToClipboard(codeExamples.curl, 'curl')}
                      className="absolute top-2 right-2 p-2 bg-slate-700 hover:bg-slate-600 rounded transition-colors"
                    >
                      {copiedCode === 'curl' ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Endpoints Tab */}
            {activeTab === 'endpoints' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-4">Endpoints disponibles</h2>
                <div className="space-y-4">
                  {endpoints.map((endpoint, index) => (
                    <div key={index} className="p-4 bg-muted/30 rounded-lg border">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          endpoint.method === 'GET' ? 'bg-blue-500 text-white' :
                          endpoint.method === 'POST' ? 'bg-green-500 text-white' :
                          'bg-red-500 text-white'
                        }`}>
                          {endpoint.method}
                        </span>
                        <code className="text-sm font-mono">{endpoint.path}</code>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{endpoint.description}</p>
                      {endpoint.params.length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          Paramètres: {endpoint.params.join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Authentication Tab */}
            {activeTab === 'authentication' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-4">Authentification</h2>
                <p className="text-muted-foreground mb-4">
                  Toutes les requêtes API doivent inclure votre clé API dans le header Authorization :
                </p>
                <div className="relative">
                  <pre className="p-4 bg-slate-900 text-slate-100 rounded-lg overflow-x-auto text-sm">
                    <code>Authorization: Bearer YOUR_API_KEY</code>
                  </pre>
                </div>

                <div className="p-6 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-yellow-600" />
                    Sécurité
                  </h3>
                  <ul className="space-y-1 text-sm text-yellow-900 dark:text-yellow-100">
                    <li>• Ne partagez jamais votre clé API</li>
                    <li>• Utilisez HTTPS uniquement</li>
                    <li>• Régénérez votre clé si compromise</li>
                    <li>• Utilisez des variables d&apos;environnement</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Examples Tab */}
            {activeTab === 'examples' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-4">Exemples de Code</h2>
                
                {Object.entries(codeExamples).map(([lang, code]) => (
                  <div key={lang}>
                    <h3 className="text-lg font-semibold mb-3 capitalize">{lang}</h3>
                    <div className="relative">
                      <pre className="p-4 bg-slate-900 text-slate-100 rounded-lg overflow-x-auto text-sm">
                        <code>{code}</code>
                      </pre>
                      <button
                        onClick={() => copyToClipboard(code, lang)}
                        className="absolute top-2 right-2 p-2 bg-slate-700 hover:bg-slate-600 rounded transition-colors"
                      >
                        {copiedCode === lang ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 max-w-4xl mx-auto text-center p-8 bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl">
          <h3 className="text-2xl font-bold mb-3">Prêt à commencer ?</h3>
          <p className="text-muted-foreground mb-6">
            Créez un compte gratuit et obtenez votre clé API en quelques secondes
          </p>
          <a
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            <Zap className="w-5 h-5" />
            Commencer maintenant
          </a>
        </div>
      </div>
    </div>
  );
}
