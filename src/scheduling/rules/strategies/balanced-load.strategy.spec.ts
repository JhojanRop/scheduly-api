import { BalancedLoadStrategy } from './balanced-load.strategy';

const mockSection = (
  id: string,
  startHour: number,
  durationHours: number,
  dayIds: { id: number; name: string }[],
) => ({
  id,
  subjectId: 'subject1',
  professorId: null,
  startTime: new Date(
    `1970-01-01T${String(startHour).padStart(2, '0')}:00:00Z`,
  ),
  endTime: new Date(
    `1970-01-01T${String(startHour + durationHours).padStart(2, '0')}:00:00Z`,
  ),
  subject: { id: 'subject1', name: 'Subject 1', userId: 'user1' },
  professor: null,
  sectionDays: dayIds.map((day, index) => ({
    id: `sd-${id}-${index}`,
    sectionId: id,
    dayId: day.id,
    day,
  })),
});

describe('BalancedLoadStrategy', () => {
  let strategy: BalancedLoadStrategy;

  beforeEach(() => {
    strategy = new BalancedLoadStrategy();
  });

  describe('evaluate', () => {
    it('should return 1.0 for perfectly balanced schedule', () => {
      const combination = [
        mockSection('s1', 8, 2, [{ id: 1, name: 'monday' }]),
        mockSection('s2', 8, 2, [{ id: 2, name: 'tuesday' }]),
        mockSection('s3', 8, 2, [{ id: 3, name: 'wednesday' }]),
      ];

      const score = strategy.evaluate(combination);
      expect(score).toBe(1.0); // stdDev = 0
    });

    it('should penalize slightly unbalanced schedule', () => {
      const combination = [
        mockSection('s1', 8, 4, [{ id: 1, name: 'monday' }]), // 4 hours
        mockSection('s2', 8, 2, [{ id: 2, name: 'tuesday' }]), // 2 hours
      ];

      // avg = 3, variance = ((4-3)^2 + (2-3)^2) / 2 = 1, stdDev = 1
      const score = strategy.evaluate(combination);
      expect(score).toBeCloseTo(0.8, 2); // 1 - 1 * 0.2
    });

    it('should penalize heavily unbalanced schedule', () => {
      const combination = [
        mockSection('s1', 8, 6, [{ id: 1, name: 'monday' }]), // 6 hours
        mockSection('s2', 8, 2, [{ id: 2, name: 'tuesday' }]), // 2 hours
      ];

      // avg = 4, variance = ((6-4)^2 + (2-4)^2) / 2 = 4, stdDev = 2
      const score = strategy.evaluate(combination);
      expect(score).toBeCloseTo(0.6, 2); // 1 - 2 * 0.2
    });

    it('should return minimum 0 for extremely unbalanced schedule', () => {
      const combination = [
        mockSection('s1', 8, 10, [{ id: 1, name: 'monday' }]), // 10 hours
        mockSection('s2', 8, 1, [{ id: 2, name: 'tuesday' }]), // 1 hour
      ];

      // avg = 5.5, variance = ((10-5.5)^2 + (1-5.5)^2) / 2 = 20.25, stdDev = 4.5
      const score = strategy.evaluate(combination);
      expect(score).toBeCloseTo(0.1, 2); // Math.max(0, 1 - 4.5 * 0.2) = 0.1
    });

    it('should handle section spanning multiple days', () => {
      const combination = [
        mockSection('s1', 8, 2, [
          { id: 1, name: 'monday' },
          { id: 3, name: 'wednesday' },
        ]), // 2 hours on Mon and Wed
        mockSection('s2', 8, 2, [{ id: 2, name: 'tuesday' }]), // 2 hours on Tue
      ];

      // Mon: 2, Tue: 2, Wed: 2 -> perfectly balanced
      const score = strategy.evaluate(combination);
      expect(score).toBe(1.0);
    });

    it('should accumulate hours for multiple sections on same day', () => {
      const combination = [
        mockSection('s1', 8, 2, [{ id: 1, name: 'monday' }]), // 2 hours
        mockSection('s2', 10, 2, [{ id: 1, name: 'monday' }]), // 2 hours
        mockSection('s3', 8, 2, [{ id: 2, name: 'tuesday' }]), // 2 hours
      ];

      // Mon: 4, Tue: 2 -> avg = 3, variance = 1, stdDev = 1
      const score = strategy.evaluate(combination);
      expect(score).toBeCloseTo(0.8, 2); // 1 - 1 * 0.2
    });

    it('should handle single day schedule', () => {
      const combination = [
        mockSection('s1', 8, 4, [{ id: 1, name: 'monday' }]),
      ];

      // Only 1 day -> stdDev = 0 (no variance with single value)
      const score = strategy.evaluate(combination);
      expect(score).toBe(1.0);
    });

    it('should handle three-day unbalanced schedule', () => {
      const combination = [
        mockSection('s1', 8, 2, [{ id: 1, name: 'monday' }]), // 2 hours
        mockSection('s2', 8, 4, [{ id: 2, name: 'tuesday' }]), // 4 hours
        mockSection('s3', 8, 6, [{ id: 3, name: 'wednesday' }]), // 6 hours
      ];

      // avg = 4, variance = ((2-4)^2 + (4-4)^2 + (6-4)^2) / 3 = 8/3, stdDev = sqrt(8/3) ≈ 1.63
      const score = strategy.evaluate(combination);
      expect(score).toBeCloseTo(0.67, 1); // 1 - 1.63 * 0.2
    });

    it('should handle complex schedule with section spanning multiple days', () => {
      const combination = [
        mockSection('s1', 8, 3, [
          { id: 1, name: 'monday' },
          { id: 3, name: 'wednesday' },
        ]), // 3 hours on Mon and Wed
        mockSection('s2', 8, 2, [{ id: 2, name: 'tuesday' }]), // 2 hours on Tue
        mockSection('s3', 10, 1, [{ id: 1, name: 'monday' }]), // 1 hour on Mon
      ];

      // Mon: 4, Tue: 2, Wed: 3 -> avg = 3, variance = ((4-3)^2 + (2-3)^2 + (3-3)^2) / 3 = 2/3, stdDev ≈ 0.816
      const score = strategy.evaluate(combination);
      expect(score).toBeCloseTo(0.84, 1); // 1 - 0.816 * 0.2
    });

    it('should handle empty combination', () => {
      const combination = [];

      const score = strategy.evaluate(combination);
      expect(score).toBe(1.0); // No days with classes, size = 0
    });
  });
});
