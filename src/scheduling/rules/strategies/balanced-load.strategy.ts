import { RuleStrategy, SectionWithRelations } from './rule-strategy.interface';

export class BalancedLoadStrategy implements RuleStrategy {
  evaluate(combination: SectionWithRelations[]): number {
    const hoursByDay = new Map<string, number>();

    for (const section of combination) {
      const durationHours =
        (section.endTime.getTime() - section.startTime.getTime()) /
        (1000 * 60 * 60);

      for (const sectionDay of section.sectionDays) {
        const dayName = sectionDay.day.name;
        const current = hoursByDay.get(dayName) ?? 0;
        hoursByDay.set(dayName, current + durationHours);
      }
    }

    if (hoursByDay.size === 0) return 1;

    const hoursPerDay = [...hoursByDay.values()];
    const avg = hoursPerDay.reduce((a, b) => a + b, 0) / hoursPerDay.length;

    const variance =
      hoursPerDay.reduce((sum, h) => sum + Math.pow(h - avg, 2), 0) /
      hoursPerDay.length;
    const stdDev = Math.sqrt(variance);

    return Math.max(0, 1 - stdDev * 0.2);
  }
}
