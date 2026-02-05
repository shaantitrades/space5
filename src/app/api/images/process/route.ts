/**
 * Multi Convert - API Images Processing
 */

import { NextRequest, NextResponse } from 'next/server';
import { ImageConverter } from '@/lib/converters/image-converter';
import { ImageOptimizer } from '@/lib/converters/image-optimizer';
import { ImageBatchProcessor } from '@/lib/converters/image-batch';
import { FaviconGenerator } from '@/lib/converters/favicon-generator';
import JSZip from 'jszip';
import {
  assertMonthlyQuotaOrThrow,
  assertUploadSizeOrThrow,
  getSessionTierAndUserId,
  inferExt,
  recordConversion,
} from '@/lib/quota';
import { calculateCredits, isQuotaExceededError, refundCredits, reserveCreditsOrThrow } from '@/lib/credits';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const { tier, userId } = await getSessionTierAndUserId();
  let creditsUsed = 0;
  try {
    const formData = await request.formData();
    const tool = formData.get('tool') as string;
    const files = formData.getAll('files') as File[];

    if (!tool || files.length === 0) {
      return NextResponse.json(
        { error: 'Outil ou fichiers manquants' },
        { status: 400 }
      );
    }

    const allowedTools = new Set(['convert', 'optimize', 'resize', 'filters', 'watermark', 'batch', 'favicon']);
    if (!allowedTools.has(tool)) {
      return NextResponse.json({ error: 'Outil non reconnu' }, { status: 400 });
    }

    const totalBytes = files.reduce((sum, f) => sum + (typeof f?.size === 'number' ? f.size : 0), 0);
    assertUploadSizeOrThrow({ tier, totalBytes, kind: 'general' });
    try {
      await assertMonthlyQuotaOrThrow({ userId, tier, kind: 'general' });
    } catch (e) {
      if (isQuotaExceededError(e)) {
        // Pay-per-use via crédits
        creditsUsed = calculateCredits({
          fileType: 'image',
          fileSizeBytes: totalBytes,
          options: {
            compression: tool === 'optimize' || tool === 'batch',
          },
        });
        await reserveCreditsOrThrow({ userId, credits: creditsUsed });
      } else {
        throw e;
      }
    }

    const buffers = await Promise.all(
      files.map(async (file) => ({
        buffer: Buffer.from(await file.arrayBuffer()),
        name: file.name,
      }))
    );

    let results: Array<{ buffer: Buffer; name: string }> = [];
    let outputFormat = 'zip';

    switch (tool) {
      case 'convert': {
        const format = (formData.get('format') || formData.get('outputFormat') as string) || 'webp';
        const quality = parseInt(formData.get('quality') as string) || 90;
        outputFormat = format.toLowerCase();

        for (const { buffer, name } of buffers) {
          let converted: Buffer;
          let finalFormat = format.toLowerCase();

          // Gérer la conversion vers ICO (utiliser FaviconGenerator)
          if (finalFormat === 'ico') {
            converted = await FaviconGenerator.generateICO(buffer);
            finalFormat = 'ico';
          } else {
            converted = await ImageConverter.convert(buffer, {
              format: finalFormat,
              quality,
            });
          }

          const newName = name.replace(/\.[^.]+$/, `.${finalFormat}`);
          results.push({ buffer: converted, name: newName });
        }
        break;
      }

      case 'optimize': {
        const targetFormat = (formData.get('format') as string) || 'webp';
        const quality = parseInt(formData.get('quality') as string) || 85;
        outputFormat = targetFormat.toLowerCase();

        for (const { buffer, name } of buffers) {
          const optimized = await ImageOptimizer.optimize(buffer, {
            format: targetFormat,
            quality,
            stripMetadata: true,
          });

          const newName = name.replace(/\.[^.]+$/, `.${targetFormat}`);
          results.push({ buffer: optimized.buffer, name: newName });
        }
        break;
      }

      case 'resize': {
        outputFormat = inferExt(buffers[0]?.name || '') || 'image';
        const width = parseInt(formData.get('width') as string) || undefined;
        const height = parseInt(formData.get('height') as string) || undefined;

        for (const { buffer, name } of buffers) {
          const resized = await ImageConverter.resize(buffer, width, height);
          results.push({ buffer: resized, name });
        }
        break;
      }

      case 'filters': {
        outputFormat = inferExt(buffers[0]?.name || '') || 'image';
        const filter = (formData.get('filter') as string) || 'grayscale';

        for (const { buffer, name } of buffers) {
          const filtered = await ImageConverter.applyFilter(
            buffer,
            filter
          );
          results.push({ buffer: filtered, name });
        }
        break;
      }

      case 'watermark': {
        outputFormat = inferExt(buffers[0]?.name || '') || 'image';
        const text = (formData.get('text') as string) || 'Multi Convert';
        const position = (formData.get('position') as string) || 'bottom-right';
        const opacity = parseFloat(formData.get('opacity') as string) || 0.5;

        for (const { buffer, name } of buffers) {
          const watermarked = await ImageBatchProcessor.addTextWatermark(
            buffer,
            { text, position: position as 'top-left' | 'top-center' | 'top-right' | 'center-left' | 'center' | 'center-right' | 'bottom-left' | 'bottom-center' | 'bottom-right', opacity }
          );
          results.push({ buffer: watermarked, name });
        }
        break;
      }

      case 'batch': {
        const batchOptions = {
          resize: {
            width: parseInt(formData.get('width') as string) || undefined,
            height: parseInt(formData.get('height') as string) || undefined,
          },
          format: (formData.get('format') as string) || undefined,
          quality: parseInt(formData.get('quality') as string) || 85,
        };

        results = await ImageBatchProcessor.batchProcess(
          buffers,
          batchOptions
        );
        outputFormat = (batchOptions.format || inferExt(buffers[0]?.name || '') || 'zip').toLowerCase();
        break;
      }

      case 'favicon': {
        const buffer = buffers[0].buffer;
        const sizes = formData.get('sizes')?.toString().split(',').map(Number) || [16, 32, 48, 180, 192, 512];

        // Générer le package complet de favicons
        const faviconPackage = await FaviconGenerator.generateFaviconPackage(buffer);

        // Créer un ZIP avec tous les favicons
        const zip = new JSZip();
        zip.file('favicon-16x16.png', faviconPackage.favicon16);
        zip.file('favicon-32x32.png', faviconPackage.favicon32);
        zip.file('favicon-48x48.png', faviconPackage.favicon48);
        zip.file('apple-touch-icon.png', faviconPackage.favicon180);
        zip.file('android-chrome-192x192.png', faviconPackage.favicon192);
        zip.file('android-chrome-512x512.png', faviconPackage.favicon512);

        const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

        await recordConversion({
          userId,
          inputFileName: files[0]?.name || 'image',
          inputFormat: inferExt(files[0]?.name || '') || 'image',
          outputFormat: 'zip',
          fileSizeBytes: totalBytes,
          creditsUsed,
          status: 'COMPLETED',
        });

        return new NextResponse(zipBuffer, {
          headers: {
            'Content-Type': 'application/zip',
            'Content-Disposition': 'attachment; filename="favicons.zip"',
            'X-Usage-Mode': creditsUsed > 0 ? 'credits' : 'quota',
            'X-Usage-Credits-Used': String(creditsUsed),
          },
        });
      }

      default:
        return NextResponse.json(
          { error: 'Outil non reconnu' },
          { status: 400 }
        );
    }

    await recordConversion({
      userId,
      inputFileName: files[0]?.name || 'image',
      inputFormat: inferExt(files[0]?.name || '') || 'image',
      outputFormat,
      fileSizeBytes: totalBytes,
      creditsUsed,
      status: 'COMPLETED',
    });

    // Si un seul fichier, le retourner directement
    if (results.length === 1) {
      const { buffer, name } = results[0];
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'image/' + name.split('.').pop(),
          'Content-Disposition': `attachment; filename="${name}"`,
          'X-Usage-Mode': creditsUsed > 0 ? 'credits' : 'quota',
          'X-Usage-Credits-Used': String(creditsUsed),
        },
      });
    }

    // Sinon, créer un ZIP
    const zip = new JSZip();
    results.forEach(({ buffer, name }) => {
      zip.file(name, buffer);
    });

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

    return new NextResponse(zipBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="images.zip"',
        'X-Usage-Mode': creditsUsed > 0 ? 'credits' : 'quota',
        'X-Usage-Credits-Used': String(creditsUsed),
      },
    });
  } catch (error) {
    console.error('Erreur traitement images:', error);
    if (creditsUsed > 0) await refundCredits({ userId, credits: creditsUsed });
    await recordConversion({
      userId,
      inputFileName: 'image',
      inputFormat: 'image',
      outputFormat: 'image',
      creditsUsed,
      status: 'FAILED',
      errorMessage: error instanceof Error ? error.message : 'Erreur inconnue',
    });
    if (error instanceof Error && 'status' in error && 'payload' in error) {
      const { status, payload } = error as any;
      return NextResponse.json(payload, { status });
    }
    return NextResponse.json(
      {
        error: 'Erreur lors du traitement',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}
