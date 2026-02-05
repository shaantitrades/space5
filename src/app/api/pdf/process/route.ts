/**
 * Multi Convert - API PDF Processing
 * Endpoint pour traiter les opérations PDF
 */

import { NextRequest, NextResponse } from 'next/server';
import { PDFConverter } from '@/lib/converters/pdf-converter';
import { PDFMerger } from '@/lib/converters/pdf-merger';
import { PDFSplitter } from '@/lib/converters/pdf-splitter';
import { PDFCompressor } from '@/lib/converters/pdf-compressor';
import { OCREngine } from '@/lib/converters/ocr-engine';
import { DocumentConverter } from '@/lib/converters/document-converter';
import { PDFEditor } from '@/lib/converters/pdf-editor';
import { PDFSigner } from '@/lib/converters/pdf-signer';
import { PDFRedactor } from '@/lib/converters/pdf-redactor';
import { PDFOrganizer } from '@/lib/converters/pdf-organizer';
import { PDFSecurity } from '@/lib/converters/pdf-security';
import { PDFWatermark } from '@/lib/converters/pdf-watermark';
import { PDFTransform } from '@/lib/converters/pdf-transform';
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

    const allowedTools = new Set([
      'convert',
      'merge',
      'split',
      'compress',
      'optimize',
      'ocr',
      'edit',
      'annotate',
      'sign',
      'redact',
      'organize',
      'protect',
      'unlock',
      'watermark',
      'rotate',
      'crop',
      'delete-pages',
    ]);
    if (!allowedTools.has(tool)) {
      return NextResponse.json({ error: `Outil non reconnu: ${tool}` }, { status: 400 });
    }

    const throwHttp = (status: number, payload: any) => {
      const err = new Error(payload?.error || 'HTTP_ERROR') as Error & { status?: number; payload?: any };
      err.status = status;
      err.payload = payload;
      throw err;
    };

    const totalBytes = files.reduce((sum, f) => sum + (typeof f?.size === 'number' ? f.size : 0), 0);
    assertUploadSizeOrThrow({ tier, totalBytes, kind: 'general' });
    try {
      await assertMonthlyQuotaOrThrow({ userId, tier, kind: 'general' });
    } catch (e) {
      if (isQuotaExceededError(e)) {
        creditsUsed = calculateCredits({
          fileType: 'pdf',
          fileSizeBytes: totalBytes,
          options: {
            ocr: tool === 'ocr',
            compression: tool === 'compress' || tool === 'optimize',
          },
        });
        await reserveCreditsOrThrow({ userId, credits: creditsUsed });
      } else {
        throw e;
      }
    }

    // Convertir les fichiers en buffers
    const buffers = await Promise.all(
      files.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        return Buffer.from(arrayBuffer);
      })
    );

    let resultBuffer: Buffer;
    let fileName = 'result.pdf';
    let contentType = 'application/pdf';
    let outputFormat = 'pdf';

    switch (tool) {
      case 'convert': {
        const format = formData.get('format') as string || 'jpeg';
        const sourceBuffer = buffers[0];

        // Déterminer si c'est un PDF ou un document
        const docType = DocumentConverter.detectDocumentType(sourceBuffer);

        if (docType === 'pdf') {
          // PDF vers image
          if (['jpeg', 'png', 'webp'].includes(format)) {
            const images = await PDFConverter.toImages(sourceBuffer, {
              format: format as 'jpeg' | 'png' | 'webp',
              quality: 90,
              dpi: 150,
            });

            resultBuffer = images[0]; // Première page pour l'exemple
            fileName = `converted.${format}`;
            contentType = `image/${format}`;
            outputFormat = format.toLowerCase();
          } 
          // PDF vers Word
          else if (format === 'docx') {
            const text = await PDFConverter.toText(sourceBuffer);
            resultBuffer = await DocumentConverter.pdfToWord(sourceBuffer, text);
            fileName = 'converted.docx';
            contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            outputFormat = 'docx';
          }
          // PDF vers Excel
          else if (format === 'xlsx') {
            const text = await PDFConverter.toText(sourceBuffer);
            resultBuffer = await DocumentConverter.pdfToExcel(sourceBuffer, text);
            fileName = 'converted.xlsx';
            contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            outputFormat = 'xlsx';
          } else {
            resultBuffer = sourceBuffer;
            outputFormat = 'pdf';
          }
        } 
        // Document vers PDF
        else if (docType === 'docx') {
          resultBuffer = await DocumentConverter.wordToPDF(sourceBuffer);
          fileName = 'converted.pdf';
          outputFormat = 'pdf';
        } else if (docType === 'xlsx') {
          resultBuffer = await DocumentConverter.excelToPDF(sourceBuffer);
          fileName = 'converted.pdf';
          outputFormat = 'pdf';
        } else {
          throwHttp(400, { error: 'Type de fichier non supporté' });
        }
        break;
      }

      case 'merge': {
        resultBuffer = await PDFMerger.merge(buffers, {
          title: 'Document fusionné',
          author: 'Multi Convert',
        });
        fileName = 'merged.pdf';
        break;
      }

      case 'split': {
        const mode = formData.get('mode') as 'pages' | 'range' | 'chunks' || 'chunks';
        const result = await PDFSplitter.split(buffers[0], {
          mode,
          chunkSize: 1,
        });

        // Pour l'exemple, renvoyer le premier fichier divisé
        resultBuffer = result.buffers[0];
        fileName = 'split-page-1.pdf';
        break;
      }

      case 'compress': {
        const quality = (formData.get('quality') as 'low' | 'medium' | 'high' | 'auto') || 'medium';

        if (quality === 'auto') {
          const compressed = await PDFCompressor.autoCompress(buffers[0]);
          resultBuffer = compressed.buffer;
        } else {
          const imageQuality = quality === 'low' ? 55 : quality === 'medium' ? 75 : 90;
          resultBuffer = await PDFCompressor.compress(buffers[0], {
            quality,
            imageQuality,
            removeMetadata: true,
            optimizeImages: true,
          });
        }
        fileName = 'compressed.pdf';
        outputFormat = 'pdf';
        break;
      }

      case 'optimize': {
        const quality = (formData.get('quality') as 'low' | 'medium' | 'high') || 'high';
        // "Optimiser" = nettoyage + structure (compression douce)
        // NB: optimiseImages est un placeholder côté PDFCompressor, mais removeMetadata + object streams donnent déjà un gain.
        resultBuffer = await PDFCompressor.compress(buffers[0], {
          quality,
          imageQuality: 90,
          removeMetadata: true,
          optimizeImages: quality === 'low', // seulement si "fort"
        });
        fileName = 'optimized.pdf';
        outputFormat = 'pdf';
        break;
      }

      case 'ocr': {
        const language = formData.get('language') as string || 'fra';
        const sourceBuffer = buffers[0];

        // Convertir le PDF en images
        const images = await PDFConverter.toImages(sourceBuffer, {
          format: 'png',
          quality: 90,
          dpi: 200,
        });

        // Effectuer l'OCR
        const results = await OCREngine.recognizeBatch(images, { language });
        const fullText = results.map((r, i) => `--- Page ${i + 1} ---\n${r.text}`).join('\n\n');

        // Créer un fichier texte avec les résultats
        resultBuffer = Buffer.from(fullText, 'utf-8');
        fileName = 'ocr-result.txt';
        contentType = 'text/plain';
        outputFormat = 'txt';
        break;
      }

      case 'edit': {
        const pageIndex = parseInt(formData.get('pageIndex') as string) || 0;
        const text = formData.get('text') as string || '';
        const x = parseFloat(formData.get('x') as string) || 50;
        const y = parseFloat(formData.get('y') as string) || 50;
        const fontSize = parseFloat(formData.get('fontSize') as string) || 12;

        resultBuffer = await PDFEditor.addText(
          buffers[0],
          text,
          x,
          y,
          pageIndex,
          { fontSize }
        );
        fileName = 'edited.pdf';
        break;
      }

      case 'annotate': {
        // Annotation simple avec texte
        const pageIndex = parseInt(formData.get('pageIndex') as string) || 0;
        const text = formData.get('text') as string || '';
        const x = parseFloat(formData.get('x') as string) || 50;
        const y = parseFloat(formData.get('y') as string) || 50;

        resultBuffer = await PDFEditor.edit(buffers[0], {
          textAnnotations: [{
            text,
            x,
            y,
            fontSize: 12,
            pageIndex,
          }],
        });
        fileName = 'annotated.pdf';
        break;
      }

      case 'sign': {
        const type = (formData.get('signType') as string) || 'signature';
        const x = parseFloat(formData.get('x') as string) || 50;
        const y = parseFloat(formData.get('y') as string) || 50;
        const pageIndex = parseInt(formData.get('pageIndex') as string) || 0;
        const checked = formData.get('checked') === 'true';
        const dateText = formData.get('dateText') as string || '';

        resultBuffer = await PDFSigner.sign(buffers[0], [{
          type: type as 'signature' | 'initial' | 'checkbox' | 'date',
          x,
          y,
          pageIndex,
          checked,
          text: dateText || undefined,
        }]);
        fileName = 'signed.pdf';
        break;
      }

      case 'redact': {
        const pageIndex = parseInt(formData.get('pageIndex') as string) || 0;
        const x = parseFloat(formData.get('x') as string) || 50;
        const y = parseFloat(formData.get('y') as string) || 50;
        const width = parseFloat(formData.get('width') as string) || 100;
        const height = parseFloat(formData.get('height') as string) || 20;

        resultBuffer = await PDFRedactor.redactArea(
          buffers[0],
          pageIndex,
          x,
          y,
          width,
          height
        );
        fileName = 'redacted.pdf';
        break;
      }

      case 'organize': {
        const action = formData.get('action') as string || 'reorder';
        const removePagesStr = formData.get('removePages') as string;
        const newOrderStr = formData.get('newOrder') as string;

        if (action === 'remove' && removePagesStr) {
          const pagesToRemove = removePagesStr
            .split(',')
            .map((p) => parseInt(p.trim()))
            .filter((p) => !isNaN(p));
          
          resultBuffer = await PDFOrganizer.removePages(buffers[0], pagesToRemove);
        } else if (action === 'reorder' && newOrderStr) {
          const newOrder = newOrderStr
            .split(',')
            .map((p) => parseInt(p.trim()))
            .filter((p) => !isNaN(p));
          
          resultBuffer = await PDFOrganizer.reorderPages(buffers[0], newOrder);
        } else {
          // Par défaut, retourner le PDF tel quel
          resultBuffer = buffers[0];
        }
        fileName = 'organized.pdf';
        break;
      }

      case 'protect': {
        const password = formData.get('password') as string;
        if (!password || password.length === 0) {
          throwHttp(400, { error: 'Le mot de passe est requis pour protéger le PDF' });
        }

        resultBuffer = await PDFSecurity.protectWithPassword(buffers[0], password);
        fileName = 'protected.pdf';
        break;
      }

      case 'unlock': {
        const password = formData.get('password') as string;
        if (!password || password.length === 0) {
          throwHttp(400, { error: 'Le mot de passe est requis pour déverrouiller le PDF' });
        }

        resultBuffer = await PDFSecurity.unlock(buffers[0], password);
        fileName = 'unlocked.pdf';
        break;
      }

      case 'watermark': {
        const watermarkText = formData.get('watermarkText') as string;
        const position = (formData.get('position') as string) || 'center';
        const opacity = parseFloat(formData.get('opacity') as string) || 0.3;
        const fontSize = parseFloat(formData.get('fontSize') as string) || 48;
        const angle = parseFloat(formData.get('angle') as string) || 45;

        if (!watermarkText) {
          throwHttp(400, { error: 'Le texte du filigrane est requis' });
        }

        resultBuffer = await PDFWatermark.addTextWatermark(buffers[0], watermarkText, {
          position: position as 'top-left' | 'top-center' | 'top-right' | 'center-left' | 'center' | 'center-right' | 'bottom-left' | 'bottom-center' | 'bottom-right',
          opacity,
          fontSize,
          angle,
        });
        fileName = 'watermarked.pdf';
        break;
      }

      case 'rotate': {
        const angle = parseInt(formData.get('angle') as string) || 90;
        const pageIndexStr = formData.get('pageIndex') as string;

        if (![90, 180, 270, -90, -180, -270].includes(angle)) {
          throwHttp(400, { error: 'Angle invalide. Utilisez 90, 180, 270, -90, -180 ou -270' });
        }

        if (pageIndexStr !== null && pageIndexStr !== undefined) {
          const pageIndex = parseInt(pageIndexStr);
          resultBuffer = await PDFTransform.rotatePage(buffers[0], pageIndex, angle as 90 | 180 | 270 | -90 | -180 | -270);
        } else {
          resultBuffer = await PDFTransform.rotateAllPages(buffers[0], angle as 90 | 180 | 270 | -90 | -180 | -270);
        }
        fileName = 'rotated.pdf';
        break;
      }

      case 'crop': {
        const x = parseFloat(formData.get('x') as string) || 0;
        const y = parseFloat(formData.get('y') as string) || 0;
        const width = parseFloat(formData.get('width') as string);
        const height = parseFloat(formData.get('height') as string);
        const pageIndexStr = formData.get('pageIndex') as string;

        if (!width || !height || width <= 0 || height <= 0) {
          throwHttp(400, { error: 'La largeur et la hauteur doivent être spécifiées et positives' });
        }

        if (pageIndexStr !== null && pageIndexStr !== undefined) {
          const pageIndex = parseInt(pageIndexStr);
          resultBuffer = await PDFTransform.cropPage(buffers[0], pageIndex, x, y, width, height);
        } else {
          resultBuffer = await PDFTransform.cropAllPages(buffers[0], x, y, width, height);
        }
        fileName = 'cropped.pdf';
        break;
      }

      case 'delete-pages': {
        const pagesToDeleteStr = formData.get('pages') as string;
        if (!pagesToDeleteStr) {
          throwHttp(400, { error: 'Les pages à supprimer doivent être spécifiées' });
        }

        const pagesToDelete = pagesToDeleteStr
          .split(',')
          .map((p) => parseInt(p.trim()))
          .filter((p) => !isNaN(p));

        if (pagesToDelete.length === 0) {
          throwHttp(400, { error: 'Aucune page valide à supprimer' });
        }

        resultBuffer = await PDFOrganizer.removePages(buffers[0], pagesToDelete);
        fileName = 'pages-removed.pdf';
        break;
      }

      default:
        throwHttp(400, { error: `Outil non reconnu: ${tool}` });
    }

    await recordConversion({
      userId,
      inputFileName: files[0]?.name || 'pdf',
      inputFormat: inferExt(files[0]?.name || '') || 'pdf',
      outputFormat,
      fileSizeBytes: totalBytes,
      creditsUsed,
      status: 'COMPLETED',
    });

    // Retourner le fichier traité
    return new NextResponse(resultBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': resultBuffer.length.toString(),
        'X-Usage-Mode': creditsUsed > 0 ? 'credits' : 'quota',
        'X-Usage-Credits-Used': String(creditsUsed),
      },
    });
  } catch (error) {
    console.error('Erreur traitement PDF:', error);
    if (creditsUsed > 0) await refundCredits({ userId, credits: creditsUsed });
    await recordConversion({
      userId,
      inputFileName: 'pdf',
      inputFormat: 'pdf',
      outputFormat: 'pdf',
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
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}
