import { ValidationError } from '../../errors/AppError';

export const MAX_FILE_BYTES = 10 * 1024 * 1024;

const ALLOWED_MIMES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const EXT_BY_MIME: Record<string, string> = {
  'application/pdf': '.pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
};

export function isAllowedMime(mimetype: string): boolean {
  return ALLOWED_MIMES.has(mimetype);
}

export function extensionForMime(mimetype: string): string | undefined {
  return EXT_BY_MIME[mimetype];
}

export function assertValidUploadFile(file: {
  size: number;
  mimetype: string;
  originalname: string;
}): void {
  if (file.size > MAX_FILE_BYTES) {
    throw new ValidationError('File size must not exceed 10MB', 'Invalid file');
  }
  if (!file.mimetype || !isAllowedMime(file.mimetype)) {
    throw new ValidationError('Only PDF or DOCX files are allowed', 'Invalid file');
  }
}
