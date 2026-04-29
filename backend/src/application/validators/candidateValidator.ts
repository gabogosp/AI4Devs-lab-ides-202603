import { ValidationError } from '../../errors/AppError';
import type {
  CreateCandidateRequestValidated,
  CreateEducationInput,
  CreateWorkExperienceInput,
} from '../../types/api';

const NAME_MIN = 2;
const NAME_MAX = 100;
/** Letters (Unicode), spaces, apostrophe, hyphen — per docs/data-model.md “letters only” with practical UX */
const NAME_PATTERN =
  /^[\p{L}\s'-]+$/u;

const EMAIL_MAX = 255;
const ADDRESS_MAX = 100;
const PHONE_PATTERN = /^[679]\d{8}$/;
const MAX_EDUCATIONS = 3;

const INSTITUTION_MAX = 100;
const TITLE_MAX = 250;
const COMPANY_MAX = 100;
const POSITION_MAX = 100;
const DESCRIPTION_MAX = 200;

function assertString(name: string, value: unknown, maxLen: number, required: boolean): string {
  if (value === undefined || value === null) {
    if (required) {
      throw new ValidationError(`${name} is required`);
    }
    return '';
  }
  if (typeof value !== 'string') {
    throw new ValidationError(`${name} must be a string`);
  }
  const t = value.trim();
  if (required && t.length === 0) {
    throw new ValidationError(`${name} is required`);
  }
  if (t.length > maxLen) {
    throw new ValidationError(`${name} must be at most ${maxLen} characters`);
  }
  return t;
}

function assertNameField(field: 'firstName' | 'lastName', value: unknown): string {
  const s = assertString(field, value, NAME_MAX, true);
  if (s.length < NAME_MIN) {
    throw new ValidationError(`${field} must be at least ${NAME_MIN} characters`);
  }
  if (!NAME_PATTERN.test(s)) {
    throw new ValidationError(`${field} contains invalid characters`);
  }
  return s;
}

/** RFC-like pragmatic email check */
function assertEmail(value: unknown): string {
  const s = assertString('email', value, EMAIL_MAX, true).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) {
    throw new ValidationError('email must be a valid email address');
  }
  return s;
}

function parseIsoDateTime(label: string, value: string): Date {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    throw new ValidationError(`${label} must be a valid date-time`);
  }
  return d;
}

function validateEducation(raw: unknown, index: number): CreateEducationInput {
  if (typeof raw !== 'object' || raw === null) {
    throw new ValidationError(`educations[${index}] must be an object`);
  }
  const o = raw as Record<string, unknown>;
  const institution = assertString('institution', o.institution, INSTITUTION_MAX, true);
  const title = assertString('title', o.title, TITLE_MAX, true);
  const startDateRaw = assertString('startDate', o.startDate, 40, true);
  parseIsoDateTime(`educations[${index}].startDate`, startDateRaw);
  let endDate: string | null | undefined;
  if (o.endDate !== undefined && o.endDate !== null) {
    const endStr =
      typeof o.endDate === 'string' ? o.endDate.trim() : String(o.endDate);
    if (endStr.length > 0) {
      parseIsoDateTime(`educations[${index}].endDate`, endStr);
      const start = new Date(startDateRaw);
      const end = new Date(endStr);
      if (end < start) {
        throw new ValidationError(`educations[${index}].endDate must be on or after startDate`);
      }
      endDate = endStr;
    }
  }
  return {
    institution,
    title,
    startDate: startDateRaw,
    endDate: endDate ?? null,
  };
}

function validateWorkExperience(raw: unknown, index: number): CreateWorkExperienceInput {
  if (typeof raw !== 'object' || raw === null) {
    throw new ValidationError(`workExperiences[${index}] must be an object`);
  }
  const o = raw as Record<string, unknown>;
  const company = assertString('company', o.company, COMPANY_MAX, true);
  const position = assertString('position', o.position, POSITION_MAX, true);
  const startDateRaw = assertString('startDate', o.startDate, 40, true);
  parseIsoDateTime(`workExperiences[${index}].startDate`, startDateRaw);
  let description: string | null | undefined;
  if (o.description !== undefined && o.description !== null) {
    if (typeof o.description !== 'string') {
      throw new ValidationError(`workExperiences[${index}].description must be a string`);
    }
    const d = o.description.trim();
    if (d.length > DESCRIPTION_MAX) {
      throw new ValidationError(
        `workExperiences[${index}].description must be at most ${DESCRIPTION_MAX} characters`,
      );
    }
    description = d.length > 0 ? d : null;
  }
  let endDate: string | null | undefined;
  if (o.endDate !== undefined && o.endDate !== null) {
    const endStr =
      typeof o.endDate === 'string' ? o.endDate.trim() : String(o.endDate);
    if (endStr.length > 0) {
      parseIsoDateTime(`workExperiences[${index}].endDate`, endStr);
      const start = new Date(startDateRaw);
      const end = new Date(endStr);
      if (end < start) {
        throw new ValidationError(`workExperiences[${index}].endDate must be on or after startDate`);
      }
      endDate = endStr;
    }
  }
  return {
    company,
    position,
    startDate: startDateRaw,
    endDate: endDate ?? null,
    description: description ?? null,
  };
}

export function validateCreateCandidateRequest(body: unknown): CreateCandidateRequestValidated {
  if (typeof body !== 'object' || body === null) {
    throw new ValidationError('Request body must be a JSON object');
  }
  const o = body as Record<string, unknown>;

  const firstName = assertNameField('firstName', o.firstName);
  const lastName = assertNameField('lastName', o.lastName);
  const email = assertEmail(o.email);

  let phone: string | undefined;
  if (o.phone !== undefined && o.phone !== null && String(o.phone).trim().length > 0) {
    const p =
      typeof o.phone === 'string' ? o.phone.trim().replace(/\s+/g, '') : String(o.phone).trim();
    if (!PHONE_PATTERN.test(p)) {
      throw new ValidationError(
        'phone must match Spanish mobile format: 9 digits starting with 6, 7, or 9',
      );
    }
    phone = p;
  }

  let address: string | undefined;
  if (o.address !== undefined && o.address !== null && String(o.address).trim().length > 0) {
    address = assertString('address', o.address, ADDRESS_MAX, false);
    if (address.length === 0) {
      address = undefined;
    }
  }

  let educations: CreateEducationInput[] | undefined;
  if (o.educations !== undefined) {
    if (!Array.isArray(o.educations)) {
      throw new ValidationError('educations must be an array');
    }
    if (o.educations.length > MAX_EDUCATIONS) {
      throw new ValidationError(`At most ${MAX_EDUCATIONS} education records allowed`);
    }
    educations = o.educations.map((item, i) => validateEducation(item, i));
  }

  let workExperiences: CreateWorkExperienceInput[] | undefined;
  if (o.workExperiences !== undefined) {
    if (!Array.isArray(o.workExperiences)) {
      throw new ValidationError('workExperiences must be an array');
    }
    workExperiences = o.workExperiences.map((item, i) => validateWorkExperience(item, i));
  }

  let cv: CreateCandidateRequestValidated['cv'];
  if (o.cv !== undefined && o.cv !== null) {
    if (typeof o.cv !== 'object') {
      throw new ValidationError('cv must be an object');
    }
    const c = o.cv as Record<string, unknown>;
    const filePath = assertString('cv.filePath', c.filePath, 500, true);
    const fileType = assertString('cv.fileType', c.fileType, 50, true);
    cv = { filePath, fileType };
  }

  const result: CreateCandidateRequestValidated = {
    firstName,
    lastName,
    email,
  };
  if (phone !== undefined) result.phone = phone;
  if (address !== undefined) result.address = address;
  if (educations !== undefined) result.educations = educations;
  if (workExperiences !== undefined) result.workExperiences = workExperiences;
  if (cv !== undefined) result.cv = cv;
  return result;
}
