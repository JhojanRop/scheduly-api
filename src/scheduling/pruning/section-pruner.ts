import { ParameterType, RuleParameter } from 'src/types/rule-parameter.types';
import { RuleType } from '../rules/rule-catalog';
import { SectionWithRelations } from '../rules/strategies/rule-strategy.interface';

export interface UserRule {
  type: RuleType;
  priorityOrder: number;
  parameters: RuleParameter;
}

export class SectionPruner {
  prune(
    sections: SectionWithRelations[],
    userRules: UserRule[],
  ): SectionWithRelations[] {
    let filtered = [...sections];

    for (const rule of userRules) {
      if (rule.type === RuleType.AVOID_PROFESSOR) {
        filtered = this.applyAvoidProfessor(filtered, rule.parameters);
      }

      if (rule.type === RuleType.LUNCH_BREAK_PROTECTED) {
        filtered = this.applyLunchBreakPruning(filtered, rule.parameters);
      }
    }

    return filtered;
  }

  private applyAvoidProfessor(
    sections: SectionWithRelations[],
    parameters: RuleParameter,
  ): SectionWithRelations[] {
    if (!parameters || parameters.type !== ParameterType.PROFESSOR_SELECT) {
      return sections;
    }

    return sections.filter(
      (section) => section.professorId !== parameters.value,
    );
  }

  private applyLunchBreakPruning(
    sections: SectionWithRelations[],
    parameters: RuleParameter,
  ): SectionWithRelations[] {
    if (!parameters || parameters.type !== ParameterType.TIME_RANGE) {
      return sections;
    }

    const [startHour, startMin] = parameters.value.start.split(':').map(Number);
    const [endHour, endMin] = parameters.value.end.split(':').map(Number);
    const lunchStart = startHour * 60 + startMin;
    const lunchEnd = endHour * 60 + endMin;

    return sections.filter((section) => {
      const sectionStart =
        section.startTime.getUTCHours() * 60 +
        section.startTime.getUTCMinutes();
      const sectionEnd =
        section.endTime.getUTCHours() * 60 + section.endTime.getUTCMinutes();

      const overlaps = sectionStart < lunchEnd && sectionEnd > lunchStart;
      return !overlaps;
    });
  }
}
