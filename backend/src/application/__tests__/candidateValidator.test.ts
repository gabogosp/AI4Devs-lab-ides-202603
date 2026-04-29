import { validateCreateCandidateRequest } from '../validators/candidateValidator';
import { ValidationError } from '../../errors/AppError';

describe('validateCreateCandidateRequest', () => {
  it('accepts minimal valid payload', () => {
    const r = validateCreateCandidateRequest({
      firstName: 'María',
      lastName: 'López',
      email: 'maria@example.com',
    });
    expect(r.firstName).toBe('María');
    expect(r.lastName).toBe('López');
    expect(r.email).toBe('maria@example.com');
  });

  it('trims email to lowercase', () => {
    const r = validateCreateCandidateRequest({
      firstName: 'John',
      lastName: 'Doe',
      email: 'John.Doe@Example.COM',
    });
    expect(r.email).toBe('john.doe@example.com');
  });

  it('rejects empty first name', () => {
    expect(() =>
      validateCreateCandidateRequest({
        firstName: '',
        lastName: 'Doe',
        email: 'a@b.co',
      }),
    ).toThrow(ValidationError);
  });

  it('rejects short first name', () => {
    expect(() =>
      validateCreateCandidateRequest({
        firstName: 'A',
        lastName: 'Doe',
        email: 'a@b.co',
      }),
    ).toThrow(ValidationError);
  });

  it('rejects invalid email', () => {
    expect(() =>
      validateCreateCandidateRequest({
        firstName: 'John',
        lastName: 'Doe',
        email: 'not-an-email',
      }),
    ).toThrow(ValidationError);
  });

  it('rejects invalid phone when provided', () => {
    expect(() =>
      validateCreateCandidateRequest({
        firstName: 'John',
        lastName: 'Doe',
        email: 'a@b.co',
        phone: '12345',
      }),
    ).toThrow(ValidationError);
  });

  it('accepts valid Spanish mobile phone', () => {
    const r = validateCreateCandidateRequest({
      firstName: 'John',
      lastName: 'Doe',
      email: 'a@b.co',
      phone: '612345678',
    });
    expect(r.phone).toBe('612345678');
  });

  it('rejects address longer than 100 chars', () => {
    expect(() =>
      validateCreateCandidateRequest({
        firstName: 'John',
        lastName: 'Doe',
        email: 'a@b.co',
        address: 'x'.repeat(101),
      }),
    ).toThrow(ValidationError);
  });

  it('rejects more than three educations', () => {
    expect(() =>
      validateCreateCandidateRequest({
        firstName: 'John',
        lastName: 'Doe',
        email: 'a@b.co',
        educations: [
          { institution: 'A', title: 'T', startDate: '2020-01-01T00:00:00.000Z' },
          { institution: 'B', title: 'T', startDate: '2020-01-01T00:00:00.000Z' },
          { institution: 'C', title: 'T', startDate: '2020-01-01T00:00:00.000Z' },
          { institution: 'D', title: 'T', startDate: '2020-01-01T00:00:00.000Z' },
        ],
      }),
    ).toThrow(ValidationError);
  });

  it('accepts three educations', () => {
    const educations = [
      { institution: 'A', title: 'T', startDate: '2020-01-01T00:00:00.000Z' },
      { institution: 'B', title: 'T', startDate: '2020-01-01T00:00:00.000Z' },
      { institution: 'C', title: 'T', startDate: '2020-01-01T00:00:00.000Z' },
    ];
    const r = validateCreateCandidateRequest({
      firstName: 'John',
      lastName: 'Doe',
      email: 'a@b.co',
      educations,
    });
    expect(r.educations).toHaveLength(3);
  });

  it('rejects education end before start', () => {
    expect(() =>
      validateCreateCandidateRequest({
        firstName: 'John',
        lastName: 'Doe',
        email: 'a@b.co',
        educations: [
          {
            institution: 'Uni',
            title: 'Degree',
            startDate: '2020-01-01T00:00:00.000Z',
            endDate: '2019-01-01T00:00:00.000Z',
          },
        ],
      }),
    ).toThrow(ValidationError);
  });

  it('validates work experience description length', () => {
    expect(() =>
      validateCreateCandidateRequest({
        firstName: 'John',
        lastName: 'Doe',
        email: 'a@b.co',
        workExperiences: [
          {
            company: 'Co',
            position: 'Dev',
            startDate: '2020-01-01T00:00:00.000Z',
            description: 'x'.repeat(201),
          },
        ],
      }),
    ).toThrow(ValidationError);
  });

  it('requires cv filePath and fileType when cv present', () => {
    expect(() =>
      validateCreateCandidateRequest({
        firstName: 'John',
        lastName: 'Doe',
        email: 'a@b.co',
        cv: { filePath: '', fileType: 'application/pdf' },
      }),
    ).toThrow(ValidationError);
  });

  it('accepts cv reference', () => {
    const r = validateCreateCandidateRequest({
      firstName: 'John',
      lastName: 'Doe',
      email: 'a@b.co',
      cv: {
        filePath: 'uploads/abc.pdf',
        fileType: 'application/pdf',
      },
    });
    expect(r.cv?.filePath).toBe('uploads/abc.pdf');
  });
});
