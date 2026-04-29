import axios, { AxiosError } from 'axios';
import { createCandidate, uploadCv } from '../services/candidateService';

jest.mock('axios', () => {
  const actual = jest.requireActual<typeof import('axios')>('axios');
  return {
    ...actual,
    post: jest.fn(),
  };
});

const mockedPost = axios.post as jest.MockedFunction<typeof axios.post>;

describe('candidateService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('uploadCv posts multipart and returns data', async () => {
    mockedPost.mockResolvedValue({
      data: { filePath: 'uploads/x.pdf', fileType: 'application/pdf' },
    });
    const file = new File(['%PDF'], 'cv.pdf', { type: 'application/pdf' });
    const result = await uploadCv(file);
    expect(result.filePath).toBe('uploads/x.pdf');
    expect(mockedPost).toHaveBeenCalled();
    const formData = mockedPost.mock.calls[0][1] as FormData;
    expect(formData).toBeInstanceOf(FormData);
  });

  it('createCandidate maps 400 response to ApiRequestError', async () => {
    const err = new AxiosError('Request failed');
    err.response = {
      status: 400,
      data: { message: 'Email already registered', error: 'EMAIL_DUPLICATE' },
    } as AxiosError['response'];
    mockedPost.mockRejectedValue(err);

    await expect(
      createCandidate({
        firstName: 'Alice',
        lastName: 'Brown',
        email: 'dup@example.com',
      }),
    ).rejects.toThrow('Email already registered');
  });
});
