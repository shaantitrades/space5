import { Metadata } from 'next';
import { Link } from '@/i18n/routing';

export const metadata: Metadata = {
  title: 'Historique - OMNIVERSA',
  description: 'Historique de vos conversions',
};

export default function HistoryPage() {
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-3xl font-bold">Historique</h1>
          <Link href="/dashboard" className="text-sm text-primary hover:underline">
            Retour au tableau de bord
          </Link>
        </div>
        <p className="text-muted-foreground mt-2">Vos conversions récentes apparaîtront ici.</p>

        <div className="mt-8 p-6 rounded-xl border border-border bg-card">
          <div className="text-sm font-semibold">Aucune conversion pour le moment</div>
          <p className="text-sm text-muted-foreground mt-1">
            Lance une conversion depuis la page d’accueil, puis reviens ici.
          </p>
        </div>
      </div>
    </div>
  );
}

