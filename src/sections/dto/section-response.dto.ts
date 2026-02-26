import { Prisma } from '@prisma/client';

type SectionWithRelations = Prisma.SectionGetPayload<{
  include: {
    sectionDays: {
      include: { day: true };
    };
    subject: true;
    professor: true;
  };
}>;

export class SectionResponseDto {
  id: string;
  startTime: string;
  endTime: string;
  subject: {
    id: string;
    name: string;
  };
  professor: {
    id: string;
    fullName: string;
  } | null;
  days: string[];

  static fromPrisma(section: SectionWithRelations): SectionResponseDto {
    return {
      id: section.id,
      startTime: section.startTime.toISOString().substring(11, 16),
      endTime: section.endTime.toISOString().substring(11, 16),
      subject: {
        id: section.subject.id,
        name: section.subject.name,
      },
      professor: section.professor
        ? {
            id: section.professor.id,
            fullName: section.professor.fullName,
          }
        : null,
      days: section.sectionDays.map((sd) => sd.day.name),
    };
  }
}
