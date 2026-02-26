import { AvoidProfessorStrategy } from './strategies/avoid-professor.strategy';
import { BalancedLoadStrategy } from './strategies/balanced-load.strategy';
import { CompactDaysStrategy } from './strategies/compact-days.strategy';
import { LunchBreakProtectedStrategy } from './strategies/lunch-break-protected.strategy';
import { MaxConsecutiveHoursStrategy } from './strategies/max-consecutive-hours.strategy';
import { MinFreeDayStrategy } from './strategies/min-free-day.strategy';
import { NoEarlyMorningsStrategy } from './strategies/no-early-mornings.strategy';
import { NoGapsStrategy } from './strategies/no-gaps.strategy';
import { NoLateEveningsStrategy } from './strategies/no-late-evenings.strategy';
import { PreferAfternoonStrategy } from './strategies/prefer-afternoon.strategy';
import { PreferMorningStrategy } from './strategies/prefer-morning.strategy';
import { RuleParameter } from 'src/types/rule-parameter.types';
import {
  RuleStrategy,
  SectionWithRelations,
} from './strategies/rule-strategy.interface';
import { RuleType } from './rule-catalog';

interface UserRule {
  type: string;
  priorityOrder: number;
  parameters: RuleParameter;
}

export class RuleScorer {
  private readonly strategies: Map<RuleType, RuleStrategy>;

  constructor() {
    this.strategies = new Map([
      [RuleType.NO_GAPS, new NoGapsStrategy()],
      [RuleType.NO_EARLY_MORNINGS, new NoEarlyMorningsStrategy()],
      [RuleType.NO_LATE_EVENINGS, new NoLateEveningsStrategy()],
      [RuleType.PREFER_MORNING, new PreferMorningStrategy()],
      [RuleType.PREFER_AFTERNOON, new PreferAfternoonStrategy()],
      [RuleType.COMPACT_DAYS, new CompactDaysStrategy()],
      [RuleType.BALANCED_LOAD, new BalancedLoadStrategy()],
      [RuleType.MIN_FREE_DAY, new MinFreeDayStrategy()],
      [RuleType.MAX_CONSECUTIVE_HOURS, new MaxConsecutiveHoursStrategy()],
      [RuleType.LUNCH_BREAK_PROTECTED, new LunchBreakProtectedStrategy()],
      [RuleType.AVOID_PROFESSOR, new AvoidProfessorStrategy()],
    ]);
  }

  calculate(
    combination: SectionWithRelations[],
    userRules: UserRule[],
  ): number {
    let totalScore = 0;

    for (const rule of userRules) {
      const strategy = this.strategies.get(rule.type as RuleType);
      if (!strategy) continue;

      const weight = 100 / rule.priorityOrder;
      const value = strategy.evaluate(combination, rule.parameters);
      totalScore += weight * value;
    }

    return totalScore;
  }
}
