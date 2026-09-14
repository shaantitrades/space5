import { Metadata } from 'next';
import LoginForm from '@/components/auth/LoginForm';
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
    path: '/login',
    title: seo.defaultTitle,
    description: seo.defaultDescription,
    keywords: [],
    noIndex: true,
  });
}

export default function LoginPage() {
  return (
    <AuthLayout
      title="Content de vous revoir"
      subtitle="Connectez-vous pour accéder à votre espace"
      background="multiconvert"
    >
      <div className="space-y-6">
        <SecurityBadges />
        
        <LoginForm />
        
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
        
        <SocialLoginButtons mode="login" />
        
        <p className="text-center text-sm text-gray-600">
          Vous n'avez pas de compte ?{' '}
          <Link href="/signup" className="font-medium text-purple-600 hover:text-purple-500">
            Inscrivez-vous gratuitement
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
