import { Prisma } from '@prisma/client';

type SavedScheduleWithRelations = Prisma.SavedScheduleGetPayload<{
  include: {
    schedulesSections: {
      include: {
        section: {
          include: {
            subject: true;
            professor: true;
            sectionDays: { include: { day: true } };
          };
        };
      };
    };
  };
}>;

export class SavedScheduleResponseDto {
  id: string;
  name: string;
  createdAt: string;
  sections: {
    sectionId: string;
    subject: string;
    professor: string | null;
    startTime: string;
    endTime: string;
    days: string[];
  }[];

  static fromPrisma(
    schedule: SavedScheduleWithRelations,
  ): SavedScheduleResponseDto {
    return {
      id: schedule.id,
      name: schedule.name,
      createdAt: schedule.createdAt.toISOString(),
      sections: schedule.schedulesSections.map((ss) => ({
        sectionId: ss.section.id,
        subject: ss.section.subject.name,
        professor: ss.section.professor?.fullName ?? null,
        startTime: ss.section.startTime.toISOString().substring(11, 16),
        endTime: ss.section.endTime.toISOString().substring(11, 16),
        days: ss.section.sectionDays.map((sd) => sd.day.name),
      })),
    };
  }
}
