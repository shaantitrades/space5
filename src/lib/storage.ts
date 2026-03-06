/**
 * SERVICE DE STOCKAGE - MinIO / S3
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
      forcePathStyle: true,
    }),
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
  });
}

function getBucket(): string {
  const bucket = process.env.S3_BUCKET;
  if (!bucket) throw new Error('S3_BUCKET non configure');
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

export async function uploadFile(
  key: string,
  body: Buffer | Uint8Array,
  contentType: string,
  metadata?: Record<string, string>
): Promise<string> {
  if (!isStorageConfigured()) {
    throw new Error('Stockage non configure');
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

export async function getPresignedDownloadUrl(key: string, expiresInSeconds = 3600): Promise<string> {
  if (!isStorageConfigured()) {
    throw new Error('Stockage non configure');
  }

  const client = createS3Client();
  const bucket = getBucket();

  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  return getSignedUrl(client, command, { expiresIn: expiresInSeconds });
}

export async function getPresignedUploadUrl(key: string, contentType: string, expiresInSeconds = 900): Promise<string> {
  if (!isStorageConfigured()) {
    throw new Error('Stockage non configure');
  }

  const client = createS3Client();
  const bucket = getBucket();

  const command = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType });
  return getSignedUrl(client, command, { expiresIn: expiresInSeconds });
}

export async function deleteFile(key: string): Promise<void> {
  if (!isStorageConfigured()) return;

  const client = createS3Client();
  const bucket = getBucket();

  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}

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
