import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin';

export default async function AdminHomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  await requireAdmin(locale);

  const [userCount, conversionCount, securityCount, draftPosts, publishedPosts] = await Promise.all([
    prisma.user.count(),
    prisma.conversion.count(),
    prisma.securityEvent.count(),
    prisma.blogPost.count({ where: { status: 'DRAFT' as any } }).catch(() => 0),
    prisma.blogPost.count({ where: { status: 'PUBLISHED' as any } }).catch(() => 0),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tableau de bord Admin</h1>
        <p className="text-muted-foreground mt-1">Vue d’ensemble de la plateforme (entreprise).</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        <Card title="Utilisateurs" value={userCount} />
        <Card title="Conversions" value={conversionCount} />
        <Card title="Événements sécurité" value={securityCount} />
        <Card title="Articles (brouillons)" value={draftPosts} />
        <Card title="Articles (publiés)" value={publishedPosts} />
      </div>
    </div>
  );
}

function Card({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="text-sm font-semibold">{title}</div>
      <div className="text-2xl font-bold mt-2">{value}</div>
    </div>
  );
}

