import { ParameterType } from 'src/types/rule-parameter.types';

export enum RuleType {
  NO_GAPS = 'NO_GAPS',
  NO_EARLY_MORNINGS = 'NO_EARLY_MORNINGS',
  NO_LATE_EVENINGS = 'NO_LATE_EVENINGS',
  PREFER_MORNING = 'PREFER_MORNING',
  PREFER_AFTERNOON = 'PREFER_AFTERNOON',
  COMPACT_DAYS = 'COMPACT_DAYS',
  BALANCED_LOAD = 'BALANCED_LOAD',
  MIN_FREE_DAY = 'MIN_FREE_DAY',
  MAX_CONSECUTIVE_HOURS = 'MAX_CONSECUTIVE_HOURS',
  LUNCH_BREAK_PROTECTED = 'LUNCH_BREAK_PROTECTED',
  AVOID_PROFESSOR = 'AVOID_PROFESSOR',
}

export interface RuleCatalogEntry {
  type: RuleType;
  name: string;
  description: string;
  parameter: {
    type: ParameterType;
    label: string;
    required: boolean;
    min?: number;
    max?: number;
  } | null;
}

export const RULE_CATALOG: Record<RuleType, RuleCatalogEntry> = {
  [RuleType.NO_GAPS]: {
    type: RuleType.NO_GAPS,
    name: 'Sin huecos',
    description: 'Evita tiempos muertos entre clases en el mismo día',
    parameter: null,
  },
  [RuleType.NO_EARLY_MORNINGS]: {
    type: RuleType.NO_EARLY_MORNINGS,
    name: 'Sin madrugadas',
    description: 'Evita clases en las primeras horas de la mañana',
    parameter: null,
  },
  [RuleType.NO_LATE_EVENINGS]: {
    type: RuleType.NO_LATE_EVENINGS,
    name: 'Sin noches',
    description: 'Evita clases en las últimas horas de la tarde/noche',
    parameter: null,
  },
  [RuleType.PREFER_MORNING]: {
    type: RuleType.PREFER_MORNING,
    name: 'Preferir mañanas',
    description: 'Premia horarios concentrados en la mañana',
    parameter: null,
  },
  [RuleType.PREFER_AFTERNOON]: {
    type: RuleType.PREFER_AFTERNOON,
    name: 'Preferir tardes',
    description: 'Premia horarios concentrados en la tarde',
    parameter: null,
  },
  [RuleType.COMPACT_DAYS]: {
    type: RuleType.COMPACT_DAYS,
    name: 'Días compactos',
    description: 'Premia tener clases en el menor número de días posible',
    parameter: null,
  },
  [RuleType.BALANCED_LOAD]: {
    type: RuleType.BALANCED_LOAD,
    name: 'Carga equilibrada',
    description: 'Distribuye las horas de clase de forma pareja entre los días',
    parameter: null,
  },
  [RuleType.MIN_FREE_DAY]: {
    type: RuleType.MIN_FREE_DAY,
    name: 'Día libre',
    description: 'Garantiza al menos un día sin clases',
    parameter: {
      type: ParameterType.DAY_SELECT,
      label: '¿Qué día prefieres libre?',
      required: false,
    },
  },
  [RuleType.MAX_CONSECUTIVE_HOURS]: {
    type: RuleType.MAX_CONSECUTIVE_HOURS,
    name: 'Límite de horas seguidas',
    description: 'Penaliza bloques más largos que el límite definido',
    parameter: {
      type: ParameterType.NUMBER,
      label: '¿Cuántas horas máximo seguidas?',
      required: true,
      min: 1,
      max: 8,
    },
  },
  [RuleType.LUNCH_BREAK_PROTECTED]: {
    type: RuleType.LUNCH_BREAK_PROTECTED,
    name: 'Hora de almuerzo',
    description: 'Protege un rango horario para que no haya clases',
    parameter: {
      type: ParameterType.TIME_RANGE,
      label: '¿Qué rango quieres proteger?',
      required: true,
    },
  },
  [RuleType.AVOID_PROFESSOR]: {
    type: RuleType.AVOID_PROFESSOR,
    name: 'Evitar profesor',
    description: 'Excluye secciones de un profesor que no quieres',
    parameter: {
      type: ParameterType.PROFESSOR_SELECT,
      label: '¿Qué profesor quieres evitar?',
      required: true,
    },
  },
};
