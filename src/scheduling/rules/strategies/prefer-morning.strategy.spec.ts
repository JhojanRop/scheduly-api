import { PreferMorningStrategy } from './prefer-morning.strategy';

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

describe('PreferMorningStrategy', () => {
  let strategy: PreferMorningStrategy;

  beforeEach(() => {
    strategy = new PreferMorningStrategy();
  });

  describe('evaluate', () => {
    it('should return 1.0 when all sections start in the morning', () => {
      const combination = [
        mockSection('s1', 7),
        mockSection('s2', 9),
        mockSection('s3', 11),
      ];

      const score = strategy.evaluate(combination);
      expect(score).toBe(1.0);
    });

    it('should return 0 when no sections start in the morning', () => {
      const combination = [
        mockSection('s1', 14),
        mockSection('s2', 16),
        mockSection('s3', 18),
      ];

      const score = strategy.evaluate(combination);
      expect(score).toBe(0);
    });

    it('should return 0.5 when half of sections start in the morning', () => {
      const combination = [mockSection('s1', 8), mockSection('s2', 15)];

      const score = strategy.evaluate(combination);
      expect(score).toBe(0.5);
    });

    it('should return 0.667 when 2 of 3 sections start in the morning', () => {
      const combination = [
        mockSection('s1', 7),
        mockSection('s2', 10),
        mockSection('s3', 16),
      ];

      const score = strategy.evaluate(combination);
      expect(score).toBeCloseTo(0.667, 2);
    });

    it('should count sections starting exactly at 6:00 as morning', () => {
      const combination = [mockSection('s1', 6)];

      const score = strategy.evaluate(combination);
      expect(score).toBe(1.0);
    });

    it('should not count sections starting at 14:00 as morning', () => {
      const combination = [mockSection('s1', 14)];

      const score = strategy.evaluate(combination);
      expect(score).toBe(0);
    });

    it('should not count sections starting before 6:00 as morning', () => {
      const combination = [mockSection('s1', 5)];

      const score = strategy.evaluate(combination);
      expect(score).toBe(0);
    });

    it('should handle sections starting at edge of morning (13:59)', () => {
      const combination = [mockSection('s1', 13, 59)];

      const score = strategy.evaluate(combination);
      expect(score).toBe(1.0);
    });

    it('should handle sections starting at 14:01 as afternoon', () => {
      const combination = [mockSection('s1', 14, 1)];

      const score = strategy.evaluate(combination);
      expect(score).toBe(0);
    });

    it('should handle morning boundary at 6:01', () => {
      const combination = [mockSection('s1', 6, 1)];

      const score = strategy.evaluate(combination);
      expect(score).toBe(1.0);
    });

    it('should handle mixed morning times with minutes', () => {
      const combination = [
        mockSection('s1', 6, 30),
        mockSection('s2', 9, 45),
        mockSection('s3', 13, 30),
        mockSection('s4', 14, 30),
      ];

      const score = strategy.evaluate(combination);
      expect(score).toBe(0.75); // 3 of 4 are morning
    });

    it('should handle empty combination gracefully', () => {
      const combination = [];

      const score = strategy.evaluate(combination);
      expect(score).toBeNaN(); // division by 0
    });

    it('should handle single morning section', () => {
      const combination = [mockSection('s1', 10)];

      const score = strategy.evaluate(combination);
      expect(score).toBe(1.0);
    });

    it('should handle single afternoon section', () => {
      const combination = [mockSection('s1', 15)];

      const score = strategy.evaluate(combination);
      expect(score).toBe(0);
    });
  });
});
