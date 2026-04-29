# Frontend Implementation Plan: SCRUM-01 Add Candidate to the System

## 2. Overview

Deliver the **recruiter “Add candidate”** experience from `openspec/specs/SCRUM-01.md`: a visible entry point on the home/dashboard, a multi-section form (identity, education, work experience, optional CV), client-side validation aligned with `docs/data-model.md` and `docs/api-spec.yml`, **upload-then-create** flow (`POST /upload` then `POST /candidates`), success feedback, and robust error handling for 400/500 and network failures.

**Architecture (per `docs/frontend-standards.mdc`):** Component-based React (functional components + hooks), **service layer** in `src/services/` for API calls, **no global state library** (local `useState` / small lifted state), **React Router** for `/` and add-candidate route, **React Bootstrap + Bootstrap 5** for layout and forms, **Axios** (or `fetch` with typed wrappers) for HTTP. **TypeScript** for new files.

**Current codebase gap:** `frontend/` is a minimal Create React App (`App.tsx` placeholder) **without** React Router, React Bootstrap, Axios, or Cypress yet. This plan includes **dependency additions** to match the documented stack before feature work.

**Language:** All UI copy, errors, tests, and comments in **English** (`CLAUDE.md`).

---

## 3. Architecture Context

| Area | Choice |
|------|--------|
| **Routing** | `react-router-dom` v6 — e.g. `/` recruiter dashboard (light placeholder), `/candidates/new` add-candidate form |
| **State** | Local state in `AddCandidatePage` (or container + presentational children); optional `useReducer` if form state grows |
| **API** | `src/services/candidateService.ts` — `uploadCv(file: File)`, `createCandidate(body: CreateCandidateRequest)`; base URL `REACT_APP_API_URL` (default e.g. `http://localhost:3010` to match `backend/src/index.ts` default port; align with `docs/development_guide.md`) |
| **Validation** | `src/utils/candidateFormValidation.ts` (or `src/validation/`) — mirror rules: required names/email, Spanish phone, max 3 educations, date order, file type/size before upload |
| **UI** | `Container`, `Button`, `Form`, `Alert`, `Card`, `Row`, `Col` from React Bootstrap; optional `react-datepicker` for date fields per standards |
| **Tests** | Jest + React Testing Library for components and services (mock `fetch`/axios); **Cypress** e2e per standards (add tooling if missing) |

**Key files to introduce (suggested):**

- `frontend/src/services/candidateService.ts` — API client
- `frontend/src/types/candidate.ts` — DTOs matching API
- `frontend/src/pages/RecruiterDashboard.tsx` — CTA “Add candidate”
- `frontend/src/pages/AddCandidatePage.tsx` — form orchestration, submit, success/error
- `frontend/src/components/candidate/IdentitySection.tsx`, `EducationSection.tsx`, `WorkExperienceSection.tsx`, `CvUploadSection.tsx` — section components
- `frontend/src/App.tsx` — `BrowserRouter`, `Routes`, layout shell
- `frontend/.env.example` — `REACT_APP_API_URL`

**Stretch (defer):** Autocomplete for institution/company from existing APIs — only if `GET /candidates` or dedicated lookup exists; otherwise document as follow-up.

---

## 4. Implementation Steps

### Step 0: Create Feature Branch

- **Action:** Create and switch to the frontend feature branch before any code changes.
- **Branch naming (required):** `feature/SCRUM-01-frontend` (suffix `-frontend` per `docs/frontend-standards.mdc` Git workflow).
- **Implementation steps:**
  1. Ensure base branch (`main` / `develop`) is up to date.
  2. `git pull` base branch.
  3. `git checkout -b feature/SCRUM-01-frontend`
  4. `git branch` to verify.
- **Notes:** Do not share this branch with backend-only work; use distinct suffix from `feature/SCRUM-01-backend`.

---

### Step 1: Align dependencies with `docs/frontend-standards.mdc`

- **File:** `frontend/package.json`
- **Action:** Add and install packages required by the standards doc and this feature.
- **Implementation steps:**
  1. Add **axios** (HTTP), **react-router-dom** (routing), **react-bootstrap** + **bootstrap** (UI), **react-bootstrap-icons** (optional, CTA icon).
  2. Add **react-datepicker** + **@types/react-datepicker** if using date pickers for education/work dates (recommended UX vs plain text ISO inputs).
  3. Import Bootstrap CSS once (e.g. in `src/index.tsx`: `import 'bootstrap/dist/css/bootstrap.min.css'`).
  4. For **Cypress** (Step 11): add `cypress` as devDependency and run `npx cypress open` once to scaffold `cypress.config.ts` and `cypress/e2e/` if not present.
- **Implementation notes:** CRA exposes env vars prefixed with `REACT_APP_`; document in `.env.example`.

---

### Step 2: Environment and API base URL

- **Files:** `frontend/.env.example`, `frontend/src/config.ts` (optional)
- **Action:** Centralize `REACT_APP_API_URL` with a safe default for local dev.
- **Function signature (example):**

```typescript
export const API_BASE_URL: string =
  process.env.REACT_APP_API_URL ?? 'http://localhost:3010';
```

- **Implementation notes:** Must match running backend (CORS: ensure backend allows `FRONTEND_URL` / CRA origin `http://localhost:3000` per `docs/backend-standards.mdc` when implementing cross-origin).

---

### Step 3: Types and service layer — upload + create candidate

- **Files:** `frontend/src/types/candidate.ts`, `frontend/src/services/candidateService.ts`
- **Action:** Typed `multipart/form-data` upload and JSON create.
- **Signatures:**

```typescript
// candidateService.ts
export async function uploadCv(file: File): Promise<{ filePath: string; fileType: string }>;
export async function createCandidate(body: CreateCandidateRequest): Promise<CreateCandidateResponse>;
```

- **Implementation steps:**
  1. **uploadCv:** `axios.post` to `/upload`, `FormData` with field name **`file`** (matches backend multer). Do not set `Content-Type` manually (browser sets boundary).
  2. **createCandidate:** `axios.post` to `/candidates`, JSON body per `CreateCandidateRequest`.
  3. Parse error responses: backend returns `{ message, error? }` — surface `message` to user; use `error` for details if needed.
  4. Map axios errors: `error.response?.status`, `error.response?.data` for 400/500; treat `error.request` with no response as network error.
- **Dependencies:** `axios`, types from `types/candidate.ts` aligned with `docs/api-spec.yml` (`CreateCandidateRequest`, `CreateCandidateResponse`, nested education/work DTOs).

---

### Step 4: Client-side validation module (TDD-friendly)

- **File:** `frontend/src/utils/candidateFormValidation.ts` (or `src/validation/candidateForm.ts`)
- **Action:** Pure functions to validate form model before API calls; same rules as spec (max 3 educations, email format, Spanish phone, 10MB file, PDF/DOCX only).
- **Function signature (example):**

```typescript
export type FieldErrors = Record<string, string>;
export function validateCandidateForm(values: CandidateFormValues): { valid: boolean; errors: FieldErrors };
```

- **Implementation steps:**
  1. Return field-level or global errors for display next to fields / summary `Alert`.
  2. File rules: `file.size <= 10 * 1024 * 1024`, MIME or extension check for `.pdf` / `.docx`.
  3. Optional: block submit until validation passes (do not rely on server only).
- **Dependencies:** None beyond TypeScript.

---

### Step 5: Page — Recruiter dashboard (entry CTA)

- **File:** `frontend/src/pages/RecruiterDashboard.tsx`
- **Action:** Minimal dashboard landing with a **primary, visible** button or link **“Add candidate”** navigating to `/candidates/new` (`useNavigate`).
- **Component signature:**

```typescript
const RecruiterDashboard: React.FC = () => { ... };
```

- **Implementation notes:** Keep layout simple (`Container`, heading, `Button` variant="primary"); satisfies **[original]** acceptance on visibility.

---

### Step 6: Components — Add candidate form sections

- **Files:**
  - `frontend/src/pages/AddCandidatePage.tsx` — owns form state, submit orchestration, loading, success `Alert`, error `Alert`.
  - `frontend/src/components/candidate/IdentitySection.tsx` — firstName, lastName, email, phone, address.
  - `frontend/src/components/candidate/EducationSection.tsx` — dynamic list (add/remove row), cap **3** rows, fields per `CreateEducationRequest`.
  - `frontend/src/components/candidate/WorkExperienceSection.tsx` — dynamic list for work blocks.
  - `frontend/src/components/candidate/CvUploadSection.tsx` — `<input type="file" accept=".pdf,.docx,application/pdf,..." />`, show selected file name, optional remove.
- **Action:** Controlled inputs; education/work “Add row” / “Remove” buttons.
- **Implementation steps:**
  1. On submit: run `validateCandidateForm`; if invalid, set errors and return.
  2. If CV file selected: call `uploadCv` first; on success attach `cv: { filePath, fileType }` to payload.
  3. Call `createCandidate` with assembled JSON (omit empty optional arrays if preferred; backend accepts omitted empty).
  4. On **201**: show success message (“Candidate added successfully”) and optionally reset form or offer link back to dashboard.
  5. On **400** duplicate email: show clear message (“This email is already registered”).
  6. On network error: non-technical friendly message; preserve form data.
- **Hooks:** `useState` for form values, `errors`, `isSubmitting`, `submitSuccess`.

---

### Step 7: Routing and App shell

- **Files:** `frontend/src/App.tsx`, `frontend/src/index.tsx`
- **Action:** Wrap app in `BrowserRouter`; define routes.
- **Implementation steps:**

```tsx
<Routes>
  <Route path="/" element={<RecruiterDashboard />} />
  <Route path="/candidates/new" element={<AddCandidatePage />} />
</Routes>
```

- **Optional:** Shared layout component with nav breadcrumb “Dashboard / Add candidate”.
- **Dependencies:** `react-router-dom`.

---

### Step 8: Accessibility and responsive behavior

- **Action:** Associate `<label htmlFor=...>` with inputs; use `aria-invalid`, `aria-describedby` for errors; ensure keyboard tab order; use responsive grid (`Row`/`Col`) so form stacks on small screens.
- **Implementation notes:** Matches **[original]** accessibility / multi-device acceptance.

---

### Step 9: Unit / integration tests (RTL)

- **Files:** `frontend/src/pages/__tests__/AddCandidatePage.test.tsx`, `frontend/src/services/__tests__/candidateService.test.ts` (mock axios)
- **Action:** Tests for validation utility, required fields, duplicate-email error path (mock API), successful submit flow (mock upload + create).
- **Implementation notes:** Follow `docs/frontend-standards.mdc` Testing Standards; use React Testing Library (`getByRole`, `userEvent`).

---

### Step 10: Cypress E2E (per standards)

- **Files:** `frontend/cypress/e2e/add-candidate.cy.ts` (or `.js`)
- **Action:** End-to-end flow: open dashboard → navigate to form → fill minimal required fields → submit; optionally intercept network with `cy.intercept` for stable CI.
- **Implementation notes:** Requires Cypress installed and `npm` script `cypress:run`. If backend must be running, document in test README or use `cy.intercept` to stub responses for smoke UI tests.

---

### Step N+1: Update technical documentation

- **Action:** Mandatory documentation pass (`docs/documentation-standards.mdc`).
- **Implementation steps:**
  1. Update **`docs/frontend-standards.mdc`** only if new patterns are introduced (e.g. actual Cypress layout differs from documented structure).
  2. Update **`docs/development_guide.md`** frontend section: `REACT_APP_API_URL`, port alignment with backend, how to run frontend + backend together.
  3. **`docs/api-spec.yml`:** update only if frontend discovers contract gaps (ideally none).
  4. Root **`README.md`** or **`frontend/README.md`:** short “Add candidate” feature note and env vars.
- **Language:** English only.

---

## 5. Implementation Order

1. Step 0 — Branch `feature/SCRUM-01-frontend`
2. Step 1 — Dependencies (axios, router, bootstrap, optional datepicker, cypress dev)
3. Step 2 — Env / `API_BASE_URL`
4. Step 3 — Types + `candidateService.ts`
5. Step 4 — `candidateFormValidation.ts` (+ tests first if doing strict TDD)
6. Step 5 — `RecruiterDashboard.tsx`
7. Step 6 — Section components + `AddCandidatePage.tsx`
8. Step 7 — `App.tsx` routing
9. Step 8 — A11y / responsive pass
10. Step 9 — RTL tests
11. Step 10 — Cypress e2e
12. Step N+1 — Documentation updates

---

## 6. Testing Checklist

- [ ] Validation blocks submit when required fields missing or education count > 3
- [ ] Invalid email / phone shows field-level or summary errors
- [ ] CV rejected client-side when > 10 MB or wrong type (before upload)
- [ ] Happy path: upload (if file) + create returns 201 → success message visible
- [ ] Duplicate email (400) shows dedicated message
- [ ] Network failure shows generic error; form data retained
- [ ] Dashboard “Add candidate” navigates to form
- [ ] Cypress (if enabled): critical path passes in CI or locally with documented prerequisites

---

## 7. Error Handling Patterns

| Scenario | UI behavior |
|----------|-------------|
| Client validation | Inline errors + optional `Alert` variant="danger" |
| 400 API (`message` / `error`) | Display `message`; map duplicate email to explicit copy |
| 500 / unknown | Generic “Something went wrong”; log `console.error` in dev |
| Network / timeout | “Unable to reach the server. Check your connection.” |
| Upload failure before create | Show error; do not call `createCandidate` |

**Service layer:** Throw typed errors or return `{ ok: false, error }` consistently; components must not parse axios internals in JSX — map in one place.

---

## 8. UI/UX Considerations

- **Bootstrap / React Bootstrap:** Primary CTA, `Card` for form grouping, `Spinner` or disabled submit during `isSubmitting`.
- **Responsive:** Stack columns on `xs`, two-column identity on `md+` if desired.
- **Feedback:** Success `Alert` dismissible or toast-style banner; avoid blocking modal unless product requires.
- **CV UX:** Show filename + size after pick; “Remove file” clears selection and drops `cv` from payload.

---

## 9. Dependencies

| Package | Role |
|---------|------|
| axios | HTTP client |
| react-router-dom | SPA routing |
| react-bootstrap, bootstrap | UI |
| react-datepicker (+ types) | Optional date inputs |
| react-bootstrap-icons | Optional icons |
| cypress (dev) | E2E |

**No new global state library** unless product later requires Redux/Zustand.

---

## 10. Notes

- **Upload-then-create order is mandatory** until API supports single multipart create (spec note in SCRUM-01 enhanced).
- **CORS:** Coordinate with backend — CRA dev server origin must be allowed.
- **TypeScript:** New files `.tsx` / `.ts`; strict typing for props and API DTOs.
- **Autocomplete stretch:** Defer unless backend exposes lookup endpoints in same sprint.

---

## 11. Next Steps After Implementation

- Hook **authentication** when available (protect `/candidates/new`).
- Consider extracting shared validation constants shared with backend via OpenAPI codegen (future).
- Visual regression / Percy (optional), not required for SCRUM-01.

---

## 12. Implementation Verification

- [ ] Code quality: services separated from components; English-only strings
- [ ] Functionality: matches `openspec/specs/SCRUM-01.md` **[enhanced]** UI scope
- [ ] Testing: RTL coverage for form + service mocks; Cypress where feasible
- [ ] Integration: Manual smoke with running backend + correct `REACT_APP_API_URL`
- [ ] Documentation: development guide + README/env example updated

---

**Plan file path:** `openspec/changes/SCRUM-01_frontend.md`  
**Source spec:** `openspec/specs/SCRUM-01.md`
