import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { saveUploadedBuffer } from '../services/fileStorageService';

describe('saveUploadedBuffer', () => {
  const prev = process.env.UPLOAD_DIR;

  afterEach(() => {
    process.env.UPLOAD_DIR = prev;
  });

  it('writes file and returns relative path and mime', async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'lti-fs-'));
    process.env.UPLOAD_DIR = dir;

    const result = await saveUploadedBuffer(Buffer.from('%PDF'), 'application/pdf');

    expect(result.fileType).toBe('application/pdf');
    expect(result.filePath).toMatch(/\.pdf$/);

    const basename = path.basename(result.filePath);
    const absolute = path.join(dir, basename);
    const stat = await fs.stat(absolute);
    expect(stat.isFile()).toBe(true);

    await fs.unlink(absolute);
    await fs.rmdir(dir);
  });
});
