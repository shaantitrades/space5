import { useTranslations } from 'next-intl';
import { VerifyForm } from '@/components/security/verify-form';

export default function VerifyPage() {
  const t = useTranslations('security');

  return (
    <div className="container mx-auto py-16">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-4">{t('verify')}</h1>
        <p className="text-muted-foreground mb-8">{t('verifyMessage')}</p>
        <VerifyForm />
      </div>
    </div>
  );
}
