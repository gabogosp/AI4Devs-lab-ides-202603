import { Router } from 'express';
import multer from 'multer';
import { MAX_FILE_BYTES } from '../application/validators/uploadValidator';
import { postUpload } from '../presentation/controllers/uploadController';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_BYTES },
});

const router = Router();

router.post('/upload', upload.single('file'), postUpload);

export { router as uploadRouter };
