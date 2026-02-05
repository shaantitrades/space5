import { useTranslations } from 'next-intl';
import { ShieldX } from 'lucide-react';

export default function ForbiddenPage() {
  const t = useTranslations('security');

  return (
    <div className="container mx-auto py-16">
      <div className="max-w-md mx-auto text-center">
        <ShieldX className="w-16 h-16 mx-auto mb-4 text-destructive" />
        <h1 className="text-3xl font-bold mb-4">{t('blocked')}</h1>
        <p className="text-muted-foreground">{t('blockedMessage')}</p>
      </div>
    </div>
  );
}
