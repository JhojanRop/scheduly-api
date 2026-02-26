import { ParameterType, RuleParameter } from 'src/types/rule-parameter.types';
import { RuleStrategy, SectionWithRelations } from './rule-strategy.interface';

export class MaxConsecutiveHoursStrategy implements RuleStrategy {
  private readonly DEFAULT_MAX_HOURS = 4;

  evaluate(
    combination: SectionWithRelations[],
    parameter: RuleParameter,
  ): number {
    const maxHours =
      parameter && parameter.type === ParameterType.NUMBER
        ? parameter.value
        : this.DEFAULT_MAX_HOURS;

    const sectionsByDay = new Map<string, SectionWithRelations[]>();

    for (const section of combination) {
      for (const sectionDay of section.sectionDays) {
        const dayName = sectionDay.day.name;
        if (!sectionsByDay.has(dayName)) {
          sectionsByDay.set(dayName, []);
        }
        const daySections = sectionsByDay.get(dayName);
        if (daySections) daySections.push(section);
      }
    }

    let violations = 0;

    for (const [, sections] of sectionsByDay) {
      const sorted = [...sections].sort(
        (a, b) => a.startTime.getTime() - b.startTime.getTime(),
      );

      let currentBlockHours = 0;

      for (let i = 0; i < sorted.length; i++) {
        const durationHours =
          (sorted[i].endTime.getTime() - sorted[i].startTime.getTime()) /
          (1000 * 60 * 60);

        if (i === 0) {
          currentBlockHours = durationHours;
        } else {
          const prevEnd = sorted[i - 1].endTime.getTime();
          const currStart = sorted[i].startTime.getTime();
          const gapMinutes = (currStart - prevEnd) / (1000 * 60);

          if (gapMinutes === 0) {
            currentBlockHours += durationHours;
          } else {
            if (currentBlockHours > maxHours) violations++;
            currentBlockHours = durationHours;
          }
        }
      }

      if (currentBlockHours > maxHours) violations++;
    }

    return violations === 0 ? 1 : Math.max(0, 1 - violations * 0.33);
  }
}
