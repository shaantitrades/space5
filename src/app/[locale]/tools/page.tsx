'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { toolsConfig, categoryLabels, getToolsByCategory, type Tool } from '@/config/tools';
import { Link } from '@/i18n/routing';
import { Search, X, Sparkles, Zap, Crown } from 'lucide-react';

export default function ToolsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Tool['category'] | 'all'>('all');

  const categories: (Tool['category'] | 'all')[] = [
    'all',
    'transformation',
    'assemblage',
    'authentification',
    'conversion',
    'optimisation',
    'personnalisation',
    'production',
    'reparation',
  ];

  const filteredTools = toolsConfig.filter(tool => {
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    const matchesSearch = 
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const groupedTools = selectedCategory === 'all' 
    ? categories.slice(1).reduce((acc, cat) => {
        const tools = getToolsByCategory(cat as Tool['category']);
        if (tools.length > 0) {
          acc[cat as Tool['category']] = tools;
        }
        return acc;
      }, {} as Record<Tool['category'], Tool[]>)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <div className="border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              Plus de 50 outils professionnels
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Tous Vos Outils de Conversion
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Conversion rapide et sécurisée. Vos fichiers sont traités à la demande, puis supprimés ; ils ne sont ni conservés ni revendus.
            </p>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                <span>Conversion instantanée</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Aucune installation</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Connexion chiffrée (HTTPS)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 py-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  selectedCategory === cat
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-900 dark:hover:to-purple-900 text-foreground border border-primary/20'
                }`}
              >
                {cat === 'all' ? 'Tous les outils' : categoryLabels[cat as Tool['category']]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="container mx-auto px-4 py-12">
        {searchQuery && (
          <div className="mb-8">
            <p className="text-muted-foreground">
              <span className="font-semibold text-foreground">{filteredTools.length}</span> résultat{filteredTools.length > 1 ? 's' : ''} pour &quot;{searchQuery}&quot;
            </p>
          </div>
        )}

        {selectedCategory === 'all' && !searchQuery ? (
          // Grouped by category
          <div className="space-y-16">
            {Object.entries(groupedTools || {}).map(([category, tools]) => (
              <section key={category}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">{categoryLabels[category as Tool['category']]}</h2>
                  <span className="text-sm text-muted-foreground">{tools.length} outil{tools.length > 1 ? 's' : ''}</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {tools.map((tool) => (
                    <ToolCard key={tool.id} tool={tool} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          // Simple grid
          <div>
            {filteredTools.length === 0 ? (
              <div className="text-center py-16">
                <Search className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Aucun outil trouvé</h3>
                <p className="text-muted-foreground">
                  Essayez de modifier votre recherche ou de sélectionner une autre catégorie
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredTools.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ToolCard({ tool }: { tool: Tool }) {
  const Icon = tool.icon;

  return (
    <Link href={tool.href}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4, shadow: 'lg' }}
        transition={{ duration: 0.2 }}
        className="group relative block p-6 rounded-xl border-2 border-border bg-background hover:border-primary hover:shadow-lg transition-all duration-200"
      >
        {/* Badges */}
        <div className="absolute top-3 right-3 flex gap-1">
          {tool.popular && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center gap-1"
            >
              <Zap className="w-3 h-3" />
              Populaire
            </motion.span>
          )}
          {tool.pro && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 }}
              className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 text-xs font-medium flex items-center gap-1"
            >
              <Crown className="w-3 h-3" />
              Pro
            </motion.span>
          )}
          {tool.new && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 }}
              className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 text-xs font-medium flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              Nouveau
            </motion.span>
          )}
        </div>

        {/* Icon */}
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className={`w-12 h-12 rounded-lg ${tool.bgColor} ${tool.color} flex items-center justify-center mb-4`}
        >
          <Icon className="w-6 h-6" />
        </motion.div>

        {/* Content */}
        <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
          {tool.name}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {tool.description}
        </p>

        {/* Hover Arrow */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          whileHover={{ opacity: 1, x: 0 }}
          className="absolute bottom-4 right-4"
        >
          <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </motion.div>
      </motion.div>
    </Link>
  );
}
