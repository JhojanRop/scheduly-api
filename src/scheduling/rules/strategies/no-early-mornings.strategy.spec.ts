import { NoEarlyMorningsStrategy } from './no-early-mornings.strategy';

const mockSection = (
  id: string,
  startHour: number,
  startMinute: number = 0,
) => ({
  id,
  subjectId: 'subject1',
  professorId: null,
  startTime: new Date(
    `1970-01-01T${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}:00Z`,
  ),
  endTime: new Date(
    `1970-01-01T${String(startHour + 2).padStart(2, '0')}:00:00Z`,
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

describe('NoEarlyMorningsStrategy', () => {
  let strategy: NoEarlyMorningsStrategy;

  beforeEach(() => {
    strategy = new NoEarlyMorningsStrategy();
  });

  describe('evaluate', () => {
    it('should return 1.0 when no sections start before 8:00', () => {
      const combination = [
        mockSection('s1', 8),
        mockSection('s2', 10),
        mockSection('s3', 14),
      ];

      const score = strategy.evaluate(combination);
      expect(score).toBe(1.0);
    });

    it('should penalize one early morning section', () => {
      const combination = [mockSection('s1', 7), mockSection('s2', 10)];

      const score = strategy.evaluate(combination);
      expect(score).toBeCloseTo(0.67, 2); // 1 - 1 * 0.33
    });

    it('should penalize two early morning sections', () => {
      const combination = [
        mockSection('s1', 6),
        mockSection('s2', 7),
        mockSection('s3', 10),
      ];

      const score = strategy.evaluate(combination);
      expect(score).toBeCloseTo(0.34, 2); // 1 - 2 * 0.33
    });

    it('should return minimum 0 for many early morning sections', () => {
      const combination = [
        mockSection('s1', 6),
        mockSection('s2', 7),
        mockSection('s3', 7, 30),
        mockSection('s4', 7, 45),
      ];

      const score = strategy.evaluate(combination);
      expect(score).toBe(0); // Math.max(0, 1 - 4 * 0.33)
    });

    it('should not penalize section starting exactly at 8:00', () => {
      const combination = [mockSection('s1', 8)];

      const score = strategy.evaluate(combination);
      expect(score).toBe(1.0);
    });

    it('should penalize section starting at 7:59', () => {
      const combination = [mockSection('s1', 7, 59)];

      const score = strategy.evaluate(combination);
      expect(score).toBeCloseTo(0.67, 2);
    });

    it('should not penalize section starting at 8:01', () => {
      const combination = [mockSection('s1', 8, 1)];

      const score = strategy.evaluate(combination);
      expect(score).toBe(1.0);
    });

    it('should handle very early section at 6:00', () => {
      const combination = [mockSection('s1', 6)];

      const score = strategy.evaluate(combination);
      expect(score).toBeCloseTo(0.67, 2);
    });

    it('should handle section at 5:30', () => {
      const combination = [mockSection('s1', 5, 30)];

      const score = strategy.evaluate(combination);
      expect(score).toBeCloseTo(0.67, 2);
    });

    it('should handle mixed early and regular sections', () => {
      const combination = [
        mockSection('s1', 7),
        mockSection('s2', 8),
        mockSection('s3', 10),
        mockSection('s4', 14),
      ];

      const score = strategy.evaluate(combination);
      expect(score).toBeCloseTo(0.67, 2); // Only 1 early
    });

    it('should handle empty combination', () => {
      const combination = [];

      const score = strategy.evaluate(combination);
      expect(score).toBe(1.0);
    });

    it('should handle single late section', () => {
      const combination = [mockSection('s1', 14)];

      const score = strategy.evaluate(combination);
      expect(score).toBe(1.0);
    });
  });
});
