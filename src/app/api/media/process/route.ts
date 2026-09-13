/**
 * Multi Convert - API Media Processing
 * Vidéo & Audio
 */

import { NextRequest, NextResponse } from 'next/server';
import { VideoConverter } from '@/lib/converters/video-converter';
import { AudioConverter } from '@/lib/converters/audio-converter';
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
export const maxDuration = 300; // 5 minutes max pour les conversions vidéo

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

    const allowedTools = new Set(['video-convert', 'audio-convert', 'extract-audio', 'trim', 'compress', 'merge']);
    if (!allowedTools.has(tool)) {
      return NextResponse.json({ error: 'Outil non reconnu' }, { status: 400 });
    }

    const mediaKind = files[0]?.type?.startsWith('video') ? 'video' : 'audio';
    const totalBytes = files.reduce((sum, f) => sum + (typeof f?.size === 'number' ? f.size : 0), 0);
    assertUploadSizeOrThrow({ tier, totalBytes, kind: 'media' });

    // "Très limité ou presque pas" en Free:
    // - Vidéo: autorisée uniquement via crédits (pay-per-use)
    // - Audio: 1/mois puis crédits au-delà
    const creditsNeeded = calculateCredits({
      fileType: mediaKind,
      fileSizeBytes: totalBytes,
      options: { compression: tool === 'compress' },
    });

    if (tier === 'free' && mediaKind === 'video') {
      creditsUsed = creditsNeeded;
      await reserveCreditsOrThrow({ userId, credits: creditsUsed });
    } else {
      try {
        await assertMonthlyQuotaOrThrow({
          userId,
          tier,
          kind: mediaKind === 'video' ? 'media-video' : 'media-audio',
        });
      } catch (e) {
        if (isQuotaExceededError(e)) {
          creditsUsed = creditsNeeded;
          await reserveCreditsOrThrow({ userId, credits: creditsUsed });
        } else {
          throw e;
        }
      }
    }

    const buffer = Buffer.from(await files[0].arrayBuffer());
    let resultBuffer: Buffer;
    let fileName = 'result.mp4';
    let contentType = 'video/mp4';
    let outputFormat = 'mp4';

    switch (tool) {
      case 'video-convert': {
        const format = String(formData.get('outputFormat') || formData.get('format') || 'mp4');
        const quality = String(formData.get('quality') || 'high');

        resultBuffer = await VideoConverter.convert(buffer, {
          format,
          quality,
        });

        fileName = `converted.${format}`;
        contentType = `video/${format}`;
        outputFormat = format.toLowerCase();
        break;
      }

      case 'audio-convert': {
        const format = String(formData.get('outputFormat') || formData.get('format') || 'mp3');
        const bitrate = (formData.get('bitrate') as string) || '192k';

        resultBuffer = await AudioConverter.convert(buffer, {
          format,
          bitrate,
        });

        fileName = `converted.${format}`;
        contentType = `audio/${format}`;
        outputFormat = format.toLowerCase();
        break;
      }

      case 'extract-audio': {
        const format = String(formData.get('format') || 'mp3');

        resultBuffer = await VideoConverter.extractAudio(buffer, format);

        fileName = `extracted.${format}`;
        contentType = `audio/${format}`;
        outputFormat = format.toLowerCase();
        break;
      }

      case 'trim': {
        const startTime = (formData.get('startTime') as string) || '00:00:00';
        const duration = (formData.get('duration') as string) || '00:00:30';

        // Détecter si c'est vidéo ou audio
        const isVideo = files[0].type.startsWith('video');

        if (isVideo) {
          resultBuffer = await VideoConverter.trim(buffer, startTime, duration);
          fileName = 'trimmed.mp4';
          contentType = 'video/mp4';
          outputFormat = 'mp4';
        } else {
          resultBuffer = await AudioConverter.trim(buffer, startTime, duration);
          fileName = 'trimmed.mp3';
          contentType = 'audio/mp3';
          outputFormat = 'mp3';
        }
        break;
      }

      case 'compress': {
        const isVideo = files[0].type.startsWith('video');

        if (isVideo) {
          resultBuffer = await VideoConverter.compress(buffer);
          fileName = 'compressed.mp4';
          contentType = 'video/mp4';
          outputFormat = 'mp4';
        } else {
          const bitrate = (formData.get('bitrate') as string) || '128k';
          resultBuffer = await AudioConverter.compress(buffer, bitrate);
          fileName = 'compressed.mp3';
          contentType = 'audio/mp3';
          outputFormat = 'mp3';
        }
        break;
      }

      case 'merge': {
        // Pour la fusion, on a besoin de plusieurs fichiers
        const buffers = await Promise.all(
          files.map(async (file) => Buffer.from(await file.arrayBuffer()))
        );

        const isVideo = files[0].type.startsWith('video');

        if (isVideo) {
          // La fusion vidéo (concat multi-fichiers) n'est pas encore implémentée.
          return NextResponse.json(
            { error: 'La fusion de vidéos n\'est pas encore disponible. Réessayez avec des fichiers audio.' },
            { status: 501 }
          );
        } else {
          resultBuffer = await AudioConverter.merge(buffers);
          fileName = 'merged.mp3';
          contentType = 'audio/mp3';
          outputFormat = 'mp3';
        }
        break;
      }

      default:
        return NextResponse.json(
          { error: 'Outil non reconnu' },
          { status: 400 }
        );
    }

    await recordConversion({
      userId,
      inputFileName: files[0]?.name || 'media',
      inputFormat: inferExt(files[0]?.name || '') || (mediaKind === 'video' ? 'video' : 'audio'),
      outputFormat,
      fileSizeBytes: totalBytes,
      creditsUsed,
      status: 'COMPLETED',
    });

    return new NextResponse(resultBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': resultBuffer.length.toString(),
        'X-Usage-Mode': creditsUsed > 0 ? 'credits' : 'quota',
        'X-Usage-Credits-Used': String(creditsUsed),
      },
    });
  } catch (error) {
    console.error('Erreur traitement média:', error);
    if (creditsUsed > 0) await refundCredits({ userId, credits: creditsUsed });
    await recordConversion({
      userId,
      inputFileName: 'media',
      inputFormat: 'media',
      outputFormat: 'media',
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
