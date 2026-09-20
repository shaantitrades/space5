import { Metadata } from 'next';
import { Link } from '@/i18n/routing';

export const metadata: Metadata = {
  title: 'Clés API - Multi Convert',
  description: 'Gérez vos clés API et accès développeur',
  /** Espace privé : jamais indexé (voir `lib/seo.ts` → `buildPrivatePageMetadata`). */
  robots: { index: false, follow: false },
};

export default function ApiKeysPage() {
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-3xl font-bold">Clés API</h1>
          <Link href="/dashboard" className="text-sm text-primary hover:underline">
            Retour au tableau de bord
          </Link>
        </div>
        <p className="text-muted-foreground mt-2">
          Créez et révoquez des clés pour intégrer Multi Convert dans vos outils internes.
        </p>

        <div className="mt-8 p-6 rounded-xl border border-border bg-card">
          <div className="text-sm font-semibold">Bientôt disponible</div>
          <p className="text-sm text-muted-foreground mt-1">
            La gestion des clés API arrive dans la prochaine itération (création, rotation, scopes, audit logs). Pour un
            accès anticipé dans le cadre d’un pilote, écrivez-nous à contact@multi-convert.com.
          </p>
        </div>
      </div>
    </div>
  );
}

