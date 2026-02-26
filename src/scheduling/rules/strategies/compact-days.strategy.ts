import { RuleStrategy, SectionWithRelations } from './rule-strategy.interface';

export class CompactDaysStrategy implements RuleStrategy {
  evaluate(combination: SectionWithRelations[]): number {
    const daysWithClasses = new Set<string>();

    for (const section of combination) {
      for (const sectionDay of section.sectionDays) {
        daysWithClasses.add(sectionDay.day.name);
      }
    }

    const totalDaysUsed = daysWithClasses.size;
    return Math.max(0, 1 - (totalDaysUsed - 1) * 0.17);
  }
}
