export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import { Link } from '@/i18n/routing';


export default async function BlogIndexPage() {
  const posts = await prisma.blogPost
    .findMany({
      where: { status: 'PUBLISHED' as any },
      orderBy: { publishedAt: 'desc' as any },
      select: { id: true, slug: true, title: true, excerpt: true, publishedAt: true },
      take: 30,
    })
    .catch(() => []);

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold">Blog</h1>
        <p className="text-muted-foreground mt-2">
          Articles, guides et bonnes pratiques pour PDF, images, vidéo, sécurité et productivité.
        </p>

        <div className="mt-8 space-y-4">
          {posts.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="text-sm font-semibold">Aucun article publié pour le moment</div>
              <p className="text-sm text-muted-foreground mt-1">
                Publie ton premier article depuis l’espace Admin → Blog.
              </p>
            </div>
          ) : (
            posts.map((p) => (
              <Link
                key={p.id}
                href={`/blog/${p.slug}`}
                className="block rounded-xl border border-border bg-card p-6 hover:bg-muted transition-colors"
              >
                <div className="text-xl font-bold">{p.title}</div>
                {p.excerpt && <div className="text-sm text-muted-foreground mt-2">{p.excerpt}</div>}
                {p.publishedAt && (
                  <div className="text-xs text-muted-foreground mt-3">
                    Publié le {new Date(p.publishedAt).toLocaleDateString('fr-FR')}
                  </div>
                )}
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

