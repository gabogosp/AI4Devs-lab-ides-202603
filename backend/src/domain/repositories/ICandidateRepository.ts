import type { CreateCandidateRequestValidated, CreateCandidateResponse } from '../../types/api';

export interface ICandidateRepository {
  existsByEmail(email: string): Promise<boolean>;
  createWithRelations(input: CreateCandidateRequestValidated): Promise<CreateCandidateResponse>;
}
