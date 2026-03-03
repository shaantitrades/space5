export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin';
import { Link } from '@/i18n/routing';

export default async function AdminBlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  await requireAdmin(locale);

  const posts = await prisma.blogPost
    .findMany({
      orderBy: { createdAt: 'desc' as any },
      select: { id: true, title: true, slug: true, status: true, createdAt: true, publishedAt: true },
      take: 50,
    })
    .catch(() => []);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Blog / Articles</h1>
          <p className="text-muted-foreground mt-1">Créer, éditer et publier des articles (SEO / entreprise).</p>
        </div>
        <Link
          href="/admin/blog/new"
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-semibold"
        >
          Nouvel article
        </Link>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="text-left">
              <th className="p-3">Titre</th>
              <th className="p-3">Slug</th>
              <th className="p-3">Statut</th>
              <th className="p-3">Créé</th>
              <th className="p-3">Publié</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 ? (
              <tr>
                <td className="p-4 text-muted-foreground" colSpan={6}>
                  Aucun article. Crée le premier.
                </td>
              </tr>
            ) : (
              posts.map((p) => (
                <tr key={p.id} className="border-t border-border">
                  <td className="p-3 font-semibold">{p.title}</td>
                  <td className="p-3 text-muted-foreground">{p.slug}</td>
                  <td className="p-3">
                    <span
                      className={`inline-flex px-2 py-1 rounded-md text-xs font-semibold ${
                        p.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {p.status === 'PUBLISHED' ? 'Publié' : 'Brouillon'}
                    </span>
                  </td>
                  <td className="p-3 text-muted-foreground">{new Date(p.createdAt).toLocaleDateString('fr-FR')}</td>
                  <td className="p-3 text-muted-foreground">
                    {p.publishedAt ? new Date(p.publishedAt).toLocaleDateString('fr-FR') : '—'}
                  </td>
                  <td className="p-3 text-right">
                    <Link href={`/admin/blog/${p.id}/edit`} className="text-primary hover:underline">
                      Éditer
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

