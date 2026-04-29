import {
  validateCandidateForm,
  validateCvFile,
  MAX_CV_BYTES,
} from '../utils/candidateFormValidation';
import type { CandidateFormValues } from '../types/candidate';

const baseValues = (): CandidateFormValues => ({
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane@example.com',
  phone: '',
  address: '',
  educations: [],
  workExperiences: [],
  cvFile: null,
});

describe('validateCandidateForm', () => {
  it('passes for minimal valid values', () => {
    const r = validateCandidateForm(baseValues());
    expect(r.valid).toBe(true);
    expect(Object.keys(r.errors)).toHaveLength(0);
  });

  it('fails when first name too short', () => {
    const r = validateCandidateForm({
      ...baseValues(),
      firstName: 'A',
    });
    expect(r.valid).toBe(false);
    expect(r.errors.firstName).toBeDefined();
  });

  it('fails when email invalid', () => {
    const r = validateCandidateForm({
      ...baseValues(),
      email: 'not-email',
    });
    expect(r.valid).toBe(false);
    expect(r.errors.email).toBeDefined();
  });

  it('fails when more than three educations', () => {
    const educations = [
      { institution: 'A', title: 'T', startDate: '2020-01-01', endDate: '' },
      { institution: 'B', title: 'T', startDate: '2020-01-01', endDate: '' },
      { institution: 'C', title: 'T', startDate: '2020-01-01', endDate: '' },
      { institution: 'D', title: 'T', startDate: '2020-01-01', endDate: '' },
    ];
    const r = validateCandidateForm({
      ...baseValues(),
      educations,
    });
    expect(r.valid).toBe(false);
    expect(r.errors.educations).toBeDefined();
  });
});

describe('validateCvFile', () => {
  it('accepts pdf mime', () => {
    const f = new File(['x'], 'cv.pdf', { type: 'application/pdf' });
    expect(validateCvFile(f)).toBeNull();
  });

  it('rejects large file', () => {
    const buf = new Uint8Array(MAX_CV_BYTES + 1);
    const f = new File([buf], 'big.pdf', { type: 'application/pdf' });
    expect(validateCvFile(f)).not.toBeNull();
  });
});
