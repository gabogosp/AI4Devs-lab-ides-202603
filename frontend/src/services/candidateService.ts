import axios, { type AxiosError } from 'axios';
import { apiUrl } from '../config';
import type {
  ApiErrorBody,
  CreateCandidateRequest,
  CreateCandidateResponse,
} from '../types/candidate';

export class ApiRequestError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly detail?: string,
  ) {
    super(message);
    this.name = 'ApiRequestError';
    Object.setPrototypeOf(this, ApiRequestError.prototype);
  }
}

function parseAxiosError(err: unknown): ApiRequestError {
  if (!axios.isAxiosError(err)) {
    return new ApiRequestError('Unable to reach the server. Please check your connection.');
  }
  const ax = err as AxiosError<ApiErrorBody>;
  if (ax.response?.data?.message) {
    const { message, error } = ax.response.data;
    return new ApiRequestError(message, ax.response.status, error);
  }
  if (ax.request && !ax.response) {
    return new ApiRequestError(
      'Unable to reach the server. Please check your connection.',
    );
  }
  return new ApiRequestError(ax.message || 'Request failed', ax.response?.status);
}

export async function uploadCv(
  file: File,
): Promise<{ filePath: string; fileType: string }> {
  const formData = new FormData();
  formData.append('file', file);
  try {
    const res = await axios.post(apiUrl('/upload'), formData);
    return res.data as { filePath: string; fileType: string };
  } catch (e) {
    throw parseAxiosError(e);
  }
}

export async function createCandidate(
  body: CreateCandidateRequest,
): Promise<CreateCandidateResponse> {
  try {
    const res = await axios.post(apiUrl('/candidates'), body);
    return res.data as CreateCandidateResponse;
  } catch (e) {
    throw parseAxiosError(e);
  }
}
