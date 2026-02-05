import { ReactNode } from 'react';
import { requireAdmin } from '@/lib/admin';
import { Link } from '@/i18n/routing';

export default async function AdminLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await requireAdmin(locale);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-6">
        <aside className="w-full lg:w-72">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Administration</div>
            <div className="text-lg font-bold mt-1">OMNIVERSA Admin</div>

            <nav className="mt-4 space-y-1">
              <Link href="/admin" className="block px-3 py-2 rounded-lg hover:bg-muted text-sm font-medium">
                Tableau de bord
              </Link>
              <Link href="/admin/users" className="block px-3 py-2 rounded-lg hover:bg-muted text-sm font-medium">
                Utilisateurs
              </Link>
              <Link href="/admin/conversions" className="block px-3 py-2 rounded-lg hover:bg-muted text-sm font-medium">
                Conversions
              </Link>
              <Link href="/admin/security" className="block px-3 py-2 rounded-lg hover:bg-muted text-sm font-medium">
                Sécurité / Logs
              </Link>
              <Link href="/admin/blog" className="block px-3 py-2 rounded-lg hover:bg-muted text-sm font-medium">
                Blog / Articles
              </Link>
            </nav>

            <div className="mt-4 pt-4 border-t border-border">
              <Link href="/" className="text-sm text-primary hover:underline">
                Retour au site
              </Link>
            </div>
          </div>
        </aside>

        <section className="flex-1">{children}</section>
      </div>
    </div>
  );
}

