import { Prisma } from '@prisma/client';

type SectionWithRelations = Prisma.SectionGetPayload<{
  include: {
    subject: true;
    professor: true;
    sectionDays: { include: { day: true } };
  };
}>;

interface ScoredCombination {
  sections: SectionWithRelations[];
  score: number;
}

export class ScheduleResultDto {
  rank: number;
  score: number;
  sections: {
    subject: string;
    professor: string | null;
    startTime: string;
    endTime: string;
    days: string[];
  }[];

  static fromResult(
    result: ScoredCombination,
    rank: number,
  ): ScheduleResultDto {
    return {
      rank,
      score: Math.round(result.score * 100) / 100,
      sections: result.sections.map((section) => ({
        subject: section.subject.name,
        professor: section.professor?.fullName ?? null,
        startTime: section.startTime.toISOString().substring(11, 16),
        endTime: section.endTime.toISOString().substring(11, 16),
        days: section.sectionDays.map((sd) => sd.day.name),
      })),
    };
  }
}
