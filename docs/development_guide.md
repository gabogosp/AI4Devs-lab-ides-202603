# Development Guide

This guide provides step-by-step instructions for setting up the development environment and running tests for the LTI ATS system.

## 🚀 Setup Instructions

### Prerequisites

Ensure you have the following installed:
- **Node.js** (v16 or higher)
- **npm** (v8 or higher)
- **Docker** and **Docker Compose**
- **Git**

### 1. Clone the Repository

```bash
git clone git@github.com:LIDR-academy/AI4Devs-LTI-extended.git
cd AI4Devs-LTI-extended
```

### 2. Environment Configuration

Create environment files for both backend and frontend:

**Backend Environment** (`backend/.env`):
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=LTIdbUser
DB_PASSWORD=D1ymf8wyQEGthFR1E9xhCq
DB_NAME=LTIdb

# Application Configuration
PORT=3000
NODE_ENV=development

# Prisma Database URL
DATABASE_URL="postgresql://LTIdbUser:D1ymf8wyQEGthFR1E9xhCq@localhost:5432/LTIdb"

# Resume uploads (optional — defaults to ./uploads under backend cwd)
UPLOAD_DIR=./uploads
```

**Frontend Environment** (`frontend/.env`):
```env
REACT_APP_API_URL=http://localhost:3000
```

### 3. Database Setup (PostgreSQL with Docker)

Start the PostgreSQL database using Docker Compose:

```bash
# Start PostgreSQL container
docker-compose up -d

# Verify the database is running
docker-compose ps
```

The PostgreSQL database will be available at:
- **Host**: `localhost`
- **Port**: `5432`
- **Database**: `LTIdb`
- **Username**: `LTIdbUser`
- **Password**: `D1ymf8wyQEGthFR1E9xhCq`

### 4. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npx prisma migrate deploy

# (Optional) Seed the database with sample data
npx prisma db seed

# Start the development server
npm run dev
```

The backend listens on `PORT` from `.env`, or **3010** by default (`backend/src/index.ts`). Align `PORT` with any proxy or frontend `REACT_APP_API_URL`.

### 5. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Optional: see frontend/api-env.sample for REACT_APP_API_URL
# Start the development server
npm start
```

The Create React App dev server listens at **`http://localhost:3000`** by default.

**API requests:** `frontend/package.json` defines **`proxy`** to `http://localhost:3010` so the UI can call **`/candidates`** and **`/upload`** with relative URLs when **`REACT_APP_API_URL` is unset**. To target another URL explicitly, set **`REACT_APP_API_URL`** (see `frontend/api-env.sample`). With a full URL, ensure the backend allows that origin (**CORS**) or use the proxy approach.

### 6. Cypress Testing Suite Setup

```bash
# From the frontend directory
cd frontend

# Open Cypress Test Runner (interactive)
npm run cypress:open

# Or run tests headlessly (requires `npm start` in another terminal unless stubs only)
npm run cypress:run
```

## 🧪 Testing

### Backend Testing

Unit tests run without a database. **Integration tests** (`src/tests/candidates.integration.test.ts`) require `DATABASE_URL` (for example after `docker compose up -d` and a configured `backend/.env`). If `DATABASE_URL` is unset and no `.env` provides it, integration examples are skipped.

```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Frontend Testing

```bash
cd frontend

# Run unit tests (non-watch; configured via jest.config.js)
npm test -- --watchAll=false

# Run unit tests
npm test

# Run E2E tests with Cypress
npm run cypress:run

# Open Cypress Test Runner
npm run cypress:open
```

