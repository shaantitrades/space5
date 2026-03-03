export const dynamic = 'force-dynamic';

import { requireAdmin } from '@/lib/admin';
import { AdminBlogEditor } from '@/components/blog/admin-blog-editor';

export default async function AdminBlogNewPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  await requireAdmin(locale);
  return <AdminBlogEditor mode="create" />;
}

