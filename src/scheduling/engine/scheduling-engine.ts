import { SectionWithRelations } from '../rules/strategies/rule-strategy.interface';
import { RuleScorer } from '../rules/rule-scorer';
import { SectionPruner, UserRule } from '../pruning/section-pruner';

export type { SectionWithRelations };

export interface ScoredCombination {
  sections: SectionWithRelations[];
  score: number;
}

export class SchedulingEngine {
  private readonly scorer: RuleScorer;
  private readonly pruner: SectionPruner;
  private readonly TOP_RESULTS = 3;

  constructor() {
    this.scorer = new RuleScorer();
    this.pruner = new SectionPruner();
  }

  generate(
    sectionsBySubject: Map<string, SectionWithRelations[]>,
    userRules: UserRule[],
  ): ScoredCombination[] {
    // Fase 1: Pruning previo
    const prunedSectionsBySubject = new Map<string, SectionWithRelations[]>();

    for (const [subjectId, sections] of sectionsBySubject) {
      const pruned = this.pruner.prune(sections, userRules);

      if (pruned.length === 0) {
        throw new Error(
          `No available sections for subject ${subjectId} after applying rules. Consider removing or adjusting some rules.`,
        );
      }

      prunedSectionsBySubject.set(subjectId, pruned);
    }

    // Ordenar materias por cantidad de secciones (menos secciones primero)
    const subjects = [...prunedSectionsBySubject.entries()].sort(
      (a, b) => a[1].length - b[1].length,
    );

    // Fase 2: Backtracking + Scoring
    const topResults: ScoredCombination[] = [];
    this.backtrack(subjects, 0, [], userRules, topResults);

    // Si no se encontró ninguna combinación válida
    if (topResults.length === 0) {
      throw new Error(
        'No valid schedule combinations found. There may be too many conflicts between sections.',
      );
    }

    return topResults.sort((a, b) => b.score - a.score);
  }

  private backtrack(
    subjects: [string, SectionWithRelations[]][],
    index: number,
    current: SectionWithRelations[],
    userRules: UserRule[],
    topResults: ScoredCombination[],
  ): void {
    // Combinación completa
    if (index === subjects.length) {
      const score = this.scorer.calculate(current, userRules);
      this.updateTopResults(topResults, { sections: [...current], score });
      return;
    }

    const [, sections] = subjects[index];

    for (const section of sections) {
      // Verificar conflictos de horario con las secciones ya elegidas
      if (!this.hasConflict(section, current)) {
        current.push(section);
        this.backtrack(subjects, index + 1, current, userRules, topResults);
        current.pop(); // backtrack
      }
    }
  }

  private hasConflict(
    section: SectionWithRelations,
    current: SectionWithRelations[],
  ): boolean {
    for (const chosen of current) {
      // Verificar si comparten algún día
      const sharedDays = section.sectionDays.some((sd) =>
        chosen.sectionDays.some((cd) => cd.day.name === sd.day.name),
      );

      if (!sharedDays) continue;

      // Si comparten día, verificar solapamiento de horario
      const sectionStart = section.startTime.getTime();
      const sectionEnd = section.endTime.getTime();
      const chosenStart = chosen.startTime.getTime();
      const chosenEnd = chosen.endTime.getTime();

      const overlaps = sectionStart < chosenEnd && sectionEnd > chosenStart;
      if (overlaps) return true;
    }

    return false;
  }

  private updateTopResults(
    topResults: ScoredCombination[],
    candidate: ScoredCombination,
  ): void {
    topResults.push(candidate);
    topResults.sort((a, b) => b.score - a.score);

    if (topResults.length > this.TOP_RESULTS) {
      topResults.pop();
    }
  }
}
