import React, { useState } from 'react';
import { Alert, Button, Container, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import IdentitySection from '../components/candidate/IdentitySection';
import EducationSection from '../components/candidate/EducationSection';
import WorkExperienceSection from '../components/candidate/WorkExperienceSection';
import CvUploadSection from '../components/candidate/CvUploadSection';
import {
  ApiRequestError,
  createCandidate,
  uploadCv,
} from '../services/candidateService';
import type {
  CandidateFormValues,
  CreateCandidateRequest,
  EducationRow,
  WorkExperienceRow,
} from '../types/candidate';
import {
  dateInputToIso,
  validateCandidateForm,
  type FieldErrors,
} from '../utils/candidateFormValidation';

const emptyEducationRow = (): EducationRow => ({
  institution: '',
  title: '',
  startDate: '',
  endDate: '',
});

const emptyWorkRow = (): WorkExperienceRow => ({
  company: '',
  position: '',
  description: '',
  startDate: '',
  endDate: '',
});

const initialForm = (): CandidateFormValues => ({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  educations: [],
  workExperiences: [],
  cvFile: null,
});

const AddCandidatePage: React.FC = () => {
  const [values, setValues] = useState<CandidateFormValues>(initialForm);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const setIdentity = (
    field: 'firstName' | 'lastName' | 'email' | 'phone' | 'address',
    v: string,
  ) => {
    setValues((prev) => ({ ...prev, [field]: v }));
  };

  const setEducation = (
    index: number,
    field: keyof EducationRow,
    v: string,
  ) => {
    setValues((prev) => {
      const next = [...prev.educations];
      next[index] = { ...next[index], [field]: v };
      return { ...prev, educations: next };
    });
  };

  const addEducation = () => {
    setValues((prev) => ({
      ...prev,
      educations: [...prev.educations, emptyEducationRow()],
    }));
  };

  const removeEducation = (index: number) => {
    setValues((prev) => ({
      ...prev,
      educations: prev.educations.filter((_, i) => i !== index),
    }));
  };

  const setWork = (
    index: number,
    field: keyof WorkExperienceRow,
    v: string,
  ) => {
    setValues((prev) => {
      const next = [...prev.workExperiences];
      next[index] = { ...next[index], [field]: v };
      return { ...prev, workExperiences: next };
    });
  };

  const addWork = () => {
    setValues((prev) => ({
      ...prev,
      workExperiences: [...prev.workExperiences, emptyWorkRow()],
    }));
  };

  const removeWork = (index: number) => {
    setValues((prev) => ({
      ...prev,
      workExperiences: prev.workExperiences.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSuccess(false);

    const { valid, errors: vErrors } = validateCandidateForm(values);
    setErrors(vErrors);
    if (!valid) {
      return;
    }

    setSubmitting(true);
    try {
      let cvPayload: CreateCandidateRequest['cv'];
      if (values.cvFile) {
        const uploaded = await uploadCv(values.cvFile);
        cvPayload = {
          filePath: uploaded.filePath,
          fileType: uploaded.fileType,
        };
      }

      const phone = values.phone.trim().replace(/\s+/g, '');
      const payload: CreateCandidateRequest = {
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim().toLowerCase(),
      };
      if (phone) {
        payload.phone = phone;
      }
      const addr = values.address.trim();
      if (addr) {
        payload.address = addr;
      }

      if (values.educations.length > 0) {
        payload.educations = values.educations.map((row) => ({
          institution: row.institution.trim(),
          title: row.title.trim(),
          startDate: dateInputToIso(row.startDate),
          endDate: row.endDate.trim() ? dateInputToIso(row.endDate) : null,
        }));
      }

      if (values.workExperiences.length > 0) {
        payload.workExperiences = values.workExperiences.map((row) => ({
          company: row.company.trim(),
          position: row.position.trim(),
          description: row.description.trim() || null,
          startDate: dateInputToIso(row.startDate),
          endDate: row.endDate.trim() ? dateInputToIso(row.endDate) : null,
        }));
      }

      if (cvPayload) {
        payload.cv = cvPayload;
      }

      await createCandidate(payload);
      setSuccess(true);
      setValues(initialForm());
      setErrors({});
    } catch (err) {
      if (err instanceof ApiRequestError) {
        const msg =
          err.detail === 'EMAIL_DUPLICATE' || err.message.includes('registered')
            ? 'This email is already registered. Use a different email.'
            : err.message;
        setSubmitError(msg);
      } else {
        setSubmitError('Something went wrong. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container className="py-4">
      <nav aria-label="Breadcrumb" className="mb-3">
        <Link to="/">Dashboard</Link>
        <span className="text-muted"> / </span>
        <span>Add candidate</span>
      </nav>

      <header className="mb-4">
        <h1 className="h3">Add candidate</h1>
        <p className="text-muted mb-0">
          Required fields are marked with *. Upload a resume after filling details,
          then submit once — the file is sent first, then the candidate record.
        </p>
      </header>

      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess(false)}>
          Candidate added successfully.
        </Alert>
      )}
      {submitError && (
        <Alert variant="danger" dismissible onClose={() => setSubmitError(null)}>
          {submitError}
        </Alert>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <IdentitySection
          values={{
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
            phone: values.phone,
            address: values.address,
          }}
          errors={errors}
          onChange={setIdentity}
        />

        <EducationSection
          rows={values.educations}
          errors={errors}
          onChange={setEducation}
          onAdd={addEducation}
          onRemove={removeEducation}
        />

        <WorkExperienceSection
          rows={values.workExperiences}
          errors={errors}
          onChange={setWork}
          onAdd={addWork}
          onRemove={removeWork}
        />

        <CvUploadSection
          file={values.cvFile}
          error={errors.cvFile}
          onChange={(f) => setValues((prev) => ({ ...prev, cvFile: f }))}
        />

        <div className="mt-4 d-flex flex-wrap gap-2">
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" aria-hidden />
                Saving…
              </>
            ) : (
              'Save candidate'
            )}
          </Button>
          <Link to="/" className="btn btn-outline-secondary">
            Cancel
          </Link>
        </div>
      </form>
    </Container>
  );
};

export default AddCandidatePage;
