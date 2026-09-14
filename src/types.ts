export type CategoryId = 
  | 'all'
  | 'money'
  | 'people'
  | 'biology'
  | 'energy'
  | 'technology'
  | 'planet'
  | 'society';

export interface CategoryMeta {
  id: CategoryId;
  name: string;
  icon: string;
  color: string;
  badgeBg: string;
  accentColor: string;
  description: string;
}

export interface HistoricalPoint {
  yearOrCycle: number;
  value: number;
  formattedValue: string;
  context?: string;
  isProjection?: boolean;
}

export type SimulationType = 
  | 'bacteria-petri'
  | 'money-flow'
  | 'solar-grid'
  | 'network-nodes'
  | 'co2-atmosphere'
  | 'population-cluster'
  | 'inflation-decay'
  | 'debt-accumulation';

export interface Phenomenon {
  id: string;
  title: string;
  subtitle: string;
  category: CategoryId;
  icon: string;
  unit: string;
  baseUnit: string;
  growthRatePercent: number;
  growthPeriod: string;
  doublingTimeText: string;
  doublingTimeNumeric: number; // in standardized comparable units or days
  growthSpeedRank: number; // 1 = fastest
  initialContext: string;
  currentValueText: string;
  projected2050Text: string;
  
  // Math & Formula
  formula: string;
  formulaVariables: { symbol: string; meaning: string }[];
  sameMathEquivalent: {
    title: string;
    description: string;
    equivalentDomain: string;
  };

  // Why it compounds / Science & Economics
  whyItCompounds: {
    headline: string;
    positiveFeedback: string;
    limitingFactor: string; // Carrying capacity / S-curve
    sourceName: string;
    sourceUrl?: string;
  };

  // Time series
  historicalData: HistoricalPoint[];
  projectionData: HistoricalPoint[];
  
  // Interactive Simulation metadata
  simulationType: SimulationType;
  simulationInstructions: string;
}

export interface UniversalScenario {
  id: string;
  name: string;
  category: CategoryId;
  initialValue: number;
  ratePercent: number;
  timeUnit: 'years' | 'months' | 'minutes' | 'days';
  timeHorizon: number;
  unitLabel: string;
  contextNote: string;
}
