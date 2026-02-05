import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ConversionHistoryItem {
  id: string;
  timestamp: number;
  tool: string;
  toolName: string;
  inputFileName: string;
  inputFileSize: number;
  inputFileType: string;
  outputFileName?: string;
  outputFileSize?: number;
  outputFileType?: string;
  status: 'success' | 'error' | 'processing';
  errorMessage?: string;
  duration?: number; // in milliseconds
}

interface ConversionHistoryStore {
  history: ConversionHistoryItem[];
  addConversion: (item: Omit<ConversionHistoryItem, 'id' | 'timestamp'>) => void;
  updateConversion: (id: string, updates: Partial<ConversionHistoryItem>) => void;
  removeConversion: (id: string) => void;
  clearHistory: () => void;
  getRecentConversions: (limit?: number) => ConversionHistoryItem[];
  getConversionsByTool: (tool: string) => ConversionHistoryItem[];
  getSuccessfulConversions: () => ConversionHistoryItem[];
  getTotalConversions: () => number;
  getTotalSavedSize: () => number;
}

export const useConversionHistory = create<ConversionHistoryStore>()(
  persist(
    (set, get) => ({
      history: [],

      addConversion: (item) => {
        const newItem: ConversionHistoryItem = {
          ...item,
          id: `conversion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
        };
        
        set((state) => ({
          history: [newItem, ...state.history].slice(0, 100), // Keep only last 100
        }));
      },

      updateConversion: (id, updates) => {
        set((state) => ({
          history: state.history.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          ),
        }));
      },

      removeConversion: (id) => {
        set((state) => ({
          history: state.history.filter((item) => item.id !== id),
        }));
      },

      clearHistory: () => {
        set({ history: [] });
      },

      getRecentConversions: (limit = 10) => {
        return get().history.slice(0, limit);
      },

      getConversionsByTool: (tool) => {
        return get().history.filter((item) => item.tool === tool);
      },

      getSuccessfulConversions: () => {
        return get().history.filter((item) => item.status === 'success');
      },

      getTotalConversions: () => {
        return get().history.length;
      },

      getTotalSavedSize: () => {
        return get().history
          .filter((item) => item.status === 'success' && item.inputFileSize && item.outputFileSize)
          .reduce((total, item) => {
            const saved = item.inputFileSize! - (item.outputFileSize || 0);
            return total + (saved > 0 ? saved : 0);
          }, 0);
      },
    }),
    {
      name: 'Multi Convert-conversion-history',
      version: 1,
    }
  )
);

// Helper functions
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
}

export function formatTimestamp(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  
  if (diff < minute) return 'À l\'instant';
  if (diff < hour) return `Il y a ${Math.floor(diff / minute)}min`;
  if (diff < day) return `Il y a ${Math.floor(diff / hour)}h`;
  if (diff < week) return `Il y a ${Math.floor(diff / day)}j`;
  
  const date = new Date(timestamp);
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  });
}
