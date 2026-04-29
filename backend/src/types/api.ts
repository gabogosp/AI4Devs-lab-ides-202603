/**
 * API DTOs aligned with docs/api-spec.yml (CreateCandidateRequest and nested schemas).
 */

export interface CreateEducationInput {
  institution: string;
  title: string;
  startDate: string;
  endDate?: string | null;
}

export interface CreateWorkExperienceInput {
  company: string;
  position: string;
  description?: string | null;
  startDate: string;
  endDate?: string | null;
}

export interface CreateResumeInput {
  filePath: string;
  fileType: string;
}

export interface CreateCandidateRequestValidated {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  educations?: CreateEducationInput[];
  workExperiences?: CreateWorkExperienceInput[];
  cv?: CreateResumeInput;
}

export interface CreateCandidateResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  address?: string | null;
}

export interface FileUploadResponse {
  filePath: string;
  fileType: string;
}

export interface ErrorResponseBody {
  message: string;
  error?: string;
}
