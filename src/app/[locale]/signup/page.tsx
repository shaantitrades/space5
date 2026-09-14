import { Metadata } from 'next';
import SignupForm from '@/components/auth/SignupForm';
import AuthLayout from '@/components/auth/AuthLayout';
import SecurityBadges from '@/components/auth/SecurityBadges';
import { Link } from '@/i18n/routing';
import SocialLoginButtons from '@/components/auth/SocialLoginButtons';
import { getSeo } from '@/config/seo';
import { buildMetadata } from '@/lib/seo';

/** Page privée : exclue des moteurs de recherche */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const seo = getSeo(locale);

  return buildMetadata({
    locale,
    path: '/signup',
    title: seo.defaultTitle,
    description: seo.defaultDescription,
    keywords: [],
    noIndex: true,
  });
}

export default function SignupPage() {
  return (
    <AuthLayout
      title="Commencez votre voyage"
      subtitle="Rejoignez des milliers de professionnels qui transforment leur workflow"
      background="multiconvert"
    >
      <div className="space-y-6">
        {/* Indicateurs de sécurité */}
        <SecurityBadges />
        
        {/* Form principal */}
        <SignupForm />
        
        {/* Séparateur */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">
              Ou continuez avec
            </span>
          </div>
        </div>
        
        <SocialLoginButtons mode="signup" />
        
        {/* Lien vers connexion */}
        <p className="text-center text-sm text-gray-600">
          Vous avez déjà un compte ?{' '}
          <Link href="/login" className="font-medium text-purple-600 hover:text-purple-500">
            Connectez-vous
          </Link>
        </p>
        
        {/* Mentions légales */}
        <div className="text-xs text-gray-500 text-center">
          <p>
            En vous inscrivant, vous acceptez nos{' '}
            <a href="/terms" className="underline hover:text-gray-700">Conditions d'utilisation</a>
            {' '}et notre{' '}
            <a href="/privacy" className="underline hover:text-gray-700">Politique de confidentialité</a>.
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
