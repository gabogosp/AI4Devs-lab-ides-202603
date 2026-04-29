import { assertValidUploadFile, MAX_FILE_BYTES } from '../validators/uploadValidator';
import { ValidationError } from '../../errors/AppError';

describe('assertValidUploadFile', () => {
  it('accepts PDF within limit', () => {
    expect(() =>
      assertValidUploadFile({
        size: 100,
        mimetype: 'application/pdf',
        originalname: 'cv.pdf',
      }),
    ).not.toThrow();
  });

  it('accepts DOCX within limit', () => {
    expect(() =>
      assertValidUploadFile({
        size: 100,
        mimetype:
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        originalname: 'cv.docx',
      }),
    ).not.toThrow();
  });

  it('rejects oversized file', () => {
    expect(() =>
      assertValidUploadFile({
        size: MAX_FILE_BYTES + 1,
        mimetype: 'application/pdf',
        originalname: 'big.pdf',
      }),
    ).toThrow(ValidationError);
  });

  it('rejects wrong mime type', () => {
    expect(() =>
      assertValidUploadFile({
        size: 100,
        mimetype: 'image/png',
        originalname: 'x.png',
      }),
    ).toThrow(ValidationError);
  });
});
