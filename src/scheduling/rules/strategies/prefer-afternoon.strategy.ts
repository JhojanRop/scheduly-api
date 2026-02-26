import { RuleStrategy, SectionWithRelations } from './rule-strategy.interface';

export class PreferAfternoonStrategy implements RuleStrategy {
  private readonly AFTERNOON_START = 14 * 60;
  private readonly AFTERNOON_END = 22 * 60;

  evaluate(combination: SectionWithRelations[]): number {
    let afternoonCount = 0;

    for (const section of combination) {
      const startHour = section.startTime.getUTCHours();
      const startMinutes = section.startTime.getUTCMinutes();
      const startInMinutes = startHour * 60 + startMinutes;

      if (
        startInMinutes >= this.AFTERNOON_START &&
        startInMinutes < this.AFTERNOON_END
      ) {
        afternoonCount++;
      }
    }

    return afternoonCount / combination.length;
  }
}
