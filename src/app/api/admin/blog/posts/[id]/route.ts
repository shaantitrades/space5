import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { isAdmin, type BlogPostStatus } from '@/lib/auth-utils';

export const runtime = 'nodejs';

async function assertAdmin() {
  const session = await getServerSession(authOptions);
  return isAdmin(session);
}

export async function GET(_: Request, ctx: { params: { id: string } }) {
  if (!(await assertAdmin())) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
  const post = await prisma.blogPost.findUnique({ where: { id: ctx.params.id } }).catch(() => null);
  if (!post) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  return NextResponse.json(post);
}

export async function PUT(req: Request, ctx: { params: { id: string } }) {
  if (!(await assertAdmin())) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
  const body = await req.json().catch(() => ({}));
  const title = String(body.title || '').trim();
  const slug = String(body.slug || '').trim();
  const content = String(body.content || '');
  const excerpt = body.excerpt ? String(body.excerpt) : null;
  const status = body.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT';
  if (!title || !slug) return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 });

  const updated = await prisma.blogPost.update({
    where: { id: ctx.params.id },
    data: {
      title,
      slug,
      content,
      excerpt,
      status: status as BlogPostStatus,
      publishedAt: status === 'PUBLISHED' ? new Date() : null,
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_: Request, ctx: { params: { id: string } }) {
  if (!(await assertAdmin())) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
  await prisma.blogPost.delete({ where: { id: ctx.params.id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}

