import { SchedulingEngine } from './scheduling-engine';
import { RuleType } from '../rules/rule-catalog';
import { ParameterType } from 'src/types/rule-parameter.types';

const mockSection = (
  id: string,
  subjectId: string,
  startHour: number,
  endHour: number,
  days: { id: number; name: string }[],
  professorId: string | null = null,
) => ({
  id,
  subjectId,
  professorId,
  startTime: new Date(
    `1970-01-01T${String(startHour).padStart(2, '0')}:00:00Z`,
  ),
  endTime: new Date(`1970-01-01T${String(endHour).padStart(2, '0')}:00:00Z`),
  subject: { id: subjectId, name: `Subject ${subjectId}`, userId: 'user1' },
  professor: professorId
    ? { id: professorId, fullName: `Professor ${professorId}`, userId: 'user1' }
    : null,
  sectionDays: days.map((day, index) => ({
    id: `sd-${id}-${index}`,
    sectionId: id,
    dayId: day.id,
    day,
  })),
});

describe('SchedulingEngine', () => {
  let engine: SchedulingEngine;

  beforeEach(() => {
    engine = new SchedulingEngine();
  });

  describe('generate', () => {
    it('should return top 3 combinations ordered by score', () => {
      const sectionsBySubject = new Map([
        [
          'math',
          [
            mockSection('m1', 'math', 7, 9, [
              { id: 1, name: 'monday' },
              { id: 3, name: 'wednesday' },
            ]),
            mockSection('m2', 'math', 14, 16, [
              { id: 2, name: 'tuesday' },
              { id: 4, name: 'thursday' },
            ]),
          ],
        ],
        [
          'physics',
          [
            mockSection('p1', 'physics', 7, 9, [
              { id: 2, name: 'tuesday' },
              { id: 4, name: 'thursday' },
            ]),
            mockSection('p2', 'physics', 14, 16, [
              { id: 1, name: 'monday' },
              { id: 3, name: 'wednesday' },
            ]),
          ],
        ],
      ]);

      const rules = [
        { type: RuleType.PREFER_MORNING, priorityOrder: 1, parameters: null },
      ];

      const results = engine.generate(sectionsBySubject, rules);

      expect(results.length).toBeLessThanOrEqual(3);
      expect(results[0].score).toBeGreaterThanOrEqual(results[1]?.score ?? 0);
    });

    it('should not include combinations with schedule conflicts', () => {
      const sectionsBySubject = new Map([
        [
          'math',
          [mockSection('m1', 'math', 7, 9, [{ id: 1, name: 'monday' }])],
        ],
        [
          'physics',
          [
            // Conflicto: mismo día y horario solapado
            mockSection('p1', 'physics', 8, 10, [{ id: 1, name: 'monday' }]),
            // Sin conflicto
            mockSection('p2', 'physics', 9, 11, [{ id: 2, name: 'tuesday' }]),
          ],
        ],
      ]);

      const rules = [
        { type: RuleType.NO_GAPS, priorityOrder: 1, parameters: null },
      ];

      const results = engine.generate(sectionsBySubject, rules);

      // Solo debe haber una combinación válida (m1 + p2)
      expect(results.length).toBe(1);
      expect(results[0].sections.map((s) => s.id)).toContain('p2');
      expect(results[0].sections.map((s) => s.id)).not.toContain('p1');
    });

    it('should throw error if no valid combinations found', () => {
      const sectionsBySubject = new Map([
        [
          'math',
          [mockSection('m1', 'math', 7, 9, [{ id: 1, name: 'monday' }])],
        ],
        [
          'physics',
          [
            // Conflicto con todas las secciones de math
            mockSection('p1', 'physics', 8, 10, [{ id: 1, name: 'monday' }]),
          ],
        ],
      ]);

      const rules = [
        { type: RuleType.NO_GAPS, priorityOrder: 1, parameters: null },
      ];

      expect(() => engine.generate(sectionsBySubject, rules)).toThrow(
        'No valid schedule combinations found. There may be too many conflicts between sections.',
      );
    });

    it('should apply AVOID_PROFESSOR pruning before backtracking', () => {
      const sectionsBySubject = new Map([
        [
          'math',
          [
            mockSection(
              'm1',
              'math',
              7,
              9,
              [{ id: 1, name: 'monday' }],
              'prof1',
            ),
            mockSection(
              'm2',
              'math',
              14,
              16,
              [{ id: 2, name: 'tuesday' }],
              null,
            ),
          ],
        ],
        [
          'physics',
          [
            mockSection(
              'p1',
              'physics',
              7,
              9,
              [{ id: 2, name: 'tuesday' }],
              null,
            ),
          ],
        ],
      ]);

      const rules = [
        {
          type: RuleType.AVOID_PROFESSOR,
          priorityOrder: 1,
          parameters: {
            type: ParameterType.PROFESSOR_SELECT as const,
            value: 'prof1',
          },
        },
      ];

      const results = engine.generate(sectionsBySubject, rules);

      // m1 debe ser eliminado por el pruning
      results.forEach((result) => {
        expect(result.sections.map((s) => s.id)).not.toContain('m1');
      });
    });

    it('should return combinations ordered by score descending', () => {
      const sectionsBySubject = new Map([
        [
          'math',
          [
            mockSection('m1', 'math', 7, 9, [{ id: 1, name: 'monday' }]),
            mockSection('m2', 'math', 14, 16, [{ id: 2, name: 'tuesday' }]),
          ],
        ],
        [
          'physics',
          [
            mockSection('p1', 'physics', 7, 9, [{ id: 2, name: 'tuesday' }]),
            mockSection('p2', 'physics', 14, 16, [{ id: 1, name: 'monday' }]),
          ],
        ],
      ]);

      const rules = [
        { type: RuleType.PREFER_MORNING, priorityOrder: 1, parameters: null },
      ];

      const results = engine.generate(sectionsBySubject, rules);

      for (let i = 0; i < results.length - 1; i++) {
        expect(results[i].score).toBeGreaterThanOrEqual(results[i + 1].score);
      }
    });
  });
});
