import { SectionPruner } from './section-pruner';
import { RuleType } from '../rules/rule-catalog';
import { ParameterType } from 'src/types/rule-parameter.types';

const mockSection = (
  id: string,
  startHour: number,
  endHour: number,
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
  sectionDays: [
    {
      id: `sd-${id}`,
      sectionId: id,
      dayId: 1,
      day: { id: 1, name: 'monday' },
    },
  ],
});

describe('SectionPruner', () => {
  let pruner: SectionPruner;

  beforeEach(() => {
    pruner = new SectionPruner();
  });

  describe('prune', () => {
    it('should return all sections when no rules provided', () => {
      const sections = [mockSection('s1', 7, 9), mockSection('s2', 14, 16)];

      const result = pruner.prune(sections, []);
      expect(result).toHaveLength(2);
      expect(result).toEqual(sections);
    });

    it('should not modify original sections array', () => {
      const sections = [mockSection('s1', 7, 9)];
      const originalLength = sections.length;

      pruner.prune(sections, [
        { type: RuleType.NO_GAPS, priorityOrder: 1, parameters: null },
      ]);

      expect(sections).toHaveLength(originalLength);
    });
  });

  describe('AVOID_PROFESSOR', () => {
    it('should filter out sections with avoided professor', () => {
      const sections = [
        mockSection('s1', 7, 9, 'prof1'),
        mockSection('s2', 14, 16, 'prof2'),
        mockSection('s3', 9, 11, 'prof1'),
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

      const result = pruner.prune(sections, rules);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('s2');
      expect(result[0].professorId).toBe('prof2');
    });

    it('should keep sections with no professor assigned', () => {
      const sections = [
        mockSection('s1', 7, 9, 'prof1'),
        mockSection('s2', 14, 16, null),
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

      const result = pruner.prune(sections, rules);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('s2');
      expect(result[0].professorId).toBeNull();
    });

    it('should return all sections if avoided professor does not match any', () => {
      const sections = [
        mockSection('s1', 7, 9, 'prof1'),
        mockSection('s2', 14, 16, 'prof2'),
      ];

      const rules = [
        {
          type: RuleType.AVOID_PROFESSOR,
          priorityOrder: 1,
          parameters: {
            type: ParameterType.PROFESSOR_SELECT as const,
            value: 'prof3',
          },
        },
      ];

      const result = pruner.prune(sections, rules);

      expect(result).toHaveLength(2);
    });

    it('should return all sections if parameters are null', () => {
      const sections = [mockSection('s1', 7, 9, 'prof1')];

      const rules = [
        {
          type: RuleType.AVOID_PROFESSOR,
          priorityOrder: 1,
          parameters: null,
        },
      ];

      const result = pruner.prune(sections, rules);

      expect(result).toHaveLength(1);
    });
  });

  describe('LUNCH_BREAK_PROTECTED', () => {
    it('should filter out sections that overlap with lunch break', () => {
      const sections = [
        mockSection('s1', 7, 9), // No overlap
        mockSection('s2', 12, 14), // Full overlap
        mockSection('s3', 14, 16), // No overlap
      ];

      const rules = [
        {
          type: RuleType.LUNCH_BREAK_PROTECTED,
          priorityOrder: 1,
          parameters: {
            type: ParameterType.TIME_RANGE as const,
            value: { start: '12:00', end: '14:00' },
          },
        },
      ];

      const result = pruner.prune(sections, rules);

      expect(result).toHaveLength(2);
      expect(result.map((s) => s.id)).toEqual(['s1', 's3']);
    });

    it('should filter out sections with partial overlap at start', () => {
      const sections = [mockSection('s1', 11, 13)];

      const rules = [
        {
          type: RuleType.LUNCH_BREAK_PROTECTED,
          priorityOrder: 1,
          parameters: {
            type: ParameterType.TIME_RANGE as const,
            value: { start: '12:00', end: '14:00' },
          },
        },
      ];

      const result = pruner.prune(sections, rules);

      expect(result).toHaveLength(0);
    });

    it('should filter out sections with partial overlap at end', () => {
      const sections = [mockSection('s1', 13, 15)];

      const rules = [
        {
          type: RuleType.LUNCH_BREAK_PROTECTED,
          priorityOrder: 1,
          parameters: {
            type: ParameterType.TIME_RANGE as const,
            value: { start: '12:00', end: '14:00' },
          },
        },
      ];

      const result = pruner.prune(sections, rules);

      expect(result).toHaveLength(0);
    });

    it('should keep sections that end exactly when lunch starts', () => {
      const sections = [mockSection('s1', 10, 12)];

      const rules = [
        {
          type: RuleType.LUNCH_BREAK_PROTECTED,
          priorityOrder: 1,
          parameters: {
            type: ParameterType.TIME_RANGE as const,
            value: { start: '12:00', end: '14:00' },
          },
        },
      ];

      const result = pruner.prune(sections, rules);

      expect(result).toHaveLength(1);
    });

    it('should keep sections that start exactly when lunch ends', () => {
      const sections = [mockSection('s1', 14, 16)];

      const rules = [
        {
          type: RuleType.LUNCH_BREAK_PROTECTED,
          priorityOrder: 1,
          parameters: {
            type: ParameterType.TIME_RANGE as const,
            value: { start: '12:00', end: '14:00' },
          },
        },
      ];

      const result = pruner.prune(sections, rules);

      expect(result).toHaveLength(1);
    });

    it('should return all sections if parameters are null', () => {
      const sections = [mockSection('s1', 12, 14)];

      const rules = [
        {
          type: RuleType.LUNCH_BREAK_PROTECTED,
          priorityOrder: 1,
          parameters: null,
        },
      ];

      const result = pruner.prune(sections, rules);

      expect(result).toHaveLength(1);
    });

    it('should handle lunch break with minutes', () => {
      const sections = [
        mockSection('s1', 12, 13), // 12:00-13:00 overlaps with 12:30-13:30
      ];

      const rules = [
        {
          type: RuleType.LUNCH_BREAK_PROTECTED,
          priorityOrder: 1,
          parameters: {
            type: ParameterType.TIME_RANGE as const,
            value: { start: '12:30', end: '13:30' },
          },
        },
      ];

      const result = pruner.prune(sections, rules);

      expect(result).toHaveLength(0);
    });
  });

  describe('multiple rules', () => {
    it('should apply multiple pruning rules sequentially', () => {
      const sections = [
        mockSection('s1', 7, 9, 'prof1'), // Filtered by AVOID_PROFESSOR
        mockSection('s2', 12, 14, 'prof2'), // Filtered by LUNCH_BREAK
        mockSection('s3', 14, 16, 'prof2'), // Passes all filters
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
        {
          type: RuleType.LUNCH_BREAK_PROTECTED,
          priorityOrder: 2,
          parameters: {
            type: ParameterType.TIME_RANGE as const,
            value: { start: '12:00', end: '14:00' },
          },
        },
      ];

      const result = pruner.prune(sections, rules);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('s3');
    });

    it('should handle rules in any order', () => {
      const sections = [
        mockSection('s1', 12, 14, 'prof1'),
        mockSection('s2', 14, 16, 'prof2'),
      ];

      const rules = [
        {
          type: RuleType.LUNCH_BREAK_PROTECTED,
          priorityOrder: 1,
          parameters: {
            type: ParameterType.TIME_RANGE as const,
            value: { start: '12:00', end: '14:00' },
          },
        },
        {
          type: RuleType.AVOID_PROFESSOR,
          priorityOrder: 2,
          parameters: {
            type: ParameterType.PROFESSOR_SELECT as const,
            value: 'prof1',
          },
        },
      ];

      const result = pruner.prune(sections, rules);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('s2');
    });

    it('should return empty array if all sections are filtered', () => {
      const sections = [
        mockSection('s1', 12, 14, 'prof1'),
        mockSection('s2', 12, 14, 'prof2'),
      ];

      const rules = [
        {
          type: RuleType.LUNCH_BREAK_PROTECTED,
          priorityOrder: 1,
          parameters: {
            type: ParameterType.TIME_RANGE as const,
            value: { start: '12:00', end: '14:00' },
          },
        },
      ];

      const result = pruner.prune(sections, rules);

      expect(result).toHaveLength(0);
    });
  });
});
