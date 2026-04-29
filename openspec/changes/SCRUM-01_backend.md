# Backend Implementation Plan: SCRUM-01 Add Candidate to the System

## 2. Overview

Implement **POST /candidates** and **POST /upload** so recruiters can create candidates with optional nested education, work experience, and an optional resume file reference, as defined in `openspec/specs/SCRUM-01.md` (enhanced section), `docs/api-spec.yml`, and `docs/data-model.md`.

**Architecture:** Domain-Driven Design (DDD) with **Presentation** (Express controllers, routes), **Application** (services, validation), **Domain** (models, repository interfaces, invariants), and **Infrastructure** (Prisma, file storage). The current `backend/` tree is a minimal Express stub (`src/index.ts` only); this plan introduces the full layered layout described in `docs/backend-standards.mdc`.

**Out of scope (backend):** Recruiter authentication/authorization (prepare extension points only). Frontend work is not part of this plan.

**TDD:** Add failing tests before implementation for new behavior, per `docs/base-standards.mdc`.

---

## 3. Architecture Context

| Layer | Responsibility | Paths / artifacts |
|-------|----------------|-------------------|
| **Presentation** | HTTP adapters, status codes, parse JSON/multipart | `backend/src/presentation/controllers/candidateController.ts`, `uploadController.ts`, `backend/src/routes/candidateRoutes.ts`, `uploadRoutes.ts` |
| **Application** | Orchestration, validation entry points | `backend/src/application/services/candidateService.ts`, `fileStorageService.ts` (or `uploadService.ts`), `backend/src/application/validator.ts` (or split `validators/candidateValidator.ts`) |
| **Domain** | Entities, invariants, repository contracts | `backend/src/domain/models/Candidate.ts` (and related), `backend/src/domain/repositories/ICandidateRepository.ts` |
| **Infrastructure** | Prisma client singleton, optional repository impl | `backend/src/infrastructure/prismaClient.ts`, Prisma models in `backend/prisma/schema.prisma` |
| **Persistence** | PostgreSQL via Prisma | Migrations under `backend/prisma/migrations/` |

**Current state:** `backend/prisma/schema.prisma` only defines `User`. You must add **Candidate**, **Education**, **WorkExperience**, and **Resume** models and relations per `docs/data-model.md`.

**API contract sources:** `CreateCandidateRequest`, `CreateCandidateResponse`, `CreateEducationRequest`, `CreateWorkExperienceRequest`, `CreateResumeRequest`, `FileUploadResponse`, `ErrorResponse` in `docs/api-spec.yml`.

---

## 4. Implementation Steps

### Step 0: Create Feature Branch

- **Action:** Create and switch to the backend feature branch before any code changes.
- **Branch naming (required):** `feature/SCRUM-01-backend` (suffix `-backend` per `docs/backend-standards.mdc` “Development Workflow”).
- **Implementation steps:**
  1. Ensure you are on the correct base branch (`main` or `develop`) and it is up to date.
  2. `git pull` the base branch.
  3. `git checkout -b feature/SCRUM-01-backend`
  4. Confirm with `git branch`.
- **Notes:** See `docs/backend-standards.mdc` — Git workflow.

---

### Step 1: Prisma schema and migration (data model)

- **Files:** `backend/prisma/schema.prisma`, new migration under `backend/prisma/migrations/`
- **Action:** Model **Candidate** (unique `email`), **Education** (max 3 enforced in application layer; optional DB check), **WorkExperience**, **Resume**; foreign keys to `Candidate`; field types and nullability aligned with `docs/data-model.md` and OpenAPI (string lengths, dates as `DateTime` where appropriate).
- **Function signatures (conceptual):** N/A (declarative schema).
- **Implementation steps:**
  1. Add Prisma models with relations: `Candidate` 1—* `Education`, `WorkExperience`, `Resume`.
  2. Add `@@index` on `Candidate.email` if useful for lookups; `email` must be `@unique`.
  3. Run `npx prisma migrate dev` with a descriptive migration name (e.g. `add_candidate_aggregate`).
  4. Run `npx prisma generate`.
- **Dependencies:** PostgreSQL, `DATABASE_URL` in `.env`.
- **Implementation notes:** Map OpenAPI `date-time` fields to Prisma `DateTime`. Align naming with domain docs (`firstName`, `lastName`, etc.).

---

### Step 2 (TDD): Tests for validation layer — create candidate payload

- **Files:** `backend/src/application/__tests__/candidateValidator.test.ts` (or co-located `.test.ts` next to validator module)
- **Action:** Define failing tests first for `validateCreateCandidateRequest` (name **before** full implementation).
- **Function signature:**

```typescript
export function validateCreateCandidateRequest(body: unknown): CreateCandidateRequestValidated;
// Throws or returns a Result type with field errors — choose one pattern consistently across the project
```

- **Implementation steps:**
  1. Cover **success** with minimal required fields (`firstName`, `lastName`, `email`).
  2. Cover **validation errors:** empty required strings, invalid email format, `firstName`/`lastName` length and letters-only rule from `docs/data-model.md`, Spanish phone pattern when `phone` present, `address` max length.
  3. Cover **educations:** max **3** items; each item `institution`, `title`, `startDate` required; `endDate` optional; valid date-time strings.
  4. Cover **workExperiences:** required `company`, `position`, `startDate`; optional `description` length; optional `endDate`.
  5. Cover **cv:** when present, `filePath` and `fileType` non-empty; optional reference to pre-uploaded file only (no file bytes in JSON).
- **Dependencies:** TypeScript types mirroring `CreateCandidateRequest` (define in `backend/src/types/api.ts` or under `application/dto/` if preferred).
- **Implementation notes:** Keep validators pure; no Prisma in validator unit tests.

---

### Step 3: Implement validation module

- **Files:** `backend/src/application/validator.ts` and/or `backend/src/application/validators/candidateValidator.ts`
- **Action:** Implement the functions to make Step 2 tests pass.
- **Dependencies:** None beyond TypeScript; optional `zod` only if the project already standardizes on it (current `package.json` has no zod — **prefer hand-rolled validation** or add zod with team agreement and document in `package.json`).

---

### Step 4 (TDD): Tests for file upload validation

- **Files:** `backend/src/application/__tests__/uploadValidator.test.ts`
- **Action:** Failing tests for allowed MIME types / extensions (**PDF**, **DOCX**), max size **10 MB** (`docs/data-model.md`), reject others.
- **Function signature:**

```typescript
export function assertValidUploadFile(file: { size: number; mimetype: string; originalname: string }): void;
```

- **Implementation notes:** Centralize magic numbers (`MAX_FILE_BYTES = 10 * 1024 * 1024`).

---

### Step 5 (TDD): Candidate service — duplicate email and transactional create

- **Files:** `backend/src/application/services/candidateService.ts`, `backend/src/application/__tests__/candidateService.test.ts`
- **Action:** Unit-test the service with **mocked** `ICandidateRepository` / Prisma boundary.
- **Function signature:**

```typescript
export async function createCandidate(input: CreateCandidateRequestValidated): Promise<CreateCandidateResponse>;
```

- **Implementation steps:**
  1. Before insert, **check email uniqueness** (or rely on Prisma `P2002` and map to 400 — prefer explicit `findUnique` for clearer error messages).
  2. Use **`$transaction`** to create `Candidate`, nested `Education`, `WorkExperience`, and optional `Resume` rows.
  3. Return payload matching **`CreateCandidateResponse`** (`id`, `firstName`, `lastName`, `email`, optional `phone`, `address`).
  4. Tests: **successful create** with nested arrays; **duplicate email** → domain/application error; **education count > 3** → validation error before DB; optional **resume** row when `cv` present.
- **Dependencies:** `ICandidateRepository` or direct Prisma injected for testability.

---

### Step 6: Domain model and repository interface (align with project patterns)

- **Files:** `backend/src/domain/models/Candidate.ts`, `backend/src/domain/repositories/ICandidateRepository.ts`
- **Action:** Encapsulate invariants (e.g. factory methods); repository interface: `createWithRelations(...)`, `existsByEmail(email: string): Promise<boolean>` as needed.
- **Implementation notes:** Follow patterns in `docs/backend-standards.mdc` (entities with constructors, optional `save()` if team uses that pattern). If the team prefers **thin domain + fat service** for speed, document the deviation in **Step N+1** notes — still keep Prisma out of controllers.

---

### Step 7 (TDD): Upload endpoint — storage service

- **Files:** `backend/src/application/services/fileStorageService.ts`, tests with temporary directory or mocked `fs`
- **Action:** Persist uploaded binary to a configurable directory (`process.env.UPLOAD_DIR` or `backend/uploads/`), generate **safe unique filenames** (UUID + extension), return `{ filePath, fileType }` matching **`FileUploadResponse`**.
- **Security:** Do not trust client filenames for path segments; validate MIME/extension after upload.

---

### Step 8: Presentation — upload controller

- **Files:** `backend/src/presentation/controllers/uploadController.ts`
- **Action:** Use **`multer`** (memory or disk) middleware; max size 10 MB; call `assertValidUploadFile` then `fileStorageService.save(...)`.
- **Responses:** **200** + `FileUploadResponse`; **400** invalid type/size; **500** on unexpected errors.
- **Route:** `POST /upload` per `docs/api-spec.yml`.

---

### Step 9: Presentation — candidate controller

- **Files:** `backend/src/presentation/controllers/candidateController.ts`
- **Action:** `POST /candidates`: parse JSON body, run validator, call `createCandidate`, return **201** + `CreateCandidateResponse`.
- **Error mapping:** Validation → **400**; duplicate email → **400** with message from API expectations; unexpected → **500**.

---

### Step 10: Routes and Express app wiring

- **Files:** `backend/src/routes/candidateRoutes.ts`, `backend/src/routes/uploadRoutes.ts`, `backend/src/index.ts`
- **Action:**
  1. Register `POST /candidates` and `POST /upload`.
  2. Use `express.json()` for JSON body.
  3. Attach **multer** only on upload route.
  4. Optional: **CORS** per `docs/backend-standards.mdc` (`FRONTEND_URL`).
  5. Central **error-handling middleware** mapping domain errors to HTTP status and **`ErrorResponse`** shape.
  6. Replace default export of Prisma from `index.ts` if still exporting client — align with `infrastructure/prismaClient.ts`.

---

### Step 11: Integration tests (HTTP)

- **Files:** `backend/src/tests/candidates.integration.test.ts` (or `__tests__/integration/`)
- **Action:** Use supertest against `app` (export Express `app` without listening in tests).
- **Cases:** **201** create minimal candidate; **201** with educations + work + cv path; **400** duplicate email; **400** invalid body; **400** fourth education row.
- **Upload:** **200** valid PDF/DOCX mock file; **400** oversized / wrong type.
- **Notes:** Use test database or SQLite dev dependency only if project adds it — **prefer documented PostgreSQL test DB** per existing patterns.

---

### Step 12: Unit test coverage and ESLint

- **Action:** Reach **≥ 90%** coverage thresholds in `jest.config.js` where configured; run `npm test` and `npm run lint` (if present).

---

### Step N+1: Update technical documentation

- **Action:** Mandatory documentation pass (`docs/documentation-standards.mdc`).
- **Implementation steps:**
  1. **Review** all code and schema changes.
  2. **`docs/data-model.md`:** Confirm field lists and validation rules match implementation (especially Spanish phone, education limit, resume rules).
  3. **`docs/api-spec.yml`:** Ensure request/response schemas still match (if implementation diverges, update spec).
  4. If new env vars (`UPLOAD_DIR`, `MAX_UPLOAD_MB`): document in `README.md` or backend README if exists.
  5. **Report** in PR/commit message which files were updated.
- **Language:** English only.

---

## 5. Implementation Order

1. Step 0 — Feature branch `feature/SCRUM-01-backend`
2. Step 1 — Prisma schema + migration
3. Step 2 — Failing validator tests (candidate)
4. Step 3 — Candidate validator implementation
5. Step 4 — Failing upload validator tests
6. Step 5 — Upload validator implementation
7. Step 6 — Domain models + repository interface (as needed by service)
8. Step 7 — Failing `candidateService` tests → implementation (transactional create)
9. Step 8 — File storage service + tests
10. Step 9 — Upload controller + multer + routes
11. Step 10 — Candidate controller + routes + app wiring + error middleware
12. Step 11 — Integration tests
13. Step 12 — Coverage and lint
14. Step N+1 — Documentation updates

*(Adjust ordering slightly if strict TDD prefers validator before schema — but schema is needed for integration tests against real DB.)*

---

## 6. Testing Checklist

- [ ] All unit tests pass (`npm test`)
- [ ] Coverage meets project threshold (90% if enforced)
- [ ] `POST /candidates` returns **201** with body matching `CreateCandidateResponse`
- [ ] Duplicate email returns **400** with `ErrorResponse`-compatible body
- [ ] More than three educations rejected with **400**
- [ ] `POST /upload` accepts PDF/DOCX up to 10 MB; rejects others
- [ ] Created candidate rows visible in DB with correct relations
- [ ] ESLint / TypeScript compile clean

---

## 7. Error Response Format

Align runtime responses with **`ErrorResponse`** in `docs/api-spec.yml`:

```json
{
  "message": "Human-readable summary",
  "error": "Optional technical detail or validation detail"
}
```

| Condition | HTTP status | `message` (example) |
|-----------|-------------|------------------------|
| Invalid body / validation | 400 | Validation failed |
| Duplicate email | 400 | Email already registered |
| Invalid file type or size | 400 | Invalid file |
| Internal failure | 500 | Internal server error |

**Success — create candidate (201):**

Body must match **`CreateCandidateResponse`** (fields: `id`, `firstName`, `lastName`, `email`, optional `phone`, `address`).

**Success — upload (200):**

Body must match **`FileUploadResponse`** (`filePath`, `fileType`).

---

## 8. Partial Update Support

**Not applicable.** This ticket implements **create** semantics only (`POST /candidates`, `POST /upload`). Partial updates to candidates belong to a separate ticket.

---

## 9. Dependencies

| Dependency | Purpose |
|------------|---------|
| `express` | HTTP server (already present) |
| `@prisma/client` | Database access |
| `multer` | `multipart/form-data` for `/upload` |
| `dotenv` | Environment configuration |
| `jest`, `supertest`, `@types/*` | Testing |
| PostgreSQL | Database |

Add **`multer`** and **`@types/multer`** if not present in `backend/package.json`.

---

## 10. Notes

- **Language:** Code, comments, errors, logs, and docs in **English** (`CLAUDE.md`).
- **Business rules:** Max **3** education records per candidate; resume **PDF/DOCX**, **10 MB** max; **email** unique; phone Spanish format when provided (`docs/data-model.md`).
- **`cv` object:** References **`filePath`** returned by **`POST /upload`** — validate that the path exists under your upload directory before linking (mitigate arbitrary path injection).
- **Prisma errors:** Map `P2002` (unique) to **400** duplicate email if not already handled in service.
- **Current `backend/src/index.ts`:** Will be refactored into modular structure; keep **single** Express `app` export for tests and lambda wrapper later.

---

## 11. Next Steps After Implementation

- Frontend: wire dashboard “Add candidate” to **`POST /upload`** then **`POST /candidates`** per `openspec/specs/SCRUM-01.md`.
- Add authentication middleware when product requires it; restrict `POST` routes to recruiter role.
- Consider virus scanning for uploads in production (out of scope here).

---

## 12. Implementation Verification

- [ ] **Code quality:** Layering respected; no business logic only in controllers; TypeScript strict.
- [ ] **Functionality:** OpenAPI-compatible JSON for covered endpoints.
- [ ] **Testing:** Unit + integration tests for critical paths; duplicate email and validation covered.
- [ ] **Integration:** App boots; migrations apply cleanly on fresh DB.
- [ ] **Documentation:** `docs/data-model.md` and `docs/api-spec.yml` consistent with code.

---

**Source spec:** `openspec/specs/SCRUM-01.md`  
**Plan file path:** `openspec/changes/SCRUM-01_backend.md`
