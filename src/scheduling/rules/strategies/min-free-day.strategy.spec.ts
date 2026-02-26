import { ParameterType } from 'src/types/rule-parameter.types';
import { MinFreeDayStrategy } from './min-free-day.strategy';

const mockSection = (id: string, dayIds: { id: number; name: string }[]) => ({
  id,
  subjectId: 'subject1',
  professorId: null,
  startTime: new Date('1970-01-01T08:00:00Z'),
  endTime: new Date('1970-01-01T10:00:00Z'),
  subject: { id: 'subject1', name: 'Subject 1', userId: 'user1' },
  professor: null,
  sectionDays: dayIds.map((day, index) => ({
    id: `sd-${id}-${index}`,
    sectionId: id,
    dayId: day.id,
    day,
  })),
});

describe('MinFreeDayStrategy', () => {
  let strategy: MinFreeDayStrategy;

  beforeEach(() => {
    strategy = new MinFreeDayStrategy();
  });

  describe('evaluate without parameter', () => {
    it('should return 0 when no free days (all 7 days used)', () => {
      const combination = [
        mockSection('s1', [
          { id: 1, name: 'monday' },
          { id: 2, name: 'tuesday' },
          { id: 3, name: 'wednesday' },
          { id: 4, name: 'thursday' },
          { id: 5, name: 'friday' },
          { id: 6, name: 'saturday' },
          { id: 7, name: 'sunday' },
        ]),
      ];

      const score = strategy.evaluate(combination, undefined);
      expect(score).toBe(0);
    });

    it('should return 0.33 for 1 free day', () => {
      const combination = [
        mockSection('s1', [
          { id: 1, name: 'monday' },
          { id: 2, name: 'tuesday' },
          { id: 3, name: 'wednesday' },
          { id: 4, name: 'thursday' },
          { id: 5, name: 'friday' },
          { id: 6, name: 'saturday' },
        ]),
      ];

      const score = strategy.evaluate(combination, undefined);
      expect(score).toBeCloseTo(0.33, 2); // 1 * 0.33
    });

    it('should return 0.66 for 2 free days', () => {
      const combination = [
        mockSection('s1', [
          { id: 1, name: 'monday' },
          { id: 2, name: 'tuesday' },
          { id: 3, name: 'wednesday' },
          { id: 4, name: 'thursday' },
          { id: 5, name: 'friday' },
        ]),
      ];

      const score = strategy.evaluate(combination, undefined);
      expect(score).toBeCloseTo(0.66, 2); // 2 * 0.33
    });

    it('should return 0.99 for 3 free days', () => {
      const combination = [
        mockSection('s1', [
          { id: 1, name: 'monday' },
          { id: 2, name: 'tuesday' },
          { id: 3, name: 'wednesday' },
          { id: 4, name: 'thursday' },
        ]),
      ];

      const score = strategy.evaluate(combination, undefined);
      expect(score).toBeCloseTo(0.99, 2); // 3 * 0.33
    });

    it('should cap at 1.0 for 4 or more free days', () => {
      const combination = [
        mockSection('s1', [
          { id: 1, name: 'monday' },
          { id: 2, name: 'tuesday' },
          { id: 3, name: 'wednesday' },
        ]),
      ];

      const score = strategy.evaluate(combination, undefined);
      expect(score).toBe(1.0); // Math.min(1, 4 * 0.33)
    });

    it('should handle single day schedule', () => {
      const combination = [mockSection('s1', [{ id: 1, name: 'monday' }])];

      const score = strategy.evaluate(combination, undefined);
      expect(score).toBe(1.0); // 6 free days
    });

    it('should handle multiple sections on same days', () => {
      const combination = [
        mockSection('s1', [{ id: 1, name: 'monday' }]),
        mockSection('s2', [{ id: 1, name: 'monday' }]),
        mockSection('s3', [{ id: 2, name: 'tuesday' }]),
      ];

      const score = strategy.evaluate(combination, undefined);
      expect(score).toBe(1.0); // 5 free days
    });
  });

  describe('evaluate with DAY_SELECT parameter', () => {
    it('should return 1.0 when preferred day is free', () => {
      const combination = [
        mockSection('s1', [
          { id: 1, name: 'monday' },
          { id: 2, name: 'tuesday' },
        ]),
      ];

      const parameter = {
        type: ParameterType.DAY_SELECT as const,
        value: 5, // Friday is free
      };

      const score = strategy.evaluate(combination, parameter);
      expect(score).toBe(1.0);
    });

    it('should return lower score when preferred day is not free', () => {
      const combination = [
        mockSection('s1', [
          { id: 1, name: 'monday' },
          { id: 2, name: 'tuesday' },
        ]),
      ];

      const parameter = {
        type: ParameterType.DAY_SELECT as const,
        value: 1, // Monday is not free
      };

      const score = strategy.evaluate(combination, parameter);
      expect(score).toBe(0.7); // Math.min(0.7, 5 * 0.2) = 0.7
    });

    it('should cap at 0.7 when preferred day is used but many free days exist', () => {
      const combination = [mockSection('s1', [{ id: 1, name: 'monday' }])];

      const parameter = {
        type: ParameterType.DAY_SELECT as const,
        value: 1, // Monday is not free
      };

      const score = strategy.evaluate(combination, parameter);
      expect(score).toBe(0.7); // Math.min(0.7, 6 * 0.2)
    });

    it('should return 0.2 when preferred day is used and 1 free day', () => {
      const combination = [
        mockSection('s1', [
          { id: 1, name: 'monday' },
          { id: 2, name: 'tuesday' },
          { id: 3, name: 'wednesday' },
          { id: 4, name: 'thursday' },
          { id: 5, name: 'friday' },
          { id: 6, name: 'saturday' },
        ]),
      ];

      const parameter = {
        type: ParameterType.DAY_SELECT as const,
        value: 1, // Monday is not free
      };

      const score = strategy.evaluate(combination, parameter);
      expect(score).toBeCloseTo(0.2, 2); // 1 * 0.2
    });

    it('should handle preferred day free with no free days scenario', () => {
      const combination = [
        mockSection('s1', [
          { id: 2, name: 'tuesday' },
          { id: 3, name: 'wednesday' },
          { id: 4, name: 'thursday' },
          { id: 5, name: 'friday' },
          { id: 6, name: 'saturday' },
          { id: 7, name: 'sunday' },
          { id: 1, name: 'monday' },
        ]),
      ];

      const parameter = {
        type: ParameterType.DAY_SELECT as const,
        value: 1, // Monday is not free
      };

      const score = strategy.evaluate(combination, parameter);
      expect(score).toBe(0); // 0 free days
    });
  });

  describe('evaluate with empty combination', () => {
    it('should handle empty combination without parameter', () => {
      const combination = [];

      const score = strategy.evaluate(combination, undefined);
      expect(score).toBe(1.0); // All 7 days are free
    });

    it('should handle empty combination with parameter', () => {
      const combination = [];

      const parameter = {
        type: ParameterType.DAY_SELECT as const,
        value: 1,
      };

      const score = strategy.evaluate(combination, parameter);
      expect(score).toBe(1.0); // Preferred day is free
    });
  });
});
