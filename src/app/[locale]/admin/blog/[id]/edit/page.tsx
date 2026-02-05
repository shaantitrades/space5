import { requireAdmin } from '@/lib/admin';
import { AdminBlogEditor } from '@/components/blog/admin-blog-editor';

export default async function AdminBlogEditPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  await requireAdmin(locale);
  return <AdminBlogEditor mode="edit" id={id} />;
}

