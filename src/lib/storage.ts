/**
 * 🗄️ SERVICE DE STOCKAGE - MinIO / S3
 *
 * Compatible MinIO (S3-compatible) via @aws-sdk/client-s3
 * Config via variables d'environnement :
 *   S3_ENDPOINT, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_BUCKET, AWS_REGION
 */

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

function createS3Client(): S3Client {
  const endpoint = process.env.S3_ENDPOINT;
  const region = process.env.AWS_REGION || 'us-east-1';

  return new S3Client({
    region,
    ...(endpoint && {
      endpoint,
      forcePathStyle: true, // Requis pour MinIO
    }),
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
  });
}

function getBucket(): string {
  const bucket = process.env.S3_BUCKET;
  if (!bucket) throw new Error('S3_BUCKET non configuré');
  return bucket;
}

function isStorageConfigured(): boolean {
  return !!(
    process.env.S3_ENDPOINT &&
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.S3_BUCKET
  );
}

/**
 * Upload un fichier dans le bucket MinIO
 * @returns la clé (chemin) du fichier
 */
export async function uploadFile(
  key: string,
  body: Buffer | Uint8Array,
  contentType: string,
  metadata?: Record<string, string>
): Promise<string> {
  if (!isStorageConfigured()) {
    throw new Error('Stockage non configuré (S3_ENDPOINT, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_BUCKET requis)');
  }

  const client = createS3Client();
  const bucket = getBucket();

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      Metadata: metadata,
    })
  );

  return key;
}

/**
 * Génère une URL de téléchargement signée (expire dans 1h par défaut)
 */
export async function getPresignedDownloadUrl(key: string, expiresInSeconds = 3600): Promise<string> {
  if (!isStorageConfigured()) {
    throw new Error('Stockage non configuré');
  }

  const client = createS3Client();
  const bucket = getBucket();

  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  return getSignedUrl(client, command, { expiresIn: expiresInSeconds });
}

/**
 * Génère une URL d'upload signée (expire dans 15 min par défaut)
 */
export async function getPresignedUploadUrl(key: string, contentType: string, expiresInSeconds = 900): Promise<string> {
  if (!isStorageConfigured()) {
    throw new Error('Stockage non configuré');
  }

  const { getSignedUrl: getSignedUrlUpload } = await import('@aws-sdk/s3-request-presigner');
  const client = createS3Client();
  const bucket = getBucket();

  const { PutObjectCommand: PutCmd } = await import('@aws-sdk/client-s3');
  const command = new PutCmd({ Bucket: bucket, Key: key, ContentType: contentType });
  return getSignedUrlUpload(client, command, { expiresIn: expiresInSeconds });
}

/**
 * Supprime un fichier du bucket
 */
export async function deleteFile(key: string): Promise<void> {
  if (!isStorageConfigured()) return;

  const client = createS3Client();
  const bucket = getBucket();

  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}

/**
 * Vérifie si un fichier existe
 */
export async function fileExists(key: string): Promise<boolean> {
  if (!isStorageConfigured()) return false;

  const client = createS3Client();
  const bucket = getBucket();

  try {
    await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return true;
  } catch {
    return false;
  }
}

export { isStorageConfigured };
