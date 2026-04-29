import path from 'path';
import fs from 'fs';
import { DuplicateEmailError } from '../../errors/AppError';
import { ValidationError } from '../../errors/AppError';
import type { ICandidateRepository } from '../../domain/repositories/ICandidateRepository';
import { prismaCandidateRepository } from '../../infrastructure/repositories/prismaCandidateRepository';
import type { CreateCandidateRequestValidated } from '../../types/api';
import type { CreateCandidateResponse } from '../../types/api';

function getUploadRoot(): string {
  return path.resolve(process.env.UPLOAD_DIR || './uploads');
}

/**
 * Ensures resume path refers to an existing file inside UPLOAD_DIR (basename only — prevents path traversal).
 */
export function assertCvFileResolvable(cv: { filePath: string; fileType: string }): void {
  const basename = path.basename(cv.filePath);
  const resolved = path.resolve(getUploadRoot(), basename);
  const root = path.resolve(getUploadRoot());
  if (!resolved.startsWith(root)) {
    throw new ValidationError('Invalid resume file path');
  }
  if (!fs.existsSync(resolved)) {
    throw new ValidationError('Resume file not found — upload the file first');
  }
}

export async function createCandidate(
  input: CreateCandidateRequestValidated,
  repository: ICandidateRepository = prismaCandidateRepository,
): Promise<CreateCandidateResponse> {
  const email = input.email.toLowerCase();
  if (await repository.existsByEmail(email)) {
    throw new DuplicateEmailError();
  }
  if (input.cv) {
    assertCvFileResolvable(input.cv);
  }
  return repository.createWithRelations({ ...input, email });
}
