'use client';

/**
 * ⚙️ Paramètres du compte — Multi Convert
 *
 * Cible du lien « Paramètres » du menu utilisateur (qui renvoyait une 404) :
 *  - profil (nom, email, communications)
 *  - sécurité (changement de mot de passe)
 *  - session (déconnexion)
 *
 * Accès réservé aux utilisateurs connectés (redirection vers /login sinon).
 */

import { useEffect, useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { useAuth } from '@/hooks/useAuth';
import { AuthError } from '@/components/auth/auth-error';
import { PASSWORD_REQUIREMENTS, passwordSchema } from '@/lib/password-schema';
import { CheckCircle, Loader2, Lock, Mail, LogOut, User } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const { user, isLoading, refresh, logout } = useAuth();

  // ― Profil ―
  const [fullName, setFullName] = useState('');
  const [acceptMarketing, setAcceptMarketing] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');

  // ― Mot de passe ―
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');

  const [error, setError] = useState('');

  // Accès protégé
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [isLoading, user, router]);

  // Pré-remplissage depuis la session
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setAcceptMarketing(Boolean(user.acceptMarketing));
    }
  }, [user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setProfileMessage('');

    if (fullName.trim().length < 2) {
      setError('Le nom doit contenir au moins 2 caractères');
      return;
    }

    setSavingProfile(true);

    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: fullName.trim(), acceptMarketing }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || 'Erreur lors de la mise à jour');
      }

      setProfileMessage('Profil mis à jour.');
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setPasswordMessage('');

    const parsed = passwordSchema.safeParse(newPassword);
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message || 'Mot de passe invalide');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setSavingPassword(true);

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || 'Erreur lors du changement de mot de passe');
      }

      setPasswordMessage('Mot de passe mis à jour.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setSavingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20 flex justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return null; // redirection en cours
  }

  const inputClass =
    'block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500';

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* En-tête */}
        <div>
          <h1 className="text-3xl font-bold">Paramètres</h1>
          <p className="text-muted-foreground mt-2">
            Gérez votre profil et la sécurité de votre compte
          </p>
        </div>

        <AuthError message={error} onClose={() => setError('')} />

        {/* ― Profil ― */}
        <form
          onSubmit={handleProfileSubmit}
          className="rounded-lg border border-border p-6 space-y-5"
        >
          <h2 className="flex items-center text-lg font-semibold">
            <User className="w-5 h-5 mr-2 text-purple-600" />
            Profil
          </h2>

          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
              Nom complet
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={inputClass}
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Adresse email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                value={user.email}
                readOnly
                disabled
                className={`${inputClass} bg-gray-50 text-gray-500 cursor-not-allowed`}
              />
            </div>
            <p className="mt-2 text-xs text-gray-500">
              L&apos;adresse email ne peut pas être modifiée ici (elle sert à la connexion et à la
              récupération du compte).
            </p>
          </div>

          <label className="flex items-start space-x-3 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={acceptMarketing}
              onChange={(e) => setAcceptMarketing(e.target.checked)}
              className="h-4 w-4 mt-0.5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
            <span>Recevoir les nouveautés et conseils d&apos;utilisation par email</span>
          </label>

          {profileMessage && (
            <p className="flex items-center text-sm text-green-700">
              <CheckCircle className="w-4 h-4 mr-2" />
              {profileMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={savingProfile}
            className="inline-flex items-center justify-center py-2.5 px-5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {savingProfile && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Enregistrer
          </button>
        </form>

        {/* ― Sécurité ― */}
        <form
          onSubmit={handlePasswordSubmit}
          className="rounded-lg border border-border p-6 space-y-5"
        >
          <h2 className="flex items-center text-lg font-semibold">
            <Lock className="w-5 h-5 mr-2 text-purple-600" />
            Sécurité
          </h2>

          <div>
            <label
              htmlFor="currentPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Mot de passe actuel
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={inputClass}
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Nouveau mot de passe
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={inputClass}
                autoComplete="new-password"
                required
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">{PASSWORD_REQUIREMENTS}</p>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Confirmer le nouveau mot de passe
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputClass}
                autoComplete="new-password"
                required
              />
            </div>
          </div>

          {passwordMessage && (
            <p className="flex items-center text-sm text-green-700">
              <CheckCircle className="w-4 h-4 mr-2" />
              {passwordMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={savingPassword}
            className="inline-flex items-center justify-center py-2.5 px-5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {savingPassword && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Modifier le mot de passe
          </button>
        </form>

        {/* ― Session ― */}
        <div className="rounded-lg border border-border p-6 space-y-4">
          <h2 className="flex items-center text-lg font-semibold">
            <LogOut className="w-5 h-5 mr-2 text-purple-600" />
            Session
          </h2>
          <p className="text-sm text-muted-foreground">
            Connecté en tant que <span className="font-medium">{user.email}</span>
          </p>
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center justify-center py-2.5 px-5 rounded-lg text-sm font-medium text-red-700 border border-red-200 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
}
