import { ParameterType, RuleParameter } from 'src/types/rule-parameter.types';
import { RuleStrategy, SectionWithRelations } from './rule-strategy.interface';

export class AvoidProfessorStrategy implements RuleStrategy {
  evaluate(
    combination: SectionWithRelations[],
    parameter: RuleParameter,
  ): number {
    if (!parameter || parameter.type !== ParameterType.PROFESSOR_SELECT) {
      return 1;
    }

    const professorId = parameter.value;

    const hasUnwantedProfessor = combination.some(
      (section) => section.professorId === professorId,
    );

    return hasUnwantedProfessor ? 0 : 1;
  }
}
