'use client';

import { useSearchParams } from 'next/navigation';
import AuthLayout from '@/components/auth/AuthLayout';
import { Mail, CheckCircle, RefreshCw } from 'lucide-react';
import { Link } from '@/i18n/routing';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  return (
    <AuthLayout
      title="Vérifiez votre email"
      subtitle="Un email de confirmation a été envoyé"
      background="multiconvert"
    >
      <div className="space-y-6">
        <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <Mail className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-800 mb-2">
                Vérification requise
              </h3>
              <p className="text-sm text-blue-700">
                Un email de vérification a été envoyé à{' '}
                <span className="font-medium">{email}</span>
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
            <li>Cherchez l'email de OMNIVERSA</li>
            <li>Cliquez sur le lien de vérification</li>
            <li>Connectez-vous à votre compte</li>
          </ol>
        </div>

        <div className="text-center space-y-4">
          <p className="text-sm text-gray-600">
            Vous n'avez pas reçu l'email ?
          </p>
          <button
            onClick={() => {
              // TODO: Implémenter la logique de renvoi
              alert('Email renvoyé !');
            }}
            className="inline-flex items-center text-sm font-medium text-purple-600 hover:text-purple-500"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Renvoyer l'email
          </button>
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
