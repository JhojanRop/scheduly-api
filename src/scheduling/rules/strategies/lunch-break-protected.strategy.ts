import { ParameterType, RuleParameter } from 'src/types/rule-parameter.types';
import { RuleStrategy, SectionWithRelations } from './rule-strategy.interface';

export class LunchBreakProtectedStrategy implements RuleStrategy {
  private readonly DEFAULT_START = 12 * 60;
  private readonly DEFAULT_END = 14 * 60;

  evaluate(
    combination: SectionWithRelations[],
    parameter: RuleParameter,
  ): number {
    let lunchStart = this.DEFAULT_START;
    let lunchEnd = this.DEFAULT_END;

    if (parameter && parameter.type === ParameterType.TIME_RANGE) {
      const range = parameter.value;
      const [startHour, startMin] = range.start.split(':').map(Number);
      const [endHour, endMin] = range.end.split(':').map(Number);
      lunchStart = startHour * 60 + startMin;
      lunchEnd = endHour * 60 + endMin;
    }

    let violations = 0;

    for (const section of combination) {
      const startHour = section.startTime.getUTCHours();
      const startMinutes = section.startTime.getUTCMinutes();
      const endHour = section.endTime.getUTCHours();
      const endMinutes = section.endTime.getUTCMinutes();

      const sectionStart = startHour * 60 + startMinutes;
      const sectionEnd = endHour * 60 + endMinutes;

      const overlaps = sectionStart < lunchEnd && sectionEnd > lunchStart;
      if (overlaps) violations++;
    }

    return violations === 0 ? 1 : Math.max(0, 1 - violations * 0.5);
  }
}
