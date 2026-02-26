import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SchedulingEngine } from './engine/scheduling-engine';
import { GenerateScheduleDto } from './dto/generate-schedule.dto';
import { ScheduleResultDto } from './dto/schedule-result.dto';
import { UserRule } from './pruning/section-pruner';
import { Prisma } from '@prisma/client';
import { RuleType } from './rules/rule-catalog';
import { RuleParameter } from 'src/types/rule-parameter.types';

type SectionWithRelations = Prisma.SectionGetPayload<{
  include: {
    subject: true;
    professor: true;
    sectionDays: { include: { day: true } };
  };
}>;

@Injectable()
export class SchedulingService {
  constructor(private readonly prisma: PrismaService) {}

  async generate(
    userId: string,
    dto: GenerateScheduleDto,
  ): Promise<ScheduleResultDto[]> {
    // Obtener las reglas del usuario ordenadas por prioridad
    const userRules = await this.prisma.rule.findMany({
      where: { userId },
      orderBy: { priorityOrder: 'asc' },
    });

    // Obtener todas las secciones de las materias solicitadas
    const sections = await this.prisma.section.findMany({
      where: {
        subject: {
          id: { in: dto.subjectIds },
          userId,
        },
      },
      include: {
        subject: true,
        professor: true,
        sectionDays: { include: { day: true } },
      },
    });

    if (sections.length === 0) {
      throw new BadRequestException('No sections found for the given subjects');
    }

    // Organizar secciones por materia
    const sectionsBySubject = new Map<string, SectionWithRelations[]>();

    for (const subjectId of dto.subjectIds) {
      const subjectSections = sections.filter((s) => s.subjectId === subjectId);

      if (subjectSections.length === 0) {
        throw new BadRequestException(
          `No sections found for subject ${subjectId}`,
        );
      }

      sectionsBySubject.set(subjectId, subjectSections);
    }

    // Mapear reglas al formato del motor
    const engineRules: UserRule[] = userRules.map((rule) => ({
      type: rule.type as RuleType,
      priorityOrder: rule.priorityOrder,
      parameters: rule.parameters as RuleParameter,
    }));

    // Correr el motor
    try {
      const engine = new SchedulingEngine();
      const results = engine.generate(sectionsBySubject, engineRules);

      return results.map((result, index) =>
        ScheduleResultDto.fromResult(result, index + 1),
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(message);
    }
  }
}
