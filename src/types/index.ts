export interface Variation {
  id?: number;
  name: string;
}

export interface DailyData {
  date: string;
  visits: Record<string, number>;
  conversions: Record<string, number>;
}

export interface RawData {
  variations: Variation[];
  data: DailyData[];
}

export interface ChartDataPoint {
  date: string;
  [variationId: string]: number | string;
}

export interface WeeklyAggregatedData {
  weekStart: string;
  visits: Record<string, number>;
  conversions: Record<string, number>;
}

export type LineType = 'monotone' | 'linear' | 'step' | 'stepBefore' | 'stepAfter'

export type Theme = 'light' | 'dark'
