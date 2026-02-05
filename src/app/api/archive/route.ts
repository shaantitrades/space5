import JSZip from 'jszip';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const contentType = req.headers.get('content-type') || '';
  if (!contentType.includes('multipart/form-data')) {
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 });
  }

  const formData = await req.formData();
  const mode = String(formData.get('mode') || 'create');

  try {
    if (mode === 'create') {
      const files = formData.getAll('files');
      if (!files.length) {
        return NextResponse.json({ error: 'No files' }, { status: 400 });
      }
      const zip = new JSZip();
      for (const f of files) {
        const file = f as File;
        const arrayBuffer = await file.arrayBuffer();
        zip.file(file.name || 'file', arrayBuffer);
      }
      const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
      return new NextResponse(zipBuffer, {
        headers: {
          'Content-Type': 'application/zip',
          'Content-Disposition': 'attachment; filename="archive.zip"',
        },
      });
    }

    if (mode === 'extract') {
      const file = formData.get('file') as File | null;
      if (!file) {
        return NextResponse.json({ error: 'No zip file' }, { status: 400 });
      }
      const input = await file.arrayBuffer();
      const loaded = await JSZip.loadAsync(input);
      const zip = new JSZip();
      const entries = Object.keys(loaded.files);
      for (const name of entries) {
        const entry = loaded.files[name];
        if (entry && !entry.dir) {
          const buf = await entry.async('nodebuffer');
          zip.file(name, buf);
        }
      }
      const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
      return new NextResponse(zipBuffer, {
        headers: {
          'Content-Type': 'application/zip',
          'Content-Disposition': 'attachment; filename="extracted.zip"',
        },
      });
    }

    return NextResponse.json({ error: 'Invalid mode' }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}
