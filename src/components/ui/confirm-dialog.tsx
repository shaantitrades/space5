'use client';

/**
 * ⚠️ Boîte de confirmation réutilisable
 *
 * Utilisée pour les actions sensibles : déconnexion, suspension temporaire,
 * suppression définitive du compte.
 *
 * Options :
 *  - `requireText`  : l'utilisateur doit recopier exactement ce texte
 *  - `requirePassword` : demande le mot de passe du compte
 *  - `variant="danger"` : bouton rouge + icône d'avertissement
 */

import { useEffect, useState } from 'react';
import { AlertTriangle, Loader2, X } from 'lucide-react';

export interface ConfirmDialogValues {
  text: string;
  password: string;
}

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'danger';
  /** Texte exact à recopier pour activer la confirmation */
  requireText?: string;
  /** Demande le mot de passe du compte */
  requirePassword?: boolean;
  loading?: boolean;
  onConfirm: (values: ConfirmDialogValues) => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  variant = 'default',
  requireText,
  requirePassword = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [text, setText] = useState('');
  const [password, setPassword] = useState('');

  // Champs remis à zéro à chaque ouverture
  useEffect(() => {
    if (open) {
      setText('');
      setPassword('');
    }
  }, [open]);

  // Fermeture par Échap
  useEffect(() => {
    if (!open) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel();
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onCancel]);

  if (!open) return null;

  const textValid = !requireText || text.trim() === requireText;
  const passwordValid = !requirePassword || password.length > 0;
  const canConfirm = textValid && passwordValid && !loading;

  const inputClass =
    'block w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500';

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="w-full max-w-md rounded-lg border border-border bg-background p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <h2 className="flex items-center text-lg font-semibold">
            {variant === 'danger' && <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />}
            {title}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Fermer"
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}

        {requireText && (
          <div className="mt-4">
            <label htmlFor="confirm-text" className="block text-sm font-medium text-gray-700 mb-1">
              Recopiez «&nbsp;{requireText}&nbsp;» pour confirmer
            </label>
            <input
              id="confirm-text"
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className={inputClass}
              autoComplete="off"
            />
          </div>
        )}

        {requirePassword && (
          <div className="mt-4">
            <label
              htmlFor="confirm-password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Votre mot de passe
            </label>
            <input
              id="confirm-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              autoComplete="current-password"
            />
          </div>
        )}

        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-border hover:bg-accent"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => onConfirm({ text, password })}
            disabled={!canConfirm}
            className={`inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed ${
              variant === 'danger'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
            }`}
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
