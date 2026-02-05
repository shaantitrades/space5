/**
 * 🔄 API ROUTE - CONVERSION DE FICHIERS
 * 
 * Endpoint sécurisé pour la conversion de fichiers
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateFile } from '@/lib/security/file-validator';
import { checkConversionRateLimit } from '@/lib/security/rate-limiter';
import { convertFile } from '@/lib/conversion/converter';
import {
  assertMonthlyQuotaOrThrow,
  assertUploadSizeOrThrow,
  getSessionTierAndUserId,
  inferExt,
  recordConversion,
} from '@/lib/quota';
import { calculateCredits, inferCreditFileType, isQuotaExceededError, refundCredits, reserveCreditsOrThrow } from '@/lib/credits';

export async function POST(request: NextRequest) {
  const { tier, userId } = await getSessionTierAndUserId();
  let creditsUsed = 0;
  try {
    // 1. Vérification rate limit
    const ip = request.ip || request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    const rateLimitCheck = await checkConversionRateLimit(userId || ip, tier);

    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          resetTime: rateLimitCheck.resetTime,
        },
        { status: 429 }
      );
    }

    // 2. Récupération du fichier
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const outputFormat = formData.get('outputFormat') as string;

    if (!file || !outputFormat) {
      return NextResponse.json({ error: 'Missing file or output format' }, { status: 400 });
    }

    const totalBytes = typeof file.size === 'number' ? file.size : 0;
    assertUploadSizeOrThrow({ tier, totalBytes, kind: 'general' });

    // 3. Validation du fichier
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const validationResult = await validateFile(fileBuffer, file.name, {
      userTier: tier === 'enterprise' ? 'enterprise' : tier,
      strictMode: true,
    });

    if (!validationResult.valid) {
      return NextResponse.json(
        {
          error: 'File validation failed',
          details: validationResult.errors,
          warnings: validationResult.warnings,
        },
        { status: 400 }
      );
    }

    // Quota -> si dépassé, on autorise le "pay-per-use" via crédits (après validation, pour éviter toute fuite)
    try {
      await assertMonthlyQuotaOrThrow({ userId, tier, kind: 'general' });
    } catch (e) {
      if (isQuotaExceededError(e)) {
        const type = inferCreditFileType({ filename: file.name, mimeType: validationResult.mimeType });
        creditsUsed = calculateCredits({ fileType: type, fileSizeBytes: totalBytes });
        await reserveCreditsOrThrow({ userId, credits: creditsUsed });
      } else {
        throw e;
      }
    }

    // 4. Conversion
    const convertedBuffer = await convertFile(fileBuffer, validationResult.mimeType!, outputFormat);

    await recordConversion({
      userId,
      inputFileName: file.name,
      inputFormat: inferExt(file.name) || validationResult.mimeType || 'file',
      outputFormat: outputFormat.toLowerCase(),
      fileSizeBytes: totalBytes,
      creditsUsed,
      status: 'COMPLETED',
    });

    // 5. Retour du fichier converti
    return new NextResponse(convertedBuffer, {
      headers: {
        'Content-Type': getMimeType(outputFormat),
        'Content-Disposition': `attachment; filename="converted.${outputFormat.toLowerCase()}"`,
        'X-Usage-Mode': creditsUsed > 0 ? 'credits' : 'quota',
        'X-Usage-Credits-Used': String(creditsUsed),
      },
    });
  } catch (error) {
    console.error('[CONVERSION ERROR]', error);
    // Si des crédits ont été débités, les rembourser sur erreur
    if (creditsUsed > 0) await refundCredits({ userId, credits: creditsUsed });

    await recordConversion({
      userId,
      inputFileName: 'convert',
      inputFormat: 'file',
      outputFormat: 'file',
      creditsUsed,
      status: 'FAILED',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    });
    if (error instanceof Error && 'status' in error && 'payload' in error) {
      const { status, payload } = error as any;
      return NextResponse.json(payload, { status });
    }
    return NextResponse.json(
      {
        error: 'Conversion failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

function getMimeType(format: string): string {
  const mimeMap: Record<string, string> = {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    webp: 'image/webp',
    gif: 'image/gif',
    pdf: 'application/pdf',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    doc: 'application/msword',
  };

  return mimeMap[format.toLowerCase()] || 'application/octet-stream';
}
