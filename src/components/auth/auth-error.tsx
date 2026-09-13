'use client';

import { X } from 'lucide-react';

interface AuthErrorProps {
  message: string;
  onClose?: () => void;
}

/**
 * Bandeau d'erreur affiché en bas au centre de l'écran (position fixe).
 * Toujours visible, même si l'utilisateur a scrollé jusqu'au bouton d'envoi
 * (l'ancien affichage inline en haut du formulaire passait hors écran).
 */
export function AuthError({ message, onClose }: AuthErrorProps) {
  if (!message) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed inset-x-4 bottom-6 z-[9999] mx-auto max-w-md rounded-lg border border-red-300 bg-red-50 px-10 py-3.5 shadow-xl"
    >
      <p className="text-center text-sm font-medium text-red-800">{message}</p>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer le message d'erreur"
          className="absolute right-2 top-2 rounded p-1 text-red-500 hover:bg-red-100 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}