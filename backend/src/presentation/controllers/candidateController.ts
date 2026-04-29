import type { Request, Response, NextFunction } from 'express';
import { validateCreateCandidateRequest } from '../../application/validators/candidateValidator';
import { createCandidate } from '../../application/services/candidateService';

export async function postCandidate(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const validated = validateCreateCandidateRequest(req.body);
    const data = await createCandidate(validated);
    res.status(201).json(data);
  } catch (e) {
    next(e);
  }
}
