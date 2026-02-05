/**
 * Multi Convert - Rate Limiter Component
 * Protection contre les tentatives multiples
 */

'use client';

import { useState, useEffect } from 'react';
import { ShieldAlert, Clock } from 'lucide-react';

interface RateLimiterProps {
  action: 'login' | 'signup' | 'password_reset';
  maxAttempts?: number;
  windowMinutes?: number;
}

export default function RateLimiter({ 
  action, 
  maxAttempts = 5, 
  windowMinutes = 15 
}: RateLimiterProps) {
  const [attempts, setAttempts] = useState(0);
  const [blockedUntil, setBlockedUntil] = useState<Date | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    // Récupérer les tentatives depuis localStorage
    const stored = localStorage.getItem(`rate_limit_${action}`);
    if (stored) {
      const data = JSON.parse(stored);
      setAttempts(data.attempts || 0);
      
      if (data.blockedUntil && new Date(data.blockedUntil) > new Date()) {
        setBlockedUntil(new Date(data.blockedUntil));
      }
    }
  }, [action]);

  useEffect(() => {
    if (blockedUntil) {
      const interval = setInterval(() => {
        const now = new Date();
        const diff = Math.floor((blockedUntil.getTime() - now.getTime()) / 1000);
        
        if (diff <= 0) {
          setBlockedUntil(null);
          setAttempts(0);
          localStorage.removeItem(`rate_limit_${action}`);
          clearInterval(interval);
        } else {
          setCooldown(diff);
        }
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [blockedUntil, action]);

  const recordAttempt = (success: boolean) => {
    const newAttempts = success ? 0 : attempts + 1;
    setAttempts(newAttempts);
    
    let newBlockedUntil = null;
    if (newAttempts >= maxAttempts) {
      const blockTime = new Date();
      blockTime.setMinutes(blockTime.getMinutes() + windowMinutes);
      newBlockedUntil = blockTime;
      setBlockedUntil(blockTime);
    }
    
    localStorage.setItem(`rate_limit_${action}`, JSON.stringify({
      attempts: newAttempts,
      blockedUntil: newBlockedUntil,
      lastAttempt: new Date().toISOString()
    }));
  };

  if (blockedUntil) {
    const minutes = Math.floor(cooldown / 60);
    const seconds = cooldown % 60;
    
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center space-x-3">
          <ShieldAlert className="w-5 h-5 text-red-600 flex-shrink-0" />
          <div>
            <p className="font-medium text-red-800">
              Trop de tentatives
            </p>
            <p className="text-sm text-red-600">
              Réessayez dans {minutes}:{seconds.toString().padStart(2, '0')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (attempts > 0 && attempts < maxAttempts) {
    return (
      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-amber-600" />
          <p className="text-sm text-amber-800">
            Tentatives restantes : {maxAttempts - attempts}
          </p>
        </div>
      </div>
    );
  }

  return null;
}

export { RateLimiter };
