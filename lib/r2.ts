import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import fs from 'fs/promises'
import path from 'path'

// Check if R2 is configured
const isR2Configured = !!(
  process.env.R2_ACCOUNT_ID &&
  process.env.R2_ACCESS_KEY_ID &&
  process.env.R2_SECRET_ACCESS_KEY &&
  process.env.R2_BUCKET_NAME
)

// R2 client configuration (only created if configured)
export const r2Client = isR2Configured
  ? new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    })
  : null

const BUCKET_NAME = process.env.R2_BUCKET_NAME!
const LOCAL_STORAGE_DIR = path.join(process.cwd(), 'uploads')

/**
 * Ensure local storage directory exists
 */
async function ensureLocalStorageDir(key: string): Promise<void> {
  const dir = path.join(LOCAL_STORAGE_DIR, path.dirname(key))
  await fs.mkdir(dir, { recursive: true })
}

/**
 * Upload file to R2 or local storage
 */
export async function uploadToR2(
  key: string,
  body: Buffer,
  contentType: string
): Promise<string> {
  if (isR2Configured && r2Client) {
    await r2Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: body,
        ContentType: contentType,
      })
    )
  } else {
    // Local storage fallback for development
    await ensureLocalStorageDir(key)
    const filePath = path.join(LOCAL_STORAGE_DIR, key)
    await fs.writeFile(filePath, body)
    console.log(`[Dev] File stored locally: ${filePath}`)
  }
  return key
}

/**
 * Get signed URL for downloading file from R2
 */
export async function getSignedDownloadUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  if (isR2Configured && r2Client) {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })
    return getSignedUrl(r2Client, command, { expiresIn })
  } else {
    // Local storage fallback - return local path (only works in dev)
    return `/api/files/local/${encodeURIComponent(key)}`
  }
}

/**
 * Delete file from R2 or local storage
 */
export async function deleteFromR2(key: string): Promise<void> {
  if (isR2Configured && r2Client) {
    await r2Client.send(
      new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      })
    )
  } else {
    // Local storage fallback
    const filePath = path.join(LOCAL_STORAGE_DIR, key)
    try {
      await fs.unlink(filePath)
    } catch {
      // File might not exist, ignore
    }
  }
}

/**
 * Generate storage key for user file
 */
export function generateFileKey(userId: string, filename: string): string {
  const timestamp = Date.now()
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_')
  return `files/${userId}/${timestamp}-${sanitizedFilename}`
}
