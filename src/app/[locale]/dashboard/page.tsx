'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  useConversionHistory, 
  formatFileSize, 
  formatDuration, 
  formatTimestamp,
  type ConversionHistoryItem 
} from '@/lib/conversion-history';
import {
  FileText, Download, Trash2, Search, X, Calendar,
  TrendingUp, Zap, CheckCircle, XCircle, Clock,
  Filter, ArrowUpDown, BarChart3
} from 'lucide-react';

export default function DashboardPage() {
  const {
    history,
    removeConversion,
    clearHistory,
    getTotalConversions,
    getSuccessfulConversions,
    getTotalSavedSize,
  } = useConversionHistory();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'error'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'size' | 'duration'>('date');

  const filteredHistory = history
    .filter((item) => {
      const matchesSearch =
        item.inputFileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.toolName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'date') return b.timestamp - a.timestamp;
      if (sortBy === 'size') return (b.inputFileSize || 0) - (a.inputFileSize || 0);
      if (sortBy === 'duration') return (b.duration || 0) - (a.duration || 0);
      return 0;
    });

  const successfulConversions = getSuccessfulConversions();
  const totalSaved = getTotalSavedSize();
  const avgDuration =
    successfulConversions.reduce((sum, item) => sum + (item.duration || 0), 0) /
    (successfulConversions.length || 1);

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Tableau de bord</h1>
          <p className="text-muted-foreground mt-2">
            Suivez vos conversions et optimisez votre productivité
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-xl border border-border bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                Total Conversions
              </div>
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
              {getTotalConversions()}
            </div>
            <div className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              Tout le temps
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-xl border border-border bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-semibold text-green-900 dark:text-green-100">
                Réussies
              </div>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-green-900 dark:text-green-100">
              {successfulConversions.length}
            </div>
            <div className="text-xs text-green-700 dark:text-green-300 mt-1">
              {history.length > 0
                ? `${((successfulConversions.length / history.length) * 100).toFixed(0)}% de réussite`
                : 'Aucune conversion'}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-xl border border-border bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-semibold text-purple-900 dark:text-purple-100">
                Espace Économisé
              </div>
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">
              {formatFileSize(totalSaved)}
            </div>
            <div className="text-xs text-purple-700 dark:text-purple-300 mt-1">
              Par compression
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-6 rounded-xl border border-border bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-semibold text-orange-900 dark:text-orange-100">
                Vitesse Moyenne
              </div>
              <Zap className="w-5 h-5 text-orange-600" />
            </div>
            <div className="text-3xl font-bold text-orange-900 dark:text-orange-100">
              {formatDuration(avgDuration)}
            </div>
            <div className="text-xs text-orange-700 dark:text-orange-300 mt-1">
              Par conversion
            </div>
          </motion.div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom de fichier ou outil..."
              className="w-full pl-10 pr-10 py-3 rounded-lg border-2 border-border focus:border-primary outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-3 rounded-lg border-2 border-border focus:border-primary outline-none transition-colors"
          >
            <option value="all">Tous les statuts</option>
            <option value="success">Réussies</option>
            <option value="error">Échouées</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-3 rounded-lg border-2 border-border focus:border-primary outline-none transition-colors"
          >
            <option value="date">Trier par date</option>
            <option value="size">Trier par taille</option>
            <option value="duration">Trier par durée</option>
          </select>

          {/* Clear History */}
          {history.length > 0 && (
            <button
              onClick={() => {
                if (confirm('Voulez-vous vraiment effacer tout l\'historique ?')) {
                  clearHistory();
                }
              }}
              className="px-4 py-3 rounded-lg border-2 border-red-200 text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Effacer tout
            </button>
          )}
        </div>

        {/* History List */}
        <div className="space-y-4">
          {filteredHistory.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-border rounded-xl">
              <FileText className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucune conversion trouvée</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter !== 'all'
                  ? 'Essayez de modifier vos filtres'
                  : 'Commencez à convertir des fichiers pour voir votre historique'}
              </p>
              <Link
                href="/tools"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Zap className="w-4 h-4" />
                Découvrir les outils
              </Link>
            </div>
          ) : (
            filteredHistory.map((item, index) => (
              <ConversionCard
                key={item.id}
                item={item}
                index={index}
                onRemove={() => removeConversion(item.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function ConversionCard({
  item,
  index,
  onRemove,
}: {
  item: ConversionHistoryItem;
  index: number;
  onRemove: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="p-6 rounded-xl border-2 border-border bg-background hover:border-primary/50 transition-all"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            {item.status === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            ) : item.status === 'error' ? (
              <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            ) : (
              <Clock className="w-5 h-5 text-orange-600 flex-shrink-0 animate-spin" />
            )}
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{item.inputFileName}</h3>
              <p className="text-sm text-muted-foreground">
                {item.toolName} • {formatFileSize(item.inputFileSize)} • {formatTimestamp(item.timestamp)}
              </p>
            </div>
          </div>

          {item.status === 'success' && item.outputFileName && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground ml-8">
              <span>→</span>
              <span className="truncate">{item.outputFileName}</span>
              {item.outputFileSize && (
                <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-0.5 rounded">
                  {formatFileSize(item.outputFileSize)}
                </span>
              )}
            </div>
          )}

          {item.status === 'error' && item.errorMessage && (
            <div className="ml-8 text-sm text-red-600 dark:text-red-400">
              {item.errorMessage}
            </div>
          )}

          {item.duration && (
            <div className="ml-8 text-xs text-muted-foreground mt-1">
              Durée: {formatDuration(item.duration)}
            </div>
          )}
        </div>

        <button
          onClick={onRemove}
          className="p-2 hover:bg-red-50 dark:hover:bg-red-950 text-red-600 rounded-lg transition-colors flex-shrink-0"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}


