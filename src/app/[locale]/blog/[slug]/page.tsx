export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Link } from '@/i18n/routing';

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await prisma.blogPost
    .findUnique({
      where: { slug },
      select: { title: true, content: true, publishedAt: true },
    })
    .catch(() => null);

  if (!post) notFound();

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="max-w-4xl mx-auto">
        <Link href="/blog" className="text-sm text-primary hover:underline">
          ← Retour au blog
        </Link>

        <h1 className="text-4xl font-bold mt-4">{post.title}</h1>
        {post.publishedAt && (
          <div className="text-xs text-muted-foreground mt-2">
            Publié le {new Date(post.publishedAt).toLocaleDateString('fr-FR')}
          </div>
        )}

        <article className="prose prose-neutral max-w-none mt-8">
          {/* Contenu Markdown brut (prochaine étape: rendu MDX/Markdown sécurisé) */}
          <pre className="whitespace-pre-wrap font-sans text-base leading-7">{post.content}</pre>
        </article>
      </div>
    </div>
  );
}

