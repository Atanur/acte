// ─────────────────────────────────────────────────────────
// File Upload — Backend (S3-compatible / Cloudflare R2)
// ─────────────────────────────────────────────────────────
// Provides S3-compatible file upload and management
// using @aws-sdk/client-s3. Designed for Cloudflare R2
// but works with any S3-compatible provider.
// ─────────────────────────────────────────────────────────

import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  type PutObjectCommandInput,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

interface UploadConfig {
  endpoint: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  publicUrlBase?: string;
}

function getConfig(): UploadConfig {
  return {
    endpoint: process.env.R2_ENDPOINT ?? process.env.S3_ENDPOINT ?? "",
    region: process.env.S3_REGION ?? "auto",
    accessKeyId: process.env.R2_ACCESS_KEY_ID ?? process.env.S3_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? process.env.S3_SECRET_ACCESS_KEY ?? "",
    bucket: process.env.R2_BUCKET ?? process.env.S3_BUCKET ?? "acte-uploads",
    publicUrlBase: process.env.R2_PUBLIC_URL ?? process.env.S3_PUBLIC_URL,
  };
}

let s3Client: S3Client | null = null;

function getS3Client(): S3Client {
  if (!s3Client) {
    const config = getConfig();
    s3Client = new S3Client({
      endpoint: config.endpoint,
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      forcePathStyle: true,
    });
  }
  return s3Client;
}

/**
 * Upload a file to S3-compatible storage.
 *
 * @param file        - The file buffer or Blob to upload.
 * @param key         - The object key (path) in the bucket.
 * @param contentType - The MIME type of the file.
 * @returns           - The public URL of the uploaded file, if available.
 */
export async function uploadFile(
  file: Buffer | Uint8Array | Blob,
  key: string,
  contentType?: string,
): Promise<{ key: string; url: string | null }> {
  const config = getConfig();
  const client = getS3Client();

  const input: PutObjectCommandInput = {
    Bucket: config.bucket,
    Key: key,
    Body: file,
    ContentType: contentType,
  };

  const command = new PutObjectCommand(input);
  await client.send(command);

  const url = config.publicUrlBase ? `${config.publicUrlBase.replace(/\/+$/, "")}/${key}` : null;

  return { key, url };
}

/**
 * Delete a file from S3-compatible storage.
 *
 * @param key - The object key to delete.
 */
export async function deleteFile(key: string): Promise<void> {
  const config = getConfig();
  const client = getS3Client();

  const command = new DeleteObjectCommand({
    Bucket: config.bucket,
    Key: key,
  });

  await client.send(command);
}

/**
 * Generate a pre-signed URL for direct upload from the client.
 *
 * @param key         - The object key to upload to.
 * @param contentType - The MIME type of the file.
 * @param expiresIn   - URL expiration time in seconds (default: 3600).
 * @returns           - The pre-signed URL string.
 */
export async function getSignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn = 3600,
): Promise<string> {
  const config = getConfig();
  const client = getS3Client();

  const command = new PutObjectCommand({
    Bucket: config.bucket,
    Key: key,
    ContentType: contentType,
  });

  const signedUrl = await getSignedUrl(client, command, { expiresIn });
  return signedUrl;
}

/**
 * Generate a pre-signed download URL for private objects.
 */
export async function getSignedDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
  const config = getConfig();
  const client = getS3Client();

  const command = new GetObjectCommand({
    Bucket: config.bucket,
    Key: key,
  });

  const signedUrl = await getSignedUrl(client, command, { expiresIn });
  return signedUrl;
}
