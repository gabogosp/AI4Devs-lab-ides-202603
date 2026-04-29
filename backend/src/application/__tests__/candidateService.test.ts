import {
  createCandidate,
  assertCvFileResolvable,
} from '../services/candidateService';
import type { ICandidateRepository } from '../../domain/repositories/ICandidateRepository';
import { DuplicateEmailError } from '../../errors/AppError';
import fs from 'fs';
import os from 'os';
import path from 'path';

describe('createCandidate', () => {
  const mockRepo: jest.Mocked<ICandidateRepository> = {
    existsByEmail: jest.fn(),
    createWithRelations: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates candidate when email is unique', async () => {
    mockRepo.existsByEmail.mockResolvedValue(false);
    mockRepo.createWithRelations.mockResolvedValue({
      id: 1,
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
    });

    const result = await createCandidate(
      {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
      },
      mockRepo,
    );

    expect(result.id).toBe(1);
    expect(mockRepo.existsByEmail).toHaveBeenCalledWith('jane@example.com');
    expect(mockRepo.createWithRelations).toHaveBeenCalled();
  });

  it('throws DuplicateEmailError when email exists', async () => {
    mockRepo.existsByEmail.mockResolvedValue(true);

    await expect(
      createCandidate(
        {
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane@example.com',
        },
        mockRepo,
      ),
    ).rejects.toThrow(DuplicateEmailError);

    expect(mockRepo.createWithRelations).not.toHaveBeenCalled();
  });
});

describe('assertCvFileResolvable', () => {
  const prev = process.env.UPLOAD_DIR;

  afterEach(() => {
    process.env.UPLOAD_DIR = prev;
  });

  it('throws when file does not exist', () => {
    process.env.UPLOAD_DIR = os.tmpdir();
    expect(() =>
      assertCvFileResolvable({
        filePath: 'uploads/nonexistent-uuid.pdf',
        fileType: 'application/pdf',
      }),
    ).toThrow();
  });

  it('passes when file exists under upload dir', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lti-upload-'));
    process.env.UPLOAD_DIR = dir;
    const name = 'test-file.pdf';
    fs.writeFileSync(path.join(dir, name), Buffer.from('%PDF-1.4'));
    expect(() =>
      assertCvFileResolvable({
        filePath: `uploads/${name}`,
        fileType: 'application/pdf',
      }),
    ).not.toThrow();
    fs.unlinkSync(path.join(dir, name));
    fs.rmdirSync(dir);
  });
});
