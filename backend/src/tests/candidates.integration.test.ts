import request from 'supertest';
import path from 'path';
import fs from 'fs';
import os from 'os';
import dotenv from 'dotenv';
import { createApp } from '../app';
import { prisma } from '../infrastructure/prismaClient';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const hasDatabase = Boolean(process.env.DATABASE_URL);
const describeDb = hasDatabase ? describe : describe.skip;

describeDb('POST /candidates and POST /upload (integration)', () => {
  const app = createApp();
  let tmpUpload: string;

  beforeAll(() => {
    tmpUpload = fs.mkdtempSync(path.join(os.tmpdir(), 'lti-int-'));
    process.env.UPLOAD_DIR = tmpUpload;
  });

  afterAll(async () => {
    await prisma.$disconnect();
    try {
      fs.rmSync(tmpUpload, { recursive: true, force: true });
    } catch {
      /* ignore */
    }
  });

  beforeEach(async () => {
    await prisma.resume.deleteMany();
    await prisma.education.deleteMany();
    await prisma.workExperience.deleteMany();
    await prisma.candidate.deleteMany();
  });

  it('returns 201 for minimal create', async () => {
    const res = await request(app)
      .post('/candidates')
      .send({
        firstName: 'Integration',
        lastName: 'Test',
        email: 'integration.test@example.com',
      })
      .expect(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.email).toBe('integration.test@example.com');
  });

  it('returns 400 for duplicate email', async () => {
    const body = {
      firstName: 'Alice',
      lastName: 'Brown',
      email: 'dup@example.com',
    };
    await request(app).post('/candidates').send(body).expect(201);
    const res = await request(app).post('/candidates').send(body).expect(400);
    expect(res.body.message).toBeDefined();
  });

  it('returns 400 for fourth education', async () => {
    const res = await request(app)
      .post('/candidates')
      .send({
        firstName: 'Edu',
        lastName: 'Four',
        email: 'four@example.com',
        educations: [
          { institution: 'A', title: 'T', startDate: '2020-01-01T00:00:00.000Z' },
          { institution: 'B', title: 'T', startDate: '2020-01-01T00:00:00.000Z' },
          { institution: 'C', title: 'T', startDate: '2020-01-01T00:00:00.000Z' },
          { institution: 'D', title: 'T', startDate: '2020-01-01T00:00:00.000Z' },
        ],
      })
      .expect(400);
    expect(res.body.message).toBeDefined();
  });

  it('uploads PDF then creates candidate with cv', async () => {
    const pdfPath = path.join(tmpUpload, 'upload-src.pdf');
    fs.writeFileSync(pdfPath, Buffer.from('%PDF-1.4 minimal'));

    const uploadRes = await request(app).post('/upload').attach('file', pdfPath).expect(200);
    expect(uploadRes.body.filePath).toBeDefined();
    expect(uploadRes.body.fileType).toBe('application/pdf');

    const createRes = await request(app)
      .post('/candidates')
      .send({
        firstName: 'With',
        lastName: 'Resume',
        email: 'with.resume@example.com',
        cv: {
          filePath: uploadRes.body.filePath,
          fileType: uploadRes.body.fileType,
        },
      })
      .expect(201);
    expect(createRes.body.id).toBeDefined();

    const resumes = await prisma.resume.findMany({
      where: { candidateId: createRes.body.id },
    });
    expect(resumes).toHaveLength(1);
  });
});
