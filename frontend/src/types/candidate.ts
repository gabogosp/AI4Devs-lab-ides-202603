export interface CreateEducationRequest {
  institution: string;
  title: string;
  startDate: string;
  endDate?: string | null;
}

export interface CreateWorkExperienceRequest {
  company: string;
  position: string;
  description?: string | null;
  startDate: string;
  endDate?: string | null;
}

export interface CreateResumeRequest {
  filePath: string;
  fileType: string;
}

export interface CreateCandidateRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  educations?: CreateEducationRequest[];
  workExperiences?: CreateWorkExperienceRequest[];
  cv?: CreateResumeRequest;
}

export interface CreateCandidateResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  address?: string | null;
}

export interface ApiErrorBody {
  message: string;
  error?: string;
}

export interface EducationRow {
  institution: string;
  title: string;
  startDate: string;
  endDate: string;
}

export interface WorkExperienceRow {
  company: string;
  position: string;
  description: string;
  startDate: string;
  endDate: string;
}

export interface CandidateFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  educations: EducationRow[];
  workExperiences: WorkExperienceRow[];
  cvFile: File | null;
}
