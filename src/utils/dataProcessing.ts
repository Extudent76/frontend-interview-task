import type { DailyData, WeeklyAggregatedData, ChartDataPoint } from '../types';
import { calculateConversionRate } from './calculations';

function getWeekStart(date: string): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);
  return monday.toISOString().split('T')[0];
}

export function aggregateByWeek(dailyData: DailyData[]): WeeklyAggregatedData[] {
  const weekMap = new Map<string, WeeklyAggregatedData>();

  dailyData.forEach((day) => {
    const weekStart = getWeekStart(day.date);

    if (!weekMap.has(weekStart)) {
      weekMap.set(weekStart, {
        weekStart,
        visits: {},
        conversions: {},
      });
    }

    const weekData = weekMap.get(weekStart)!;

    Object.entries(day.visits).forEach(([variationId, visits]) => {
      weekData.visits[variationId] = (weekData.visits[variationId] || 0) + visits;
    });

    Object.entries(day.conversions).forEach(([variationId, conversions]) => {
      weekData.conversions[variationId] = (weekData.conversions[variationId] || 0) + conversions;
    });
  });

  return Array.from(weekMap.values()).sort((a, b) => 
    a.weekStart.localeCompare(b.weekStart)
  );
}

export function transformToChartData(
  data: DailyData[] | WeeklyAggregatedData[],
  selectedVariations: Set<string>
): ChartDataPoint[] {
  return data.map((point) => {
    const chartPoint: ChartDataPoint = {
      date: 'date' in point ? point.date : point.weekStart,
    };

    selectedVariations.forEach((variationId) => {
      const visits = point.visits[variationId];
      const conversions = point.conversions[variationId];

      if (visits !== undefined && conversions !== undefined) {
        chartPoint[variationId] = calculateConversionRate(conversions, visits);
      }
    });

    return chartPoint;
  });
}
