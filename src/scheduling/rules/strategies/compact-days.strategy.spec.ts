import { CompactDaysStrategy } from './compact-days.strategy';

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

describe('CompactDaysStrategy', () => {
  let strategy: CompactDaysStrategy;

  beforeEach(() => {
    strategy = new CompactDaysStrategy();
  });

  describe('evaluate', () => {
    it('should return 1.0 for schedule using only 1 day', () => {
      const combination = [
        mockSection('s1', [{ id: 1, name: 'monday' }]),
        mockSection('s2', [{ id: 1, name: 'monday' }]),
        mockSection('s3', [{ id: 1, name: 'monday' }]),
      ];

      const score = strategy.evaluate(combination);
      expect(score).toBe(1.0); // 1 - (1 - 1) * 0.17
    });

    it('should penalize schedule using 2 days', () => {
      const combination = [
        mockSection('s1', [{ id: 1, name: 'monday' }]),
        mockSection('s2', [{ id: 2, name: 'tuesday' }]),
      ];

      const score = strategy.evaluate(combination);
      expect(score).toBeCloseTo(0.83, 2); // 1 - (2 - 1) * 0.17
    });

    it('should penalize schedule using 3 days', () => {
      const combination = [
        mockSection('s1', [{ id: 1, name: 'monday' }]),
        mockSection('s2', [{ id: 2, name: 'tuesday' }]),
        mockSection('s3', [{ id: 3, name: 'wednesday' }]),
      ];

      const score = strategy.evaluate(combination);
      expect(score).toBeCloseTo(0.66, 2); // 1 - (3 - 1) * 0.17
    });

    it('should penalize schedule using 4 days', () => {
      const combination = [
        mockSection('s1', [{ id: 1, name: 'monday' }]),
        mockSection('s2', [{ id: 2, name: 'tuesday' }]),
        mockSection('s3', [{ id: 3, name: 'wednesday' }]),
        mockSection('s4', [{ id: 4, name: 'thursday' }]),
      ];

      const score = strategy.evaluate(combination);
      expect(score).toBeCloseTo(0.49, 2); // 1 - (4 - 1) * 0.17
    });

    it('should penalize schedule using 5 days', () => {
      const combination = [
        mockSection('s1', [{ id: 1, name: 'monday' }]),
        mockSection('s2', [{ id: 2, name: 'tuesday' }]),
        mockSection('s3', [{ id: 3, name: 'wednesday' }]),
        mockSection('s4', [{ id: 4, name: 'thursday' }]),
        mockSection('s5', [{ id: 5, name: 'friday' }]),
      ];

      const score = strategy.evaluate(combination);
      expect(score).toBeCloseTo(0.32, 2); // 1 - (5 - 1) * 0.17
    });

    it('should handle sections spanning multiple days', () => {
      const combination = [
        mockSection('s1', [
          { id: 1, name: 'monday' },
          { id: 3, name: 'wednesday' },
        ]),
      ];

      const score = strategy.evaluate(combination);
      expect(score).toBeCloseTo(0.83, 2); // 2 unique days
    });

    it('should count unique days only once', () => {
      const combination = [
        mockSection('s1', [{ id: 1, name: 'monday' }]),
        mockSection('s2', [{ id: 1, name: 'monday' }]),
        mockSection('s3', [{ id: 2, name: 'tuesday' }]),
        mockSection('s4', [{ id: 2, name: 'tuesday' }]),
      ];

      const score = strategy.evaluate(combination);
      expect(score).toBeCloseTo(0.83, 2); // 2 unique days
    });

    it('should handle section occurring on multiple days multiple times', () => {
      const combination = [
        mockSection('s1', [
          { id: 1, name: 'monday' },
          { id: 3, name: 'wednesday' },
          { id: 5, name: 'friday' },
        ]),
        mockSection('s2', [{ id: 2, name: 'tuesday' }]),
      ];

      const score = strategy.evaluate(combination);
      expect(score).toBeCloseTo(0.49, 2); // 4 unique days
    });

    it('should return minimum 0 for schedule using many days', () => {
      const combination = [
        mockSection('s1', [{ id: 1, name: 'monday' }]),
        mockSection('s2', [{ id: 2, name: 'tuesday' }]),
        mockSection('s3', [{ id: 3, name: 'wednesday' }]),
        mockSection('s4', [{ id: 4, name: 'thursday' }]),
        mockSection('s5', [{ id: 5, name: 'friday' }]),
        mockSection('s6', [{ id: 6, name: 'saturday' }]),
        mockSection('s7', [{ id: 7, name: 'sunday' }]),
      ];

      const score = strategy.evaluate(combination);
      expect(score).toBe(0); // Math.max(0, 1 - 6 * 0.17)
    });

    it('should handle empty combination', () => {
      const combination = [];

      const score = strategy.evaluate(combination);
      expect(score).toBeCloseTo(1.17, 2); // 0 days: 1 - (0 - 1) * 0.17 = 1.17
    });
  });
});
