import { ParameterType } from 'src/types/rule-parameter.types';
import { MaxConsecutiveHoursStrategy } from './max-consecutive-hours.strategy';

const mockSection = (
  id: string,
  startHour: number,
  endHour: number,
  dayName: string,
) => ({
  id,
  subjectId: 'subject1',
  professorId: null,
  startTime: new Date(
    `1970-01-01T${String(startHour).padStart(2, '0')}:00:00Z`,
  ),
  endTime: new Date(`1970-01-01T${String(endHour).padStart(2, '0')}:00:00Z`),
  subject: { id: 'subject1', name: 'Subject 1', userId: 'user1' },
  professor: null,
  sectionDays: [
    {
      id: `sd-${id}-1`,
      sectionId: id,
      dayId: 1,
      day: { id: 1, name: dayName },
    },
  ],
});

describe('MaxConsecutiveHoursStrategy', () => {
  let strategy: MaxConsecutiveHoursStrategy;

  beforeEach(() => {
    strategy = new MaxConsecutiveHoursStrategy();
  });

  describe('evaluate with default max hours (4)', () => {
    it('should return 1.0 when no violations', () => {
      const combination = [
        mockSection('s1', 8, 10, 'monday'), // 2 hours
        mockSection('s2', 10, 12, 'monday'), // 2 hours, total 4
      ];

      const score = strategy.evaluate(combination, undefined);
      expect(score).toBe(1.0);
    });

    it('should penalize one violation', () => {
      const combination = [
        mockSection('s1', 8, 10, 'monday'), // 2 hours
        mockSection('s2', 10, 12, 'monday'), // 2 hours
        mockSection('s3', 12, 15, 'monday'), // 3 hours, total 7 > 4
      ];

      const score = strategy.evaluate(combination, undefined);
      expect(score).toBeCloseTo(0.67, 2); // 1 - 1 * 0.33
    });

    it('should penalize two violations', () => {
      const combination = [
        mockSection('s1', 8, 10, 'monday'), // 2 hours
        mockSection('s2', 10, 12, 'monday'), // 2 hours
        mockSection('s3', 12, 15, 'monday'), // 3 hours, total 7 > 4
        mockSection('s4', 8, 10, 'tuesday'), // 2 hours
        mockSection('s5', 10, 13, 'tuesday'), // 3 hours, total 5 > 4
      ];

      const score = strategy.evaluate(combination, undefined);
      expect(score).toBeCloseTo(0.34, 2); // 1 - 2 * 0.33
    });

    it('should return 0 for many violations', () => {
      const combination = [
        mockSection('s1', 8, 13, 'monday'), // 5 hours > 4
        mockSection('s2', 8, 13, 'tuesday'), // 5 hours > 4
        mockSection('s3', 8, 13, 'wednesday'), // 5 hours > 4
        mockSection('s4', 8, 13, 'thursday'), // 5 hours > 4
      ];

      const score = strategy.evaluate(combination, undefined);
      expect(score).toBe(0); // Math.max(0, 1 - 4 * 0.33)
    });

    it('should not count gap as consecutive', () => {
      const combination = [
        mockSection('s1', 8, 10, 'monday'), // 2 hours
        mockSection('s2', 11, 13, 'monday'), // 2 hours with gap, separate block
      ];

      const score = strategy.evaluate(combination, undefined);
      expect(score).toBe(1.0); // No violations, two separate blocks
    });

    it('should handle multiple blocks on same day', () => {
      const combination = [
        mockSection('s1', 8, 10, 'monday'), // 2 hours
        mockSection('s2', 10, 12, 'monday'), // 2 hours, block 1 total: 4
        mockSection('s3', 13, 15, 'monday'), // 2 hours, block 2 after gap
        mockSection('s4', 15, 17, 'monday'), // 2 hours, block 2 total: 4
      ];

      const score = strategy.evaluate(combination, undefined);
      expect(score).toBe(1.0); // No violations in either block
    });

    it('should handle multiple blocks with one violation', () => {
      const combination = [
        mockSection('s1', 8, 10, 'monday'), // 2 hours
        mockSection('s2', 10, 13, 'monday'), // 3 hours, block 1 total: 5 > 4
        mockSection('s3', 14, 16, 'monday'), // 2 hours, block 2
      ];

      const score = strategy.evaluate(combination, undefined);
      expect(score).toBeCloseTo(0.67, 2); // 1 violation
    });

    it('should handle exactly 4 hours as no violation', () => {
      const combination = [
        mockSection('s1', 8, 12, 'monday'), // exactly 4 hours
      ];

      const score = strategy.evaluate(combination, undefined);
      expect(score).toBe(1.0);
    });

    it('should handle edge case at 4.01 hours', () => {
      const combination = [
        mockSection('s1', 8, 10, 'monday'), // 2 hours
        mockSection('s2', 10, 12, 'monday'), // 2 hours
        mockSection('s3', 12, 13, 'monday'), // 1 hour, total 5 > 4
      ];

      const score = strategy.evaluate(combination, undefined);
      expect(score).toBeCloseTo(0.67, 2); // 1 violation
    });
  });

  describe('evaluate with custom max hours parameter', () => {
    it('should use custom max hours from parameter', () => {
      const combination = [
        mockSection('s1', 8, 10, 'monday'), // 2 hours
        mockSection('s2', 10, 12, 'monday'), // 2 hours, total 4
      ];

      const parameter = {
        type: ParameterType.NUMBER as const,
        value: 3,
      };

      const score = strategy.evaluate(combination, parameter);
      expect(score).toBeCloseTo(0.67, 2); // 4 > 3, violation
    });

    it('should respect higher max hours', () => {
      const combination = [
        mockSection('s1', 8, 14, 'monday'), // 6 hours
      ];

      const parameter = {
        type: ParameterType.NUMBER as const,
        value: 6,
      };

      const score = strategy.evaluate(combination, parameter);
      expect(score).toBe(1.0); // 6 = 6, no violation
    });

    it('should detect violation with custom low limit', () => {
      const combination = [
        mockSection('s1', 8, 10, 'monday'), // 2 hours
        mockSection('s2', 10, 11, 'monday'), // 1 hour, total 3
      ];

      const parameter = {
        type: ParameterType.NUMBER as const,
        value: 2,
      };

      const score = strategy.evaluate(combination, parameter);
      expect(score).toBeCloseTo(0.67, 2); // 3 > 2, violation
    });
  });

  describe('edge cases', () => {
    it('should handle empty combination', () => {
      const combination = [];

      const score = strategy.evaluate(combination, undefined);
      expect(score).toBe(1.0);
    });

    it('should handle single short section', () => {
      const combination = [mockSection('s1', 8, 9, 'monday')];

      const score = strategy.evaluate(combination, undefined);
      expect(score).toBe(1.0);
    });

    it('should handle sections on different days independently', () => {
      const combination = [
        mockSection('s1', 8, 13, 'monday'), // 5 hours > 4, violation
        mockSection('s2', 8, 10, 'tuesday'), // 2 hours, no violation
      ];

      const score = strategy.evaluate(combination, undefined);
      expect(score).toBeCloseTo(0.67, 2); // 1 violation only
    });
  });
});
