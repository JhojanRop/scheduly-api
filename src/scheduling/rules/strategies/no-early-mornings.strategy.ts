import { RuleStrategy, SectionWithRelations } from './rule-strategy.interface';

export class NoEarlyMorningsStrategy implements RuleStrategy {
  private readonly EARLY_MORNING_HOUR = 8;

  evaluate(combination: SectionWithRelations[]): number {
    let earlyCount = 0;

    for (const section of combination) {
      const startHour = section.startTime.getUTCHours();
      const startMinutes = section.startTime.getUTCMinutes();
      const startInMinutes = startHour * 60 + startMinutes;

      if (startInMinutes < this.EARLY_MORNING_HOUR * 60) {
        earlyCount++;
      }
    }

    return earlyCount === 0 ? 1 : Math.max(0, 1 - earlyCount * 0.33);
  }
}
