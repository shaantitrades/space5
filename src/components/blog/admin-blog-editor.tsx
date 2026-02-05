'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from '@/i18n/routing';

type BlogStatus = 'DRAFT' | 'PUBLISHED';

export function AdminBlogEditor({ mode, id }: { mode: 'create' | 'edit'; id?: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(mode === 'edit');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<BlogStatus>('DRAFT');

  const slugSuggestion = useMemo(() => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\p{L}\p{N}]+/gu, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 120);
  }, [title]);

  useEffect(() => {
    if (mode === 'edit' && id) {
      (async () => {
        try {
          setIsLoading(true);
          const res = await fetch(`/api/admin/blog/posts/${id}`);
          if (!res.ok) throw new Error('Impossible de charger l’article');
          const data = await res.json();
          setTitle(data.title || '');
          setSlug(data.slug || '');
          setExcerpt(data.excerpt || '');
          setContent(data.content || '');
          setStatus(data.status || 'DRAFT');
        } catch (e) {
          setError(e instanceof Error ? e.message : 'Erreur');
        } finally {
          setIsLoading(false);
        }
      })();
    }
  }, [mode, id]);

  const save = async (opts?: { publish?: boolean }) => {
    setError(null);
    setIsSaving(true);
    try {
      const payload = {
        title: title.trim(),
        slug: (slug.trim() || slugSuggestion).trim(),
        excerpt: excerpt.trim() || null,
        content: content || '',
        status: (opts?.publish ? 'PUBLISHED' : status) as BlogStatus,
      };

      if (!payload.title) throw new Error('Le titre est requis');
      if (!payload.slug) throw new Error('Le slug est requis');

      const url = mode === 'edit' ? `/api/admin/blog/posts/${id}` : `/api/admin/blog/posts`;
      const method = mode === 'edit' ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Enregistrement impossible');

      router.push('/admin/blog');
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="text-sm text-muted-foreground">Chargement…</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">{mode === 'edit' ? 'Éditer l’article' : 'Nouvel article'}</h1>
          <p className="text-muted-foreground mt-1">Rédaction propre, SEO-ready, publication contrôlée.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.push('/admin/blog')}
            className="px-4 py-2 rounded-lg border border-border hover:bg-muted text-sm font-semibold"
          >
            Annuler
          </button>
          <button
            onClick={() => save()}
            disabled={isSaving}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-semibold disabled:opacity-50"
          >
            {isSaving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
          <button
            onClick={() => save({ publish: true })}
            disabled={isSaving}
            className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 text-sm font-semibold disabled:opacity-50"
          >
            {isSaving ? 'Publication…' : 'Publier'}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <label className="text-sm font-semibold">Titre</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
              placeholder="Titre de l’article"
            />

            <label className="text-sm font-semibold">Extrait</label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm min-h-[90px]"
              placeholder="Résumé court (SEO / listing)"
            />
          </div>

          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <label className="text-sm font-semibold">Contenu (Markdown)</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm min-h-[420px] font-mono"
              placeholder="# Titre\n\nVotre contenu…"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <div className="text-sm font-semibold">Paramètres</div>

            <label className="text-sm font-semibold">Slug</label>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
              placeholder={slugSuggestion || 'slug'}
            />
            <div className="text-xs text-muted-foreground">
              URL: <span className="font-mono">/blog/{(slug.trim() || slugSuggestion || '...')}</span>
            </div>

            <label className="text-sm font-semibold">Statut</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as BlogStatus)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
            >
              <option value="DRAFT">Brouillon</option>
              <option value="PUBLISHED">Publié</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

