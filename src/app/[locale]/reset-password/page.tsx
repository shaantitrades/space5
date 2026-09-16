'use client';

/**
 * 🔑 Page de réinitialisation du mot de passe
 *
 * Cible du lien envoyé par email : /reset-password?token=xxxxx
 * Le token est vérifié côté serveur (POST /api/auth/reset-password) ; cette page
 * ne fait que collecter et valider le nouveau mot de passe avant l'envoi.
 */

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import AuthLayout from '@/components/auth/AuthLayout';
import { AuthError } from '@/components/auth/auth-error';
import { Link } from '@/i18n/routing';
import { CheckCircle, Eye, EyeOff, Lock } from 'lucide-react';
import { passwordSchema, PASSWORD_REQUIREMENTS } from '@/lib/password-schema';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Mêmes règles que l'inscription (src/lib/password-schema.ts)
    const parsed = passwordSchema.safeParse(password);
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message || 'Mot de passe invalide');
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || 'Erreur lors de la réinitialisation');
      }

      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Lien sans token (ou tronqué par le client mail) ──
  if (!token) {
    return (
      <AuthLayout
        title="Lien incomplet"
        subtitle="Ce lien de réinitialisation est invalide"
        background="multiconvert"
      >
        <div className="space-y-6">
          <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">
              Le lien utilisé ne contient pas de token. Demandez un nouvel email de
              réinitialisation : il vous suffit de saisir votre adresse.
            </p>
          </div>
          <Link
            href="/forgot-password"
            className="block text-center py-3 px-4 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            Demander un nouveau lien
          </Link>
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

  // ── Succès ──
  if (isSuccess) {
    return (
      <AuthLayout
        title="Mot de passe modifié"
        subtitle="Votre nouveau mot de passe est actif"
        background="multiconvert"
      >
        <div className="space-y-6">
          <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-green-800 mb-2">
                  Réinitialisation réussie
                </h3>
                <p className="text-sm text-green-700">
                  Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
                </p>
              </div>
            </div>
          </div>

          <Link
            href="/login"
            className="block text-center py-3 px-4 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            Se connecter
          </Link>
        </div>
      </AuthLayout>
    );
  }

  // ── Saisie du nouveau mot de passe ──
  return (
    <AuthLayout
      title="Nouveau mot de passe"
      subtitle="Choisissez un mot de passe solide"
      background="multiconvert"
    >
      <div className="space-y-6">
        {/* Erreur : bandeau fixe en bas de l'écran (toujours visible) */}
        <AuthError message={error} onClose={() => setError('')} />

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Nouveau mot de passe
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="••••••••"
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-500">{PASSWORD_REQUIREMENTS}</p>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="••••••••"
                required
                autoComplete="new-password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer le nouveau mot de passe'}
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
