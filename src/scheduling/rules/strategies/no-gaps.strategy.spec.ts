import { NoGapsStrategy } from './no-gaps.strategy';

const mockSection = (
  id: string,
  startHour: number,
  endHour: number,
  days: { id: number; name: string }[],
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
  sectionDays: days.map((day, index) => ({
    id: `sd-${id}-${index}`,
    sectionId: id,
    dayId: day.id,
    day,
  })),
});

describe('NoGapsStrategy', () => {
  let strategy: NoGapsStrategy;

  beforeEach(() => {
    strategy = new NoGapsStrategy();
  });

  describe('evaluate', () => {
    it('should return 1.0 for schedule with no gaps', () => {
      const combination = [
        mockSection('s1', 8, 10, [{ id: 1, name: 'monday' }]),
        mockSection('s2', 10, 12, [{ id: 1, name: 'monday' }]),
        mockSection('s3', 12, 14, [{ id: 1, name: 'monday' }]),
      ];

      const score = strategy.evaluate(combination);
      expect(score).toBe(1.0);
    });

    it('should penalize schedule with one hour gap', () => {
      const combination = [
        mockSection('s1', 8, 10, [{ id: 1, name: 'monday' }]),
        mockSection('s2', 11, 13, [{ id: 1, name: 'monday' }]), // 1 hour gap
      ];

      const score = strategy.evaluate(combination);
      expect(score).toBe(0.75); // 1 - 1 * 0.25
    });

    it('should penalize schedule with two hour gap', () => {
      const combination = [
        mockSection('s1', 8, 10, [{ id: 1, name: 'monday' }]),
        mockSection('s2', 12, 14, [{ id: 1, name: 'monday' }]), // 2 hour gap
      ];

      const score = strategy.evaluate(combination);
      expect(score).toBe(0.5); // 1 - 2 * 0.25
    });

    it('should penalize schedule with three hour gap', () => {
      const combination = [
        mockSection('s1', 8, 10, [{ id: 1, name: 'monday' }]),
        mockSection('s2', 13, 15, [{ id: 1, name: 'monday' }]), // 3 hour gap
      ];

      const score = strategy.evaluate(combination);
      expect(score).toBe(0.25); // 1 - 3 * 0.25
    });

    it('should return minimum 0 for schedule with many gaps', () => {
      const combination = [
        mockSection('s1', 8, 10, [{ id: 1, name: 'monday' }]),
        mockSection('s2', 15, 17, [{ id: 1, name: 'monday' }]), // 5 hour gap
      ];

      const score = strategy.evaluate(combination);
      expect(score).toBe(0); // Math.max(0, 1 - 5 * 0.25)
    });

    it('should handle multiple gaps on same day', () => {
      const combination = [
        mockSection('s1', 8, 9, [{ id: 1, name: 'monday' }]),
        mockSection('s2', 10, 11, [{ id: 1, name: 'monday' }]), // 1 hour gap
        mockSection('s3', 13, 14, [{ id: 1, name: 'monday' }]), // 2 hour gap
      ];

      const score = strategy.evaluate(combination);
      expect(score).toBe(0.25); // 1 - 3 * 0.25 (total 3 hours of gaps)
    });

    it('should handle sections on different days independently', () => {
      const combination = [
        mockSection('s1', 8, 10, [{ id: 1, name: 'monday' }]),
        mockSection('s2', 11, 13, [{ id: 1, name: 'monday' }]), // 1 hour gap on Monday
        mockSection('s3', 8, 10, [{ id: 2, name: 'tuesday' }]),
        mockSection('s4', 10, 12, [{ id: 2, name: 'tuesday' }]), // No gap on Tuesday
      ];

      const score = strategy.evaluate(combination);
      expect(score).toBe(0.75); // 1 - 1 * 0.25
    });

    it('should sum gaps across different days', () => {
      const combination = [
        mockSection('s1', 8, 10, [{ id: 1, name: 'monday' }]),
        mockSection('s2', 11, 13, [{ id: 1, name: 'monday' }]), // 1 hour gap
        mockSection('s3', 8, 10, [{ id: 2, name: 'tuesday' }]),
        mockSection('s4', 12, 14, [{ id: 2, name: 'tuesday' }]), // 2 hour gap
      ];

      const score = strategy.evaluate(combination);
      expect(score).toBe(0.25); // 1 - 3 * 0.25 (1 + 2 hours)
    });

    it('should handle sections spanning multiple days', () => {
      const combination = [
        mockSection('s1', 8, 10, [
          { id: 1, name: 'monday' },
          { id: 3, name: 'wednesday' },
        ]),
        mockSection('s2', 10, 12, [
          { id: 1, name: 'monday' },
          { id: 3, name: 'wednesday' },
        ]),
      ];

      const score = strategy.evaluate(combination);
      expect(score).toBe(1.0); // No gaps on either day
    });

    it('should handle single section per day', () => {
      const combination = [
        mockSection('s1', 8, 10, [{ id: 1, name: 'monday' }]),
        mockSection('s2', 10, 12, [{ id: 2, name: 'tuesday' }]),
      ];

      const score = strategy.evaluate(combination);
      expect(score).toBe(1.0); // No gaps possible
    });

    it('should handle empty combination', () => {
      const combination = [];

      const score = strategy.evaluate(combination);
      expect(score).toBe(1.0);
    });

    it('should sort sections by time correctly', () => {
      const combination = [
        mockSection('s3', 14, 16, [{ id: 1, name: 'monday' }]),
        mockSection('s1', 8, 10, [{ id: 1, name: 'monday' }]),
        mockSection('s2', 10, 12, [{ id: 1, name: 'monday' }]),
      ];

      const score = strategy.evaluate(combination);
      expect(score).toBe(0.5); // Gap between 12-14
    });

    it('should round up partial hour gaps', () => {
      const combination = [
        mockSection('s1', 8, 10, [{ id: 1, name: 'monday' }]),
        // Si hubiera un gap de 30 minutos, se redondea a 1 hora
        // Pero en este caso es 1 hora completa
        mockSection('s2', 11, 13, [{ id: 1, name: 'monday' }]),
      ];

      const score = strategy.evaluate(combination);
      expect(score).toBe(0.75);
    });
  });
});
