import type { Request, Response, NextFunction } from 'express';
import { assertValidUploadFile } from '../../application/validators/uploadValidator';
import { saveUploadedBuffer } from '../../application/services/fileStorageService';

export async function postUpload(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({
        message: 'Invalid file',
        error: 'file field is required (multipart/form-data)',
      });
      return;
    }
    assertValidUploadFile({
      size: file.size,
      mimetype: file.mimetype,
      originalname: file.originalname,
    });
    const data = await saveUploadedBuffer(file.buffer, file.mimetype);
    res.status(200).json(data);
  } catch (e) {
    next(e);
  }
}
