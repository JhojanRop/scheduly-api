import { RuleScorer } from './rule-scorer';
import { RuleType } from './rule-catalog';
import { ParameterType } from 'src/types/rule-parameter.types';

const mockSection = (
  id: string,
  startHour: number,
  endHour: number,
  days: { id: number; name: string }[],
  professorId: string | null = null,
) => ({
  id,
  subjectId: 'subject1',
  professorId,
  startTime: new Date(
    `1970-01-01T${String(startHour).padStart(2, '0')}:00:00Z`,
  ),
  endTime: new Date(`1970-01-01T${String(endHour).padStart(2, '0')}:00:00Z`),
  subject: { id: 'subject1', name: 'Subject 1', userId: 'user1' },
  professor: professorId
    ? { id: professorId, fullName: `Professor ${professorId}`, userId: 'user1' }
    : null,
  sectionDays: days.map((day, index) => ({
    id: `sd-${id}-${index}`,
    sectionId: id,
    dayId: day.id,
    day,
  })),
});

describe('RuleScorer', () => {
  let scorer: RuleScorer;

  beforeEach(() => {
    scorer = new RuleScorer();
  });

  describe('calculate', () => {
    it('should return 0 if no rules provided', () => {
      const combination = [
        mockSection('s1', 7, 9, [{ id: 1, name: 'monday' }]),
      ];

      const score = scorer.calculate(combination, []);
      expect(score).toBe(0);
    });

    it('should give higher score to morning sections with PREFER_MORNING rule', () => {
      const morningSections = [
        mockSection('s1', 7, 9, [{ id: 1, name: 'monday' }]),
        mockSection('s2', 9, 11, [{ id: 2, name: 'tuesday' }]),
      ];

      const afternoonSections = [
        mockSection('s3', 14, 16, [{ id: 1, name: 'monday' }]),
        mockSection('s4', 16, 18, [{ id: 2, name: 'tuesday' }]),
      ];

      const rules = [
        { type: RuleType.PREFER_MORNING, priorityOrder: 1, parameters: null },
      ];

      const morningScore = scorer.calculate(morningSections, rules);
      const afternoonScore = scorer.calculate(afternoonSections, rules);

      expect(morningScore).toBeGreaterThan(afternoonScore);
    });

    it('should give higher score to combinations without gaps with NO_GAPS rule', () => {
      const noGapSections = [
        mockSection('s1', 7, 9, [{ id: 1, name: 'monday' }]),
        mockSection('s2', 9, 11, [{ id: 1, name: 'monday' }]),
      ];

      const gapSections = [
        mockSection('s3', 7, 9, [{ id: 1, name: 'monday' }]),
        mockSection('s4', 11, 13, [{ id: 1, name: 'monday' }]),
      ];

      const rules = [
        { type: RuleType.NO_GAPS, priorityOrder: 1, parameters: null },
      ];

      const noGapScore = scorer.calculate(noGapSections, rules);
      const gapScore = scorer.calculate(gapSections, rules);

      expect(noGapScore).toBeGreaterThan(gapScore);
    });

    it('should weight rules by priority correctly', () => {
      const combination = [
        mockSection('s1', 7, 9, [{ id: 1, name: 'monday' }]),
      ];

      const highPriorityRules = [
        { type: RuleType.PREFER_MORNING, priorityOrder: 1, parameters: null },
      ];

      const lowPriorityRules = [
        { type: RuleType.PREFER_MORNING, priorityOrder: 5, parameters: null },
      ];

      const highScore = scorer.calculate(combination, highPriorityRules);
      const lowScore = scorer.calculate(combination, lowPriorityRules);

      expect(highScore).toBeGreaterThan(lowScore);
    });

    it('should give score 0 for section with avoided professor', () => {
      const combination = [
        mockSection('s1', 7, 9, [{ id: 1, name: 'monday' }], 'prof1'),
      ];

      const rules = [
        {
          type: RuleType.AVOID_PROFESSOR,
          priorityOrder: 1,
          parameters: {
            type: ParameterType.PROFESSOR_SELECT as const,
            value: 'prof1',
          },
        },
      ];

      const score = scorer.calculate(combination, rules);
      expect(score).toBe(0);
    });
  });
});
