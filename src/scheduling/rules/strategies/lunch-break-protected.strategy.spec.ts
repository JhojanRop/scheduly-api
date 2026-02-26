import { ParameterType } from 'src/types/rule-parameter.types';
import { LunchBreakProtectedStrategy } from './lunch-break-protected.strategy';

const mockSection = (
  id: string,
  startHour: number,
  startMinute: number,
  endHour: number,
  endMinute: number,
) => ({
  id,
  subjectId: 'subject1',
  professorId: null,
  startTime: new Date(
    `1970-01-01T${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}:00Z`,
  ),
  endTime: new Date(
    `1970-01-01T${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}:00Z`,
  ),
  subject: { id: 'subject1', name: 'Subject 1', userId: 'user1' },
  professor: null,
  sectionDays: [
    {
      id: `sd-${id}-1`,
      sectionId: id,
      dayId: 1,
      day: { id: 1, name: 'monday' },
    },
  ],
});

describe('LunchBreakProtectedStrategy', () => {
  let strategy: LunchBreakProtectedStrategy;

  beforeEach(() => {
    strategy = new LunchBreakProtectedStrategy();
  });

  describe('evaluate with default lunch time (12:00-14:00)', () => {
    it('should return 1.0 when no sections overlap lunch', () => {
      const combination = [
        mockSection('s1', 8, 0, 10, 0),
        mockSection('s2', 10, 0, 12, 0), // Ends at lunch start, no overlap
        mockSection('s3', 14, 0, 16, 0), // Starts at lunch end, no overlap
      ];

      const score = strategy.evaluate(combination, undefined);
      expect(score).toBe(1.0);
    });

    it('should penalize one lunch overlap', () => {
      const combination = [
        mockSection('s1', 8, 0, 10, 0),
        mockSection('s2', 12, 0, 14, 0), // Fully during lunch
      ];

      const score = strategy.evaluate(combination, undefined);
      expect(score).toBeCloseTo(0.5, 2); // 1 - 1 * 0.5
    });

    it('should penalize two lunch overlaps', () => {
      const combination = [
        mockSection('s1', 11, 0, 13, 0), // Overlaps lunch
        mockSection('s2', 13, 0, 15, 0), // Overlaps lunch
      ];

      const score = strategy.evaluate(combination, undefined);
      expect(score).toBe(0); // 1 - 2 * 0.5
    });

    it('should return 0 for many lunch overlaps', () => {
      const combination = [
        mockSection('s1', 12, 0, 13, 0),
        mockSection('s2', 12, 30, 13, 30),
        mockSection('s3', 13, 0, 14, 0),
      ];

      const score = strategy.evaluate(combination, undefined);
      expect(score).toBe(0); // Math.max(0, 1 - 3 * 0.5)
    });

    it('should detect partial overlap at lunch start', () => {
      const combination = [mockSection('s1', 11, 0, 13, 0)]; // 11:00-13:00

      const score = strategy.evaluate(combination, undefined);
      expect(score).toBeCloseTo(0.5, 2);
    });

    it('should detect partial overlap at lunch end', () => {
      const combination = [mockSection('s1', 13, 0, 15, 0)]; // 13:00-15:00

      const score = strategy.evaluate(combination, undefined);
      expect(score).toBeCloseTo(0.5, 2);
    });

    it('should detect section completely covering lunch', () => {
      const combination = [mockSection('s1', 11, 0, 15, 0)]; // 11:00-15:00

      const score = strategy.evaluate(combination, undefined);
      expect(score).toBeCloseTo(0.5, 2);
    });

    it('should not penalize section ending exactly at 12:00', () => {
      const combination = [mockSection('s1', 10, 0, 12, 0)];

      const score = strategy.evaluate(combination, undefined);
      expect(score).toBe(1.0);
    });

    it('should not penalize section starting exactly at 14:00', () => {
      const combination = [mockSection('s1', 14, 0, 16, 0)];

      const score = strategy.evaluate(combination, undefined);
      expect(score).toBe(1.0);
    });

    it('should penalize section starting at 13:59', () => {
      const combination = [mockSection('s1', 13, 59, 16, 0)];

      const score = strategy.evaluate(combination, undefined);
      expect(score).toBeCloseTo(0.5, 2);
    });

    it('should penalize section ending at 12:01', () => {
      const combination = [mockSection('s1', 10, 0, 12, 1)];

      const score = strategy.evaluate(combination, undefined);
      expect(score).toBeCloseTo(0.5, 2);
    });
  });

  describe('evaluate with custom lunch time parameter', () => {
    it('should use custom lunch time from parameter', () => {
      const combination = [
        mockSection('s1', 13, 0, 14, 0), // Would overlap default lunch
      ];

      const parameter = {
        type: ParameterType.TIME_RANGE as const,
        value: { start: '14:00', end: '15:00' },
      };

      const score = strategy.evaluate(combination, parameter);
      expect(score).toBe(1.0); // No overlap with 14:00-15:00
    });

    it('should detect overlap with custom lunch time', () => {
      const combination = [
        mockSection('s1', 13, 0, 15, 0), // Overlaps 13:30-14:30
      ];

      const parameter = {
        type: ParameterType.TIME_RANGE as const,
        value: { start: '13:30', end: '14:30' },
      };

      const score = strategy.evaluate(combination, parameter);
      expect(score).toBeCloseTo(0.5, 2);
    });

    it('should handle custom lunch with minutes', () => {
      const combination = [
        mockSection('s1', 11, 45, 12, 45), // Overlaps 12:00-13:00
      ];

      const parameter = {
        type: ParameterType.TIME_RANGE as const,
        value: { start: '12:00', end: '13:00' },
      };

      const score = strategy.evaluate(combination, parameter);
      expect(score).toBeCloseTo(0.5, 2);
    });

    it('should handle early lunch time', () => {
      const combination = [
        mockSection('s1', 10, 30, 11, 30), // Overlaps 11:00-12:00
      ];

      const parameter = {
        type: ParameterType.TIME_RANGE as const,
        value: { start: '11:00', end: '12:00' },
      };

      const score = strategy.evaluate(combination, parameter);
      expect(score).toBeCloseTo(0.5, 2);
    });

    it('should handle late lunch time', () => {
      const combination = [
        mockSection('s1', 13, 0, 14, 0), // Does not overlap 14:00-15:00
      ];

      const parameter = {
        type: ParameterType.TIME_RANGE as const,
        value: { start: '14:00', end: '15:00' },
      };

      const score = strategy.evaluate(combination, parameter);
      expect(score).toBe(1.0);
    });
  });

  describe('edge cases', () => {
    it('should handle empty combination', () => {
      const combination = [];

      const score = strategy.evaluate(combination, undefined);
      expect(score).toBe(1.0);
    });

    it('should handle section exactly during lunch', () => {
      const combination = [mockSection('s1', 12, 0, 14, 0)];

      const score = strategy.evaluate(combination, undefined);
      expect(score).toBeCloseTo(0.5, 2);
    });

    it('should handle minute precision overlap', () => {
      const combination = [mockSection('s1', 12, 30, 13, 30)];

      const score = strategy.evaluate(combination, undefined);
      expect(score).toBeCloseTo(0.5, 2);
    });

    it('should handle multiple non-overlapping sections', () => {
      const combination = [
        mockSection('s1', 8, 0, 10, 0),
        mockSection('s2', 10, 0, 12, 0),
        mockSection('s3', 14, 0, 16, 0),
        mockSection('s4', 16, 0, 18, 0),
      ];

      const score = strategy.evaluate(combination, undefined);
      expect(score).toBe(1.0);
    });
  });

  describe('evaluate without proper parameter', () => {
    it('should use default when parameter is undefined', () => {
      const combination = [mockSection('s1', 12, 0, 14, 0)];

      const score = strategy.evaluate(combination, undefined);
      expect(score).toBeCloseTo(0.5, 2); // Uses default 12:00-14:00
    });

    it('should use default when parameter type is wrong', () => {
      const combination = [mockSection('s1', 12, 0, 14, 0)];

      const parameter = {
        type: ParameterType.NUMBER as const,
        value: 123,
      };

      const score = strategy.evaluate(combination, parameter as any);
      expect(score).toBeCloseTo(0.5, 2); // Uses default 12:00-14:00
    });
  });
});
