"use client";
import { useState } from 'react';

export default function ArchivePage() {
  const [createFiles, setCreateFiles] = useState<File[]>([]);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const downloadBlob = (blob: Blob, name: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleCreateZip = async () => {
    if (!createFiles.length) return;
    setBusy(true);
    const fd = new FormData();
    fd.set('mode', 'create');
    for (const f of createFiles) fd.append('files', f, f.name);
    const res = await fetch('/api/archive', { method: 'POST', body: fd });
    setBusy(false);
    if (!res.ok) return;
    const blob = await res.blob();
    downloadBlob(blob, 'archive.zip');
  };

  const handleExtractZip = async () => {
    if (!zipFile) return;
    setBusy(true);
    const fd = new FormData();
    fd.set('mode', 'extract');
    fd.set('file', zipFile, zipFile.name);
    const res = await fetch('/api/archive', { method: 'POST', body: fd });
    setBusy(false);
    if (!res.ok) return;
    const blob = await res.blob();
    downloadBlob(blob, 'extracted.zip');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-10">
      <h1 className="text-2xl font-bold">Archive (ZIP)</h1>

      <section className="p-6 border rounded-lg space-y-4">
        <h2 className="text-lg font-semibold">Créer un ZIP</h2>
        <input
          type="file"
          multiple
          onChange={(e) => setCreateFiles(e.target.files ? Array.from(e.target.files) : [])}
          className="block"
        />
        <button
          onClick={handleCreateZip}
          disabled={busy || !createFiles.length}
          className="px-4 py-2 rounded bg-primary text-primary-foreground disabled:opacity-50"
        >
          Télécharger archive.zip
        </button>
      </section>

      <section className="p-6 border rounded-lg space-y-4">
        <h2 className="text-lg font-semibold">Extraire un ZIP</h2>
        <input
          type="file"
          accept=".zip,application/zip"
          onChange={(e) => setZipFile(e.target.files?.[0] || null)}
          className="block"
        />
        <button
          onClick={handleExtractZip}
          disabled={busy || !zipFile}
          className="px-4 py-2 rounded bg-primary text-primary-foreground disabled:opacity-50"
        >
          Télécharger extracted.zip
        </button>
      </section>
    </div>
  );
}
