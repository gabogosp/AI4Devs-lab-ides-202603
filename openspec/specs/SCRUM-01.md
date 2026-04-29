# SCRUM-01 — Add candidate to the system

## [original]

Añadir Candidato al Sistema

Como reclutador,
Quiero tener la capacidad de añadir candidatos al sistema ATS,
Para que pueda gestionar sus datos y procesos de selección de manera eficiente.

Criterios de Aceptación:

Accesibilidad de la función: Debe haber un botón o enlace claramente visible para añadir un nuevo candidato desde la página principal del dashboard del reclutador.
Formulario de ingreso de datos: Al seleccionar la opción de añadir candidato, se debe presentar un formulario que incluya los campos necesarios para capturar la información del candidato como nombre, apellido, correo electrónico, teléfono, dirección, educación y experiencia laboral.
Validación de datos: El formulario debe validar los datos ingresados para asegurar que son completos y correctos. Por ejemplo, el correo electrónico debe tener un formato válido y los campos obligatorios no deben estar vacíos.
Carga de documentos: El reclutador debe tener la opción de cargar el CV del candidato en formato PDF o DOCX.
Confirmación de añadido: Una vez completado el formulario y enviada la información, debe aparecer un mensaje de confirmación indicando que el candidato ha sido añadido exitosamente al sistema.
Errores y manejo de excepciones: En caso de error (por ejemplo, fallo en la conexión con el servidor), el sistema debe mostrar un mensaje adecuado al usuario para informarle del problema.
Accesibilidad y compatibilidad: La funcionalidad debe ser accesible y compatible con diferentes dispositivos y navegadores web.
Notas:

La interfaz debe ser intuitiva y fácil de usar para minimizar el tiempo de entrenamiento necesario para los nuevos reclutadores.
Considerar la posibilidad de integrar funcionalidades de autocompletado para los campos de educación y experiencia laboral, basados en datos preexistentes en el sistema.
Tareas Técnicas:

Implementar la interfaz de usuario para el formulario de añadir candidato.
Desarrollar el backend necesario para procesar la información ingresada en el formulario.
Asegurar la seguridad y privacidad de los datos del candidato.

## [enhanced]

### Summary

**As a** recruiter, **I want** to create candidate records from the dashboard **so that** I can capture profile data, education, work history, and an optional CV in line with the LTI API and data model.

### UI scope

- **Entry point:** A clearly visible button or link on the recruiter dashboard (e.g. “Add candidate”) opening an **Add candidate** view/route.
- **Form sections:**
  - **Identity:** `firstName`, `lastName`, `email` (required); `phone`, `address` (optional).
  - **Education:** repeatable rows, **maximum 3** per candidate (`docs/data-model.md`) — each row: `institution`, `title`, `startDate`, optional `endDate`.
  - **Work experience:** repeatable rows — each: `company`, `position`, `startDate`, optional `endDate`, optional `description`.
  - **CV:** file input — **PDF or DOCX**, max **10 MB** (`docs/data-model.md`, `POST /upload`).
- **Success:** After **HTTP 201** from candidate creation, show a clear confirmation (toast or inline message).
- **Errors:** User-visible messages for validation failures (**400**), duplicate email (**400**), network/server failures, and **500**; retain form state where reasonable.
- **Responsive** layout and baseline **accessibility** (labels, focus order, error association).
- **Stretch / future:** Autocomplete for institution, company, or titles from existing candidate data (optional API or client cache); mark out-of-scope if deferred.

### API contract (`docs/api-spec.yml`)

| Step | Method | Path | Purpose |
|------|--------|------|---------|
| Create candidate | `POST` | `/candidates` | Body: `CreateCandidateRequest` |
| Upload CV (before or with flow) | `POST` | `/upload` | `multipart/form-data` field `file`; response `FileUploadResponse` (`filePath`, `fileType`) |

**`POST /candidates` — `CreateCandidateRequest`**

| Field | Required | Notes |
|-------|----------|--------|
| `firstName` | Yes | Per `docs/data-model.md`: 2–100 characters, letters only. |
| `lastName` | Yes | Same rules as `firstName`. |
| `email` | Yes | Valid email; **unique** — API returns **400** if duplicate. |
| `phone` | No | If provided: Spanish format `(6\|7\|9)XXXXXXXX`. |
| `address` | No | Max 100 characters. |
| `educations` | No | Array of `CreateEducationRequest`; enforce max **3** server- and client-side. |
| `workExperiences` | No | Array of `CreateWorkExperienceRequest`. |
| `cv` | No | `CreateResumeRequest`: `filePath`, `fileType` (typically from `POST /upload`). |

**Responses**

- **201:** `CreateCandidateResponse` — `id`, `firstName`, `lastName`, `email`, optional `phone`, `address`.
- **400:** Validation or duplicate email (`ErrorResponse`).
- **500:** Server error (`ErrorResponse`).

**Recommended CV flow**

1. User selects file → `POST /upload` → use `filePath` and `fileType` from `FileUploadResponse`.
2. Submit `POST /candidates` with body including `cv: { filePath, fileType }` when a file was uploaded.

*Note:* If the product requires a single multipart request for candidate + file, that is an API change versus current OpenAPI (JSON create + separate upload).

### Validation (client + server)

- Align with **`docs/data-model.md`** and nested schemas `CreateEducationRequest` / `CreateWorkExperienceRequest` (dates as **date-time** ISO strings per OpenAPI).
- Enforce **max 3** education records.
- Handle duplicate email with a clear user message.

### Implementation hints

**Backend**

- Register `POST /candidates` and `POST /upload`; controller → validation → service → persistence (e.g. Prisma).
- Use a **transaction** for candidate + nested education, work experience, and optional resume row.
- `/upload`: validate MIME/size, store securely; `CreateResumeRequest` references stored `filePath` / `fileType`.

**Frontend**

- Under `frontend/src/`: add-candidate route/page, form components, API client for `/upload` and `/candidates`, shared validators, success/error UI.

**Documentation**

- Change **`docs/api-spec.yml`** / **`docs/data-model.md`** only if behavior or fields diverge from the spec.

### Testing (TDD)

- **Backend:** Unit tests for validation and email uniqueness; integration tests for `POST /candidates` (201, 400 duplicate, 400 invalid body, education count &gt; 3).
- **Frontend:** Tests for required fields, email format, file type/size limits, success and error UI.

### Non-functional requirements

- **Security & privacy:** HTTPS in production; secure file storage; no sensitive data in client logs; design for authenticated recruiter-only access when auth is added.
- **Performance:** Single transactional create; upload size cap 10 MB.

### Definition of done

- Dashboard entry and add-candidate form meet the acceptance criteria in **[original]**.
- `POST /upload` and `POST /candidates` behave per OpenAPI; validation and duplicate email enforced.
- Confirmation and error handling implemented; responsive and baseline accessible.
- Tests and docs updated as required.
