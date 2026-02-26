import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { SectionResponseDto } from './dto/section-response.dto';

@Injectable()
export class SectionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    dto: CreateSectionDto,
  ): Promise<SectionResponseDto> {
    const subject = await this.prisma.subject.findFirst({
      where: { id: dto.subjectId, userId },
    });
    if (!subject) throw new NotFoundException('Subject not found');

    if (dto.professorId) {
      const professor = await this.prisma.professor.findFirst({
        where: { id: dto.professorId, userId },
      });
      if (!professor) throw new NotFoundException('Professor not found');
    }

    const section = await this.prisma.section.create({
      data: {
        startTime: new Date(`1970-01-01T${dto.startTime}:00Z`),
        endTime: new Date(`1970-01-01T${dto.endTime}:00Z`),
        subjectId: dto.subjectId,
        professorId: dto.professorId ?? null,
        sectionDays: {
          create: dto.dayIds.map((dayId) => ({ dayId })),
        },
      },
      include: {
        sectionDays: {
          include: { day: true },
        },
        subject: true,
        professor: true,
      },
    });

    return SectionResponseDto.fromPrisma(section);
  }

  async findAll(userId: string): Promise<SectionResponseDto[]> {
    const sections = await this.prisma.section.findMany({
      where: {
        subject: { userId },
      },
      include: {
        sectionDays: {
          include: { day: true },
        },
        subject: true,
        professor: true,
      },
    });

    return sections.map((section) => SectionResponseDto.fromPrisma(section));
  }

  async findOne(id: string, userId: string): Promise<SectionResponseDto> {
    const section = await this.prisma.section.findFirst({
      where: {
        id,
        subject: { userId },
      },
      include: {
        sectionDays: {
          include: { day: true },
        },
        subject: true,
        professor: true,
      },
    });

    if (!section) throw new NotFoundException('Section not found');
    return SectionResponseDto.fromPrisma(section);
  }

  async update(
    id: string,
    userId: string,
    dto: CreateSectionDto,
  ): Promise<SectionResponseDto> {
    await this.findOne(id, userId);

    await this.prisma.sectionDay.deleteMany({
      where: { sectionId: id },
    });

    const updatedSection = await this.prisma.section.update({
      where: { id },
      data: {
        startTime: new Date(`1970-01-01T${dto.startTime}:00Z`),
        endTime: new Date(`1970-01-01T${dto.endTime}:00Z`),
        subjectId: dto.subjectId,
        professorId: dto.professorId ?? null,
        sectionDays: {
          create: dto.dayIds.map((dayId) => ({ dayId })),
        },
      },
      include: {
        sectionDays: {
          include: { day: true },
        },
        subject: true,
        professor: true,
      },
    });

    return SectionResponseDto.fromPrisma(updatedSection);
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.findOne(id, userId);

    await this.prisma.section.delete({
      where: { id },
    });
  }
}
