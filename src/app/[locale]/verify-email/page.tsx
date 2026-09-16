'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import AuthLayout from '@/components/auth/AuthLayout';
import { Mail, CheckCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import { Link } from '@/i18n/routing';

const ERROR_MESSAGES: Record<string, string> = {
  missing_token: "Le lien de confirmation est incomplet. Demandez un nouvel email.",
  invalid_token: "Ce lien de confirmation est invalide ou a expiré (valable 24 h).",
  server_error: "Une erreur est survenue pendant la confirmation. Réessayez ou demandez un nouvel email.",
};

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const errorCode = searchParams.get('error') || '';

  const [resendState, setResendState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [resendError, setResendError] = useState('');
  // Le lien de confirmation invalide ne contient pas l'email : on le demande
  const [manualEmail, setManualEmail] = useState('');

  const handleResend = async () => {
    setResendError('');

    const targetEmail = (email || manualEmail).trim();

    if (!targetEmail) {
      setResendState('error');
      setResendError('Saisissez votre adresse email pour recevoir un nouveau lien.');
      return;
    }

    setResendState('sending');

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || "Impossible d'envoyer l'email");
      }

      setResendState('sent');
    } catch (err) {
      setResendState('error');
      setResendError(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  return (
    <AuthLayout
      title="Vérifiez votre email"
      subtitle="Un email de confirmation a été envoyé"
      background="multiconvert"
    >
      <div className="space-y-6">
        {/* Lien de confirmation invalide/expiré */}
        {errorCode && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">
              {ERROR_MESSAGES[errorCode] || "La confirmation de votre email a échoué."}
            </p>
          </div>
        )}

        <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <Mail className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-800 mb-2">
                Vérification requise
              </h3>
              <p className="text-sm text-blue-700">
                Un email de vérification a été envoyé à{' '}
                <span className="font-medium">{email || 'votre adresse'}</span>
              </p>
              <p className="text-sm text-blue-700 mt-2">
                Cliquez sur le lien dans l'email pour activer votre compte.
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg space-y-3">
          <h4 className="font-medium text-gray-900 flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            Que faire ensuite ?
          </h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
            <li>Ouvrez votre boîte de réception</li>
            <li>Cherchez l&apos;email de Multi Convert</li>
            <li>Cliquez sur le lien de vérification</li>
            <li>Connectez-vous à votre compte</li>
          </ol>
          <p className="text-xs text-gray-500">
            Pensez à vérifier vos spams. Le lien est valable 24 heures.
          </p>
        </div>

        <div className="text-center space-y-4">
          {resendState === 'sent' ? (
            <p className="text-sm font-medium text-green-700">
              ✅ Email renvoyé. Vérifiez votre boîte de réception (et vos spams).
            </p>
          ) : (
            <>
              <p className="text-sm text-gray-600">
                Vous n'avez pas reçu l'email ?
              </p>
              {!email && (
                <input
                  type="email"
                  value={manualEmail}
                  onChange={(e) => setManualEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className="block w-full max-w-xs mx-auto px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              )}
              <button
                type="button"
                onClick={handleResend}
                disabled={resendState === 'sending'}
                className="inline-flex items-center text-sm font-medium text-purple-600 hover:text-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${resendState === 'sending' ? 'animate-spin' : ''}`} />
                {resendState === 'sending' ? 'Envoi en cours...' : "Renvoyer l'email"}
              </button>
            </>
          )}

          {resendState === 'error' && resendError && (
            <p className="text-sm text-red-600">{resendError}</p>
          )}
        </div>

        <div className="text-center pt-4 border-t">
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

