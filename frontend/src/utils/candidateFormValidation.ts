import type { CandidateFormValues } from '../types/candidate';

export type FieldErrors = Record<string, string>;

const NAME_MIN = 2;
const NAME_MAX = 100;
const NAME_PATTERN = /^[\p{L}\s'-]+$/u;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[679]\d{8}$/;
const ADDRESS_MAX = 100;
const MAX_EDUCATIONS = 3;
const INSTITUTION_MAX = 100;
const TITLE_MAX = 250;
const COMPANY_MAX = 100;
const POSITION_MAX = 100;
const DESCRIPTION_MAX = 200;

export const MAX_CV_BYTES = 10 * 1024 * 1024;

const ALLOWED_CV_MIME = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

export function validateCvFile(file: File): string | null {
  if (file.size > MAX_CV_BYTES) {
    return 'File must be 10MB or smaller.';
  }
  if (!ALLOWED_CV_MIME.has(file.type)) {
    return 'Only PDF or DOCX files are allowed.';
  }
  return null;
}

function parseLocalDate(label: string, value: string): Date | null {
  if (!value.trim()) {
    return null;
  }
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    return null;
  }
  return d;
}

export function validateCandidateForm(values: CandidateFormValues): {
  valid: boolean;
  errors: FieldErrors;
} {
  const errors: FieldErrors = {};

  const fn = values.firstName.trim();
  const ln = values.lastName.trim();
  const em = values.email.trim();

  if (fn.length < NAME_MIN || fn.length > NAME_MAX) {
    errors.firstName = `First name must be ${NAME_MIN}-${NAME_MAX} characters.`;
  } else if (!NAME_PATTERN.test(fn)) {
    errors.firstName = 'First name contains invalid characters.';
  }

  if (ln.length < NAME_MIN || ln.length > NAME_MAX) {
    errors.lastName = `Last name must be ${NAME_MIN}-${NAME_MAX} characters.`;
  } else if (!NAME_PATTERN.test(ln)) {
    errors.lastName = 'Last name contains invalid characters.';
  }

  if (!em) {
    errors.email = 'Email is required.';
  } else if (em.length > 255 || !EMAIL_PATTERN.test(em)) {
    errors.email = 'Enter a valid email address.';
  }

  const phone = values.phone.trim().replace(/\s+/g, '');
  if (phone && !PHONE_PATTERN.test(phone)) {
    errors.phone =
      'Phone must be a Spanish mobile: 9 digits starting with 6, 7, or 9.';
  }

  const addr = values.address.trim();
  if (addr.length > ADDRESS_MAX) {
    errors.address = `Address must be at most ${ADDRESS_MAX} characters.`;
  }

  if (values.educations.length > MAX_EDUCATIONS) {
    errors.educations = `At most ${MAX_EDUCATIONS} education records allowed.`;
  }

  values.educations.forEach((row, i) => {
    const prefix = `education_${i}`;
    const inst = row.institution.trim();
    const title = row.title.trim();
    if (!inst || inst.length > INSTITUTION_MAX) {
      errors[`${prefix}_institution`] =
        inst.length === 0
          ? 'Institution is required.'
          : `Institution must be at most ${INSTITUTION_MAX} characters.`;
    }
    if (!title || title.length > TITLE_MAX) {
      errors[`${prefix}_title`] =
        title.length === 0
          ? 'Title is required.'
          : `Title must be at most ${TITLE_MAX} characters.`;
    }
    const sd = parseLocalDate('start', row.startDate);
    if (!row.startDate.trim() || !sd) {
      errors[`${prefix}_startDate`] = 'Start date is required.';
    }
    if (row.endDate.trim()) {
      const ed = parseLocalDate('end', row.endDate);
      if (!ed) {
        errors[`${prefix}_endDate`] = 'Invalid end date.';
      } else if (sd && ed < sd) {
        errors[`${prefix}_endDate`] = 'End date must be on or after start date.';
      }
    }
  });

  values.workExperiences.forEach((row, i) => {
    const prefix = `work_${i}`;
    const company = row.company.trim();
    const position = row.position.trim();
    if (!company || company.length > COMPANY_MAX) {
      errors[`${prefix}_company`] =
        company.length === 0
          ? 'Company is required.'
          : `Company must be at most ${COMPANY_MAX} characters.`;
    }
    if (!position || position.length > POSITION_MAX) {
      errors[`${prefix}_position`] =
        position.length === 0
          ? 'Position is required.'
          : `Position must be at most ${POSITION_MAX} characters.`;
    }
    const desc = row.description.trim();
    if (desc.length > DESCRIPTION_MAX) {
      errors[`${prefix}_description`] = `Description must be at most ${DESCRIPTION_MAX} characters.`;
    }
    const sd = parseLocalDate('start', row.startDate);
    if (!row.startDate.trim() || !sd) {
      errors[`${prefix}_startDate`] = 'Start date is required.';
    }
    if (row.endDate.trim()) {
      const ed = parseLocalDate('end', row.endDate);
      if (!ed) {
        errors[`${prefix}_endDate`] = 'Invalid end date.';
      } else if (sd && ed < sd) {
        errors[`${prefix}_endDate`] = 'End date must be on or after start date.';
      }
    }
  });

  if (values.cvFile) {
    const cvErr = validateCvFile(values.cvFile);
    if (cvErr) {
      errors.cvFile = cvErr;
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/** Convert HTML date (yyyy-mm-dd) to ISO date-time string for the API */
export function dateInputToIso(dateStr: string): string {
  const d = parseLocalDate('d', dateStr);
  if (!d) {
    return dateStr;
  }
  return d.toISOString();
}
