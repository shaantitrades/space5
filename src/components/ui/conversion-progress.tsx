'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, FileText, Clock, Zap } from 'lucide-react';
import { formatFileSize, formatDuration } from '@/lib/utils';

interface ConversionProgressProps {
  fileName: string;
  fileSize: number;
  progress: number; // 0-100
  onCancel?: () => void;
  isProcessing?: boolean;
  startTime?: number; // timestamp in ms
}

export function ConversionProgress({
  fileName,
  fileSize,
  progress,
  onCancel,
  isProcessing = true,
  startTime,
}: ConversionProgressProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [estimatedTimeLeft, setEstimatedTimeLeft] = useState<number | null>(null);
  const [speed, setSpeed] = useState<number | null>(null);

  useEffect(() => {
    if (!isProcessing || !startTime) return;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setElapsedTime(elapsed);

      // Calculer le temps restant estimé
      if (progress > 0 && progress < 100) {
        const timePerPercent = elapsed / progress;
        const remainingPercent = 100 - progress;
        const estimated = timePerPercent * remainingPercent;
        setEstimatedTimeLeft(estimated);

        // Calculer la vitesse (bytes par seconde)
        const processedBytes = (fileSize * progress) / 100;
        const speedBps = processedBytes / (elapsed / 1000);
        setSpeed(speedBps);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isProcessing, startTime, progress, fileSize]);

  const getProgressColor = () => {
    if (progress < 30) return 'from-blue-500 to-blue-600';
    if (progress < 70) return 'from-purple-500 to-purple-600';
    if (progress < 100) return 'from-green-500 to-green-600';
    return 'from-emerald-500 to-emerald-600';
  };

  const getStatusMessage = () => {
    if (progress === 0) return 'Initialisation...';
    if (progress < 30) return 'Lecture du fichier...';
    if (progress < 70) return 'Conversion en cours...';
    if (progress < 100) return 'Finalisation...';
    return 'Terminé!';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
    >
      {/* Header avec nom du fichier et bouton fermer */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
              {fileName}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {formatFileSize(fileSize)}
            </p>
          </div>
        </div>
        {onCancel && isProcessing && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onCancel}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Annuler"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </motion.button>
        )}
      </div>

      {/* Barre de progression */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {getStatusMessage()}
          </span>
          <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
            {progress.toFixed(0)}%
          </span>
        </div>
        
        {/* Barre */}
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className={`h-full bg-gradient-to-r ${getProgressColor()} rounded-full relative`}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            {/* Effet de brillance animé */}
            {isProcessing && progress < 100 && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{
                  x: ['-100%', '200%'],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
            )}
          </motion.div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-3 gap-4">
        {/* Temps écoulé */}
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
            <Clock className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Écoulé</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {formatDuration(elapsedTime)}
            </p>
          </div>
        </div>

        {/* Temps restant */}
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
            <Clock className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Restant</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {estimatedTimeLeft && progress > 5 && progress < 95
                ? formatDuration(estimatedTimeLeft)
                : '--'}
            </p>
          </div>
        </div>

        {/* Vitesse */}
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
            <Zap className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Vitesse</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {speed && progress > 5 ? `${formatFileSize(speed)}/s` : '--'}
            </p>
          </div>
        </div>
      </div>

      {/* Bouton Annuler (grand) */}
      {onCancel && isProcessing && progress < 100 && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onCancel}
          className="w-full mt-6 py-3 px-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center justify-center gap-2"
        >
          <X className="w-5 h-5" />
          Annuler la conversion
        </motion.button>
      )}

      {/* Message de succès */}
      {progress === 100 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
        >
          <p className="text-sm font-medium text-green-800 dark:text-green-300 text-center">
            ✓ Conversion terminée avec succès!
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
