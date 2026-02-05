'use client';

import { useState, useCallback, useRef } from 'react';

export interface ProgressState {
  isProcessing: boolean;
  progress: number; // 0-100
  startTime: number | null;
  fileName: string;
  fileSize: number;
}

export function useConversionProgress() {
  const [progressState, setProgressState] = useState<ProgressState>({
    isProcessing: false,
    progress: 0,
    startTime: null,
    fileName: '',
    fileSize: 0,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const startProgress = useCallback((fileName: string, fileSize: number) => {
    abortControllerRef.current = new AbortController();
    
    setProgressState({
      isProcessing: true,
      progress: 0,
      startTime: Date.now(),
      fileName,
      fileSize,
    });
  }, []);

  const updateProgress = useCallback((progress: number) => {
    setProgressState((prev) => ({
      ...prev,
      progress: Math.min(100, Math.max(0, progress)),
    }));
  }, []);

  const completeProgress = useCallback(() => {
    setProgressState((prev) => ({
      ...prev,
      progress: 100,
      isProcessing: false,
    }));
  }, []);

  const cancelProgress = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    setProgressState({
      isProcessing: false,
      progress: 0,
      startTime: null,
      fileName: '',
      fileSize: 0,
    });
  }, []);

  const resetProgress = useCallback(() => {
    setProgressState({
      isProcessing: false,
      progress: 0,
      startTime: null,
      fileName: '',
      fileSize: 0,
    });
  }, []);

  return {
    progressState,
    startProgress,
    updateProgress,
    completeProgress,
    cancelProgress,
    resetProgress,
    abortSignal: abortControllerRef.current?.signal,
  };
}
