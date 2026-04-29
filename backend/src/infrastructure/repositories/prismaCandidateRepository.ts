import type { Prisma } from '@prisma/client';
import { prisma } from '../prismaClient';
import type { ICandidateRepository } from '../../domain/repositories/ICandidateRepository';
import type { CreateCandidateRequestValidated } from '../../types/api';
import type { CreateCandidateResponse } from '../../types/api';

export class PrismaCandidateRepository implements ICandidateRepository {
  async existsByEmail(email: string): Promise<boolean> {
    const row = await prisma.candidate.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true },
    });
    return row !== null;
  }

  async createWithRelations(input: CreateCandidateRequestValidated): Promise<CreateCandidateResponse> {
    const email = input.email.toLowerCase();

    const educationsData: Prisma.EducationCreateWithoutCandidateInput[] | undefined =
      input.educations?.map((e) => ({
        institution: e.institution,
        title: e.title,
        startDate: new Date(e.startDate),
        endDate: e.endDate ? new Date(e.endDate) : null,
      }));

    const workData: Prisma.WorkExperienceCreateWithoutCandidateInput[] | undefined =
      input.workExperiences?.map((w) => ({
        company: w.company,
        position: w.position,
        description: w.description ?? null,
        startDate: new Date(w.startDate),
        endDate: w.endDate ? new Date(w.endDate) : null,
      }));

    const resumesData: Prisma.ResumeCreateWithoutCandidateInput | undefined = input.cv
      ? {
          filePath: input.cv.filePath,
          fileType: input.cv.fileType,
        }
      : undefined;

    const candidate = await prisma.$transaction(async (tx) => {
      return tx.candidate.create({
        data: {
          firstName: input.firstName,
          lastName: input.lastName,
          email,
          phone: input.phone ?? null,
          address: input.address ?? null,
          educations: educationsData?.length
            ? {
                create: educationsData,
              }
            : undefined,
          workExperiences: workData?.length
            ? {
                create: workData,
              }
            : undefined,
          resumes: resumesData
            ? {
                create: resumesData,
              }
            : undefined,
        },
      });
    });

    const response: CreateCandidateResponse = {
      id: candidate.id,
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      email: candidate.email,
    };
    if (candidate.phone !== null && candidate.phone !== undefined) {
      response.phone = candidate.phone;
    }
    if (candidate.address !== null && candidate.address !== undefined) {
      response.address = candidate.address;
    }
    return response;
  }
}

export const prismaCandidateRepository = new PrismaCandidateRepository();
