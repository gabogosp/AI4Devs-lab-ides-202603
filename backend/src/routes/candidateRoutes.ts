import { Router } from 'express';
import { postCandidate } from '../presentation/controllers/candidateController';

const router = Router();

router.post('/candidates', postCandidate);

export { router as candidateRouter };
