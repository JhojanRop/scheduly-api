import { NoLateEveningsStrategy } from './no-late-evenings.strategy';

const mockSection = (
  id: string,
  startHour: number,
  endHour: number,
  endMinute: number = 0,
) => ({
  id,
  subjectId: 'subject1',
  professorId: null,
  startTime: new Date(
    `1970-01-01T${String(startHour).padStart(2, '0')}:00:00Z`,
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

describe('NoLateEveningsStrategy', () => {
  let strategy: NoLateEveningsStrategy;

  beforeEach(() => {
    strategy = new NoLateEveningsStrategy();
  });

  describe('evaluate', () => {
    it('should return 1.0 when no sections end after 18:00', () => {
      const combination = [
        mockSection('s1', 8, 10),
        mockSection('s2', 12, 14),
        mockSection('s3', 16, 18),
      ];

      const score = strategy.evaluate(combination);
      expect(score).toBe(1.0);
    });

    it('should penalize one late evening section', () => {
      const combination = [mockSection('s1', 8, 10), mockSection('s2', 18, 20)];

      const score = strategy.evaluate(combination);
      expect(score).toBeCloseTo(0.67, 2); // 1 - 1 * 0.33
    });

    it('should penalize two late evening sections', () => {
      const combination = [
        mockSection('s1', 16, 19),
        mockSection('s2', 18, 20),
        mockSection('s3', 8, 10),
      ];

      const score = strategy.evaluate(combination);
      expect(score).toBeCloseTo(0.34, 2); // 1 - 2 * 0.33
    });

    it('should return minimum 0 for many late evening sections', () => {
      const combination = [
        mockSection('s1', 18, 20),
        mockSection('s2', 19, 21),
        mockSection('s3', 19, 21, 30),
        mockSection('s4', 20, 22),
      ];

      const score = strategy.evaluate(combination);
      expect(score).toBe(0); // Math.max(0, 1 - 4 * 0.33)
    });

    it('should not penalize section ending exactly at 18:00', () => {
      const combination = [mockSection('s1', 16, 18)];

      const score = strategy.evaluate(combination);
      expect(score).toBe(1.0);
    });

    it('should penalize section ending at 18:01', () => {
      const combination = [mockSection('s1', 16, 18, 1)];

      const score = strategy.evaluate(combination);
      expect(score).toBeCloseTo(0.67, 2);
    });

    it('should not penalize section ending at 17:59', () => {
      const combination = [mockSection('s1', 16, 17, 59)];

      const score = strategy.evaluate(combination);
      expect(score).toBe(1.0);
    });

    it('should handle very late section ending at 22:00', () => {
      const combination = [mockSection('s1', 20, 22)];

      const score = strategy.evaluate(combination);
      expect(score).toBeCloseTo(0.67, 2);
    });

    it('should handle section ending at 19:30', () => {
      const combination = [mockSection('s1', 17, 19, 30)];

      const score = strategy.evaluate(combination);
      expect(score).toBeCloseTo(0.67, 2);
    });

    it('should handle mixed late and regular sections', () => {
      const combination = [
        mockSection('s1', 8, 10),
        mockSection('s2', 12, 14),
        mockSection('s3', 16, 19),
        mockSection('s4', 10, 12),
      ];

      const score = strategy.evaluate(combination);
      expect(score).toBeCloseTo(0.67, 2); // Only 1 late
    });

    it('should handle empty combination', () => {
      const combination = [];

      const score = strategy.evaluate(combination);
      expect(score).toBe(1.0);
    });

    it('should handle single early section', () => {
      const combination = [mockSection('s1', 10, 12)];

      const score = strategy.evaluate(combination);
      expect(score).toBe(1.0);
    });
  });
});
