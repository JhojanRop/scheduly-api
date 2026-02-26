import { RuleStrategy, SectionWithRelations } from './rule-strategy.interface';

export class NoGapsStrategy implements RuleStrategy {
  evaluate(combination: SectionWithRelations[]): number {
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

    let totalGapHours = 0;

    for (const [, sections] of sectionsByDay) {
      const sorted = [...sections].sort(
        (a, b) => a.startTime.getTime() - b.startTime.getTime(),
      );

      for (let i = 0; i < sorted.length - 1; i++) {
        const currentEnd = sorted[i].endTime.getTime();
        const nextStart = sorted[i + 1].startTime.getTime();
        const gapMinutes = (nextStart - currentEnd) / (1000 * 60);

        if (gapMinutes > 0) {
          totalGapHours += Math.ceil(gapMinutes / 60);
        }
      }
    }

    return totalGapHours === 0 ? 1 : Math.max(0, 1 - totalGapHours * 0.25);
  }
}
