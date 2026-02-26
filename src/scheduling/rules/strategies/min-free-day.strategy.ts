import { ParameterType, RuleParameter } from 'src/types/rule-parameter.types';
import { RuleStrategy, SectionWithRelations } from './rule-strategy.interface';

export class MinFreeDayStrategy implements RuleStrategy {
  evaluate(
    combination: SectionWithRelations[],
    parameter: RuleParameter,
  ): number {
    const daysWithClasses = new Set<number>();

    for (const section of combination) {
      for (const sectionDay of section.sectionDays) {
        daysWithClasses.add(sectionDay.day.id);
      }
    }

    const totalDays = 7;
    const freeDays = totalDays - daysWithClasses.size;

    if (freeDays === 0) return 0;
    if (parameter && parameter.type === ParameterType.DAY_SELECT) {
      const preferredDay = parameter.value;

      if (!daysWithClasses.has(preferredDay)) {
        return 1;
      } else {
        return Math.min(0.7, freeDays * 0.2);
      }
    }

    return Math.min(1, freeDays * 0.33);
  }
}
