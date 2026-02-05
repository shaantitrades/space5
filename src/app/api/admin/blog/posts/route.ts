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

export async function GET() {
  if (!(await assertAdmin())) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
  const posts = await prisma.blogPost.findMany({ 
    orderBy: { createdAt: 'desc' }, 
    take: 100 
  }).catch(() => []);
  return NextResponse.json(posts);
}

export async function POST(req: Request) {
  if (!(await assertAdmin())) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
  const body = await req.json().catch(() => ({}));
  const title = String(body.title || '').trim();
  const slug = String(body.slug || '').trim();
  const content = String(body.content || '');
  const excerpt = body.excerpt ? String(body.excerpt) : null;
  const status: BlogPostStatus = body.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT';
  if (!title || !slug) return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 });

  const created = await prisma.blogPost.create({
    data: {
      title,
      slug,
      content,
      excerpt,
      status,
      publishedAt: status === 'PUBLISHED' ? new Date() : null,
    },
  });
  return NextResponse.json(created);
}

