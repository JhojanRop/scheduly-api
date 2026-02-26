import { RuleStrategy, SectionWithRelations } from './rule-strategy.interface';

export class PreferMorningStrategy implements RuleStrategy {
  private readonly MORNING_START = 6 * 60;
  private readonly MORNING_END = 14 * 60;

  evaluate(combination: SectionWithRelations[]): number {
    let morningCount = 0;

    for (const section of combination) {
      const startHour = section.startTime.getUTCHours();
      const startMinutes = section.startTime.getUTCMinutes();
      const startInMinutes = startHour * 60 + startMinutes;

      if (
        startInMinutes >= this.MORNING_START &&
        startInMinutes < this.MORNING_END
      ) {
        morningCount++;
      }
    }

    return morningCount / combination.length;
  }
}
