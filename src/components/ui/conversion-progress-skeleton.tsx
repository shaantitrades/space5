'use client';

import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

interface ConversionProgressSkeletonProps {
  fileName?: string;
  progress?: number;
}

export function ConversionProgressSkeleton({ 
  fileName = "Traitement en cours...", 
  progress = 0 
}: ConversionProgressSkeletonProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto p-6 border rounded-lg bg-white shadow-lg"
    >
      {/* File Icon & Name */}
      <div className="flex items-center gap-4 mb-6">
        <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
          <Skeleton className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-sm truncate">{fileName}</p>
          <Skeleton className="h-4 w-24 mt-1" />
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Conversion en cours...</span>
          <span className="font-medium">{progress}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t">
        <div>
          <Skeleton className="h-3 w-16 mb-1" />
          <Skeleton className="h-5 w-20" />
        </div>
        <div>
          <Skeleton className="h-3 w-16 mb-1" />
          <Skeleton className="h-5 w-20" />
        </div>
        <div>
          <Skeleton className="h-3 w-16 mb-1" />
          <Skeleton className="h-5 w-20" />
        </div>
      </div>

      {/* Cancel Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full mt-6 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
      >
        Annuler
      </motion.button>
    </motion.div>
  );
}
