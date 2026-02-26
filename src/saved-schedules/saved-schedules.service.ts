import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSavedScheduleDto } from './dto/create-saved-schedule.dto';
import { SavedScheduleResponseDto } from './dto/saved-schedule-response.dto';
import { Prisma } from '@prisma/client';
import { UpdateSavedScheduleDto } from './dto/update-saved-schedule.dto';

const savedScheduleInclude = {
  schedulesSections: {
    include: {
      section: {
        include: {
          subject: true,
          professor: true,
          sectionDays: { include: { day: true } },
        },
      },
    },
  },
} satisfies Prisma.SavedScheduleInclude;

@Injectable()
export class SavedSchedulesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateSavedScheduleDto) {
    const schedule = await this.prisma.savedSchedule.create({
      data: {
        name: dto.name,
        userId,
        schedulesSections: {
          create: dto.sectionIds.map((sectionId) => ({ sectionId })),
        },
      },
      include: savedScheduleInclude,
    });

    return SavedScheduleResponseDto.fromPrisma(schedule);
  }

  async findAll(userId: string) {
    const schedules = await this.prisma.savedSchedule.findMany({
      where: { userId },
      include: savedScheduleInclude,
      orderBy: { createdAt: 'desc' },
    });

    return schedules.map((schedule) =>
      SavedScheduleResponseDto.fromPrisma(schedule),
    );
  }

  async findOne(id: string, userId: string) {
    const schedule = await this.prisma.savedSchedule.findFirst({
      where: { id, userId },
      include: savedScheduleInclude,
    });

    if (!schedule) throw new NotFoundException('Saved schedule not found');
    return SavedScheduleResponseDto.fromPrisma(schedule);
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateSavedScheduleDto,
  ): Promise<SavedScheduleResponseDto> {
    await this.findOne(id, userId);

    const updated = await this.prisma.savedSchedule.update({
      where: { id },
      data: { name: dto.name },
      include: savedScheduleInclude,
    });

    return SavedScheduleResponseDto.fromPrisma(updated);
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);

    return this.prisma.savedSchedule.delete({
      where: { id },
    });
  }
}
