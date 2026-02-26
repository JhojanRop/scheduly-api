import { PreferAfternoonStrategy } from './prefer-afternoon.strategy';

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

describe('PreferAfternoonStrategy', () => {
  let strategy: PreferAfternoonStrategy;

  beforeEach(() => {
    strategy = new PreferAfternoonStrategy();
  });

  describe('evaluate', () => {
    it('should return 1.0 when all sections start in the afternoon', () => {
      const combination = [
        mockSection('s1', 14),
        mockSection('s2', 16),
        mockSection('s3', 18),
      ];

      const score = strategy.evaluate(combination);
      expect(score).toBe(1.0);
    });

    it('should return 0 when no sections start in the afternoon', () => {
      const combination = [
        mockSection('s1', 8),
        mockSection('s2', 10),
        mockSection('s3', 12),
      ];

      const score = strategy.evaluate(combination);
      expect(score).toBe(0);
    });

    it('should return 0.5 when half of sections start in the afternoon', () => {
      const combination = [mockSection('s1', 10), mockSection('s2', 15)];

      const score = strategy.evaluate(combination);
      expect(score).toBe(0.5);
    });

    it('should return 0.667 when 2 of 3 sections start in the afternoon', () => {
      const combination = [
        mockSection('s1', 8),
        mockSection('s2', 14),
        mockSection('s3', 17),
      ];

      const score = strategy.evaluate(combination);
      expect(score).toBeCloseTo(0.667, 2);
    });

    it('should count sections starting exactly at 14:00 as afternoon', () => {
      const combination = [mockSection('s1', 14)];

      const score = strategy.evaluate(combination);
      expect(score).toBe(1.0);
    });

    it('should not count sections starting at 22:00 as afternoon', () => {
      const combination = [mockSection('s1', 22)];

      const score = strategy.evaluate(combination);
      expect(score).toBe(0);
    });

    it('should not count sections starting before 14:00 as afternoon', () => {
      const combination = [mockSection('s1', 13, 59)];

      const score = strategy.evaluate(combination);
      expect(score).toBe(0);
    });

    it('should handle sections starting at edge of afternoon (21:59)', () => {
      const combination = [mockSection('s1', 21, 59)];

      const score = strategy.evaluate(combination);
      expect(score).toBe(1.0);
    });

    it('should handle sections starting at 22:01 as evening', () => {
      const combination = [mockSection('s1', 22, 1)];

      const score = strategy.evaluate(combination);
      expect(score).toBe(0);
    });

    it('should handle afternoon boundary at 14:01', () => {
      const combination = [mockSection('s1', 14, 1)];

      const score = strategy.evaluate(combination);
      expect(score).toBe(1.0);
    });

    it('should handle mixed afternoon times with minutes', () => {
      const combination = [
        mockSection('s1', 13, 30),
        mockSection('s2', 14, 30),
        mockSection('s3', 18, 45),
        mockSection('s4', 22, 30),
      ];

      const score = strategy.evaluate(combination);
      expect(score).toBe(0.5); // 2 of 4 are afternoon
    });

    it('should handle empty combination gracefully', () => {
      const combination = [];

      const score = strategy.evaluate(combination);
      expect(score).toBeNaN(); // division by 0
    });

    it('should handle single afternoon section', () => {
      const combination = [mockSection('s1', 16)];

      const score = strategy.evaluate(combination);
      expect(score).toBe(1.0);
    });

    it('should handle single morning section', () => {
      const combination = [mockSection('s1', 9)];

      const score = strategy.evaluate(combination);
      expect(score).toBe(0);
    });
  });
});
