'use client';

import { useState } from 'react';
import AuthLayout from '@/components/auth/AuthLayout';
import SecurityBadges from '@/components/auth/SecurityBadges';
import { Mail, ArrowRight, CheckCircle } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { AuthError } from '@/components/auth/auth-error';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de l\'envoi');
      }

      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <AuthLayout
        title="Email envoyé !"
        subtitle="Vérifiez votre boîte de réception"
        background="multiconvert"
      >
        <div className="space-y-6">
          <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-green-800 mb-2">
                  Instructions envoyées
                </h3>
                <p className="text-sm text-green-700">
                  Un email avec un lien de réinitialisation a été envoyé à{' '}
                  <span className="font-medium">{email}</span>
                </p>
                <p className="text-sm text-green-700 mt-2">
                  Le lien expirera dans 1 heure.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center space-y-4">
            <p className="text-sm text-gray-600">
              Vous n'avez pas reçu l'email ?
            </p>
            <button
              onClick={() => setIsSuccess(false)}
              className="text-sm font-medium text-purple-600 hover:text-purple-500"
            >
              Renvoyer l'email
            </button>
          </div>

          <Link
            href="/login"
            className="block text-center text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Retour à la connexion
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Mot de passe oublié ?"
      subtitle="Pas de souci, nous allons vous aider à le réinitialiser"
      background="multiconvert"
    >
      <div className="space-y-6">
        <SecurityBadges />

        {/* Erreur : bandeau fixe en bas de l'écran (toujours visible) */}
        <AuthError message={error} onClose={() => setError('')} />

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Adresse email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="jean@example.com"
                required
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Entrez l'email associé à votre compte
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Envoi en cours...
              </>
            ) : (
              <>
                Envoyer le lien
                <ArrowRight className="ml-2 w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center">
          <Link
            href="/login"
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Retour à la connexion
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
