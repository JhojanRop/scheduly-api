import { RuleStrategy, SectionWithRelations } from './rule-strategy.interface';

export class NoLateEveningsStrategy implements RuleStrategy {
  private readonly LATE_EVENING_HOUR = 18;

  evaluate(combination: SectionWithRelations[]): number {
    let lateCount = 0;

    for (const section of combination) {
      const endHour = section.endTime.getUTCHours();
      const endMinutes = section.endTime.getUTCMinutes();
      const endInMinutes = endHour * 60 + endMinutes;

      if (endInMinutes > this.LATE_EVENING_HOUR * 60) {
        lateCount++;
      }
    }

    return lateCount === 0 ? 1 : Math.max(0, 1 - lateCount * 0.33);
  }
}
