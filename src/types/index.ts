/**
 * Types TypeScript globaux pour Multi Convert
 */

export type UserTier = 'free' | 'pro' | 'business' | 'enterprise';

export type ConversionStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface ConversionJob {
  id: string;
  userId: string;
  inputFile: {
    name: string;
    size: number;
    mimeType: string;
  };
  outputFormat: string;
  status: ConversionStatus;
  createdAt: Date;
  completedAt?: Date;
  error?: string;
  downloadUrl?: string;
}

export interface User {
  id: string;
  email: string;
  tier: UserTier;
  conversionsUsed: number;
  conversionsLimit: number | 'unlimited';
  createdAt: Date;
}

export interface SecurityEvent {
  type: string;
  ip: string;
  country?: string;
  timestamp: Date;
  details: Record<string, any>;
}
