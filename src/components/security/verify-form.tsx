'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';

export function VerifyForm() {
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async () => {
    setIsVerifying(true);
    // TODO: Implémenter la vérification (CAPTCHA, email, etc.)
    setTimeout(() => {
      setIsVerifying(false);
      // Rediriger vers la page d'origine après vérification
      window.location.href = '/';
    }, 2000);
  };

  return (
    <div className="bg-card border rounded-lg p-6">
      <p className="text-sm text-muted-foreground mb-6">
        For security reasons, we need to verify your identity. This helps us protect our platform from fraud and abuse.
      </p>

      <button
        onClick={handleVerify}
        disabled={isVerifying}
        className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isVerifying ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Verifying...
          </>
        ) : (
          'Complete Verification'
        )}
      </button>
    </div>
  );
}
