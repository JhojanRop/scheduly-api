import { ParameterType } from 'src/types/rule-parameter.types';
import { AvoidProfessorStrategy } from './avoid-professor.strategy';

const mockSection = (id: string, professorId: string | null) => ({
  id,
  subjectId: 'subject1',
  professorId,
  startTime: new Date('1970-01-01T08:00:00Z'),
  endTime: new Date('1970-01-01T10:00:00Z'),
  subject: { id: 'subject1', name: 'Subject 1', userId: 'user1' },
  professor: professorId
    ? { id: professorId, fullName: 'Professor', userId: 'user1' }
    : null,
  sectionDays: [
    {
      id: `sd-${id}-1`,
      sectionId: id,
      dayId: 1,
      day: { id: 1, name: 'monday' },
    },
  ],
});

describe('AvoidProfessorStrategy', () => {
  let strategy: AvoidProfessorStrategy;

  beforeEach(() => {
    strategy = new AvoidProfessorStrategy();
  });

  describe('evaluate with PROFESSOR_SELECT parameter', () => {
    it('should return 0 when combination contains unwanted professor', () => {
      const combination = [
        mockSection('s1', 'prof1'),
        mockSection('s2', 'prof2'),
      ];

      const parameter = {
        type: ParameterType.PROFESSOR_SELECT as const,
        value: 'prof1',
      };

      const score = strategy.evaluate(combination, parameter);
      expect(score).toBe(0);
    });

    it('should return 1 when combination does not contain unwanted professor', () => {
      const combination = [
        mockSection('s1', 'prof2'),
        mockSection('s2', 'prof3'),
      ];

      const parameter = {
        type: ParameterType.PROFESSOR_SELECT as const,
        value: 'prof1',
      };

      const score = strategy.evaluate(combination, parameter);
      expect(score).toBe(1);
    });

    it('should return 0 when any section has unwanted professor', () => {
      const combination = [
        mockSection('s1', 'prof2'),
        mockSection('s2', 'prof1'), // Unwanted
        mockSection('s3', 'prof3'),
      ];

      const parameter = {
        type: ParameterType.PROFESSOR_SELECT as const,
        value: 'prof1',
      };

      const score = strategy.evaluate(combination, parameter);
      expect(score).toBe(0);
    });

    it('should handle sections with null professor', () => {
      const combination = [mockSection('s1', null), mockSection('s2', 'prof2')];

      const parameter = {
        type: ParameterType.PROFESSOR_SELECT as const,
        value: 'prof1',
      };

      const score = strategy.evaluate(combination, parameter);
      expect(score).toBe(1);
    });

    it('should return 0 when looking for null professor and found', () => {
      const combination = [mockSection('s1', null), mockSection('s2', 'prof2')];

      const parameter = {
        type: ParameterType.PROFESSOR_SELECT as const,
        value: null,
      };

      const score = strategy.evaluate(combination, parameter);
      expect(score).toBe(0);
    });

    it('should handle empty combination', () => {
      const combination = [];

      const parameter = {
        type: ParameterType.PROFESSOR_SELECT as const,
        value: 'prof1',
      };

      const score = strategy.evaluate(combination, parameter);
      expect(score).toBe(1);
    });
  });

  describe('evaluate without parameter', () => {
    it('should return 1 when no parameter provided', () => {
      const combination = [
        mockSection('s1', 'prof1'),
        mockSection('s2', 'prof2'),
      ];

      const score = strategy.evaluate(combination, undefined);
      expect(score).toBe(1);
    });
  });

  describe('evaluate with wrong parameter type', () => {
    it('should return 1 when parameter is not PROFESSOR_SELECT', () => {
      const combination = [
        mockSection('s1', 'prof1'),
        mockSection('s2', 'prof2'),
      ];

      const parameter = {
        type: ParameterType.NUMBER as const,
        value: 123,
      };

      const score = strategy.evaluate(combination, parameter as any);
      expect(score).toBe(1);
    });

    it('should return 1 when parameter is DAY_SELECT', () => {
      const combination = [
        mockSection('s1', 'prof1'),
        mockSection('s2', 'prof2'),
      ];

      const parameter = {
        type: ParameterType.DAY_SELECT as const,
        value: 1,
      };

      const score = strategy.evaluate(combination, parameter as any);
      expect(score).toBe(1);
    });
  });
});
