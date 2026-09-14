'use client';

/**
 * Formulaire de contact / demande de pilote.
 * Envoie les données vers /api/leads (persistance + notification email).
 */

import { useState } from 'react';
import { Check, Loader2, AlertCircle } from 'lucide-react';

type SubmitState = 'idle' | 'loading' | 'success' | 'error';

export interface LeadFormProps {
  /** Permet de distinguer la page d'origine dans la base (entreprise, contact…) */
  source: string;
  /** Masque le champ « entreprise » pour un simple message de contact */
  requireCompany?: boolean;
}

export function LeadForm({ source, requireCompany = true }: LeadFormProps) {
  const [formData, setFormData] = useState({
    company: '',
    name: '',
    email: '',
    phone: '',
    employees: '',
    message: '',
    website: '', // champ leurre anti-robot
  });

  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitState('loading');
    setSubmitError(null);

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, source }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.success) {
        const details = Array.isArray(result?.errors)
          ? result.errors.map((error: { message: string }) => error.message).join(', ')
          : result?.error;
        throw new Error(details || 'L’envoi a échoué. Merci de réessayer.');
      }

      setSubmitState('success');
      setFormData({ company: '', name: '', email: '', phone: '', employees: '', message: '', website: '' });
    } catch (error) {
      setSubmitState('error');
      setSubmitError(error instanceof Error ? error.message : 'Erreur inconnue');
    }
  };

  if (submitState === 'success') {
    return (
      <div className="p-8 bg-card rounded-xl border-2 border-primary">
        <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
          <Check className="w-5 h-5 text-primary" />
          Message envoyé
        </h3>
        <p className="text-sm text-muted-foreground mb-6">Merci ! Nous vous répondons sous 24 h ouvrées.</p>
        <button type="button" onClick={() => setSubmitState('idle')} className="text-sm text-primary hover:underline">
          Envoyer un autre message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        value={formData.website}
        onChange={(event) => setFormData({ ...formData, website: event.target.value })}
        className="hidden"
        aria-hidden="true"
      />

      {requireCompany && (
        <div>
          <label className="block text-sm font-medium mb-2">Entreprise</label>
          <input
            type="text"
            required
            value={formData.company}
            onChange={(event) => setFormData({ ...formData, company: event.target.value })}
            className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            placeholder="Votre entreprise"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-2">Votre nom *</label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(event) => setFormData({ ...formData, name: event.target.value })}
          className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          placeholder="Prénom Nom"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Email *</label>
        <input
          type="email"
          required
          value={formData.email}
          onChange={(event) => setFormData({ ...formData, email: event.target.value })}
          className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          placeholder="vous@exemple.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Votre message *</label>
        <textarea
          required
          value={formData.message}
          onChange={(event) => setFormData({ ...formData, message: event.target.value })}
          rows={5}
          className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
          placeholder="Décrivez votre besoin…"
        />
      </div>

      {submitState === 'error' && (
        <div className="flex items-start gap-2 p-4 rounded-lg border border-red-500/40 bg-red-500/10 text-sm">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <span>{submitError}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={submitState === 'loading'}
        className="w-full py-4 px-6 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
      >
        {submitState === 'loading' ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Envoi…
          </>
        ) : (
          'Envoyer'
        )}
      </button>

      <p className="text-xs text-muted-foreground">
        Ces informations servent uniquement à vous répondre. Aucun fichier ne vous est demandé à cette étape.
      </p>
    </form>
  );
}
