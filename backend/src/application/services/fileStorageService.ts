import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import type { FileUploadResponse } from '../../types/api';
import { extensionForMime } from '../validators/uploadValidator';

export function getUploadRootRelativePrefix(): string {
  const dir = process.env.UPLOAD_DIR || './uploads';
  const basename = path.basename(path.resolve(dir));
  return basename || 'uploads';
}

/**
 * Persists buffer to UPLOAD_DIR with a UUID filename; returns paths suitable for CreateResumeRequest.
 */
export async function saveUploadedBuffer(
  buffer: Buffer,
  mimetype: string,
): Promise<FileUploadResponse> {
  const ext = extensionForMime(mimetype);
  if (!ext) {
    throw new Error('Unsupported MIME type for storage');
  }
  const uploadDir = path.resolve(process.env.UPLOAD_DIR || './uploads');
  await fs.mkdir(uploadDir, { recursive: true });
  const filename = `${randomUUID()}${ext}`;
  const absolutePath = path.join(uploadDir, filename);
  await fs.writeFile(absolutePath, buffer);
  const relativePath = path.join(getUploadRootRelativePrefix(), filename).replace(/\\/g, '/');
  return {
    filePath: relativePath,
    fileType: mimetype,
  };
}
