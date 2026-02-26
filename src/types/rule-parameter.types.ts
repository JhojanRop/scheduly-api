export enum ParameterType {
  NUMBER = 'number',
  TIME_RANGE = 'timeRange',
  DAY_SELECT = 'daySelect',
  PROFESSOR_SELECT = 'professorSelect',
}

export type NumberParameter = {
  type: ParameterType.NUMBER;
  value: number;
};

export type TimeRangeParameter = {
  type: ParameterType.TIME_RANGE;
  value: { start: string; end: string };
};

export type DaySelectParameter = {
  type: ParameterType.DAY_SELECT;
  value: number;
};

export type ProfessorSelectParameter = {
  type: ParameterType.PROFESSOR_SELECT;
  value: string;
};

export type RuleParameter =
  | NumberParameter
  | TimeRangeParameter
  | DaySelectParameter
  | ProfessorSelectParameter
  | null;
