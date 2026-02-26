import { RuleParameter } from 'src/types/rule-parameter.types';
import { Prisma } from '@prisma/client';

export type SectionWithRelations = Prisma.SectionGetPayload<{
  include: {
    subject: true;
    professor: true;
    sectionDays: { include: { day: true } };
  };
}>;

export interface RuleStrategy {
  evaluate(
    combination: SectionWithRelations[],
    parameter: RuleParameter,
  ): number;
}
