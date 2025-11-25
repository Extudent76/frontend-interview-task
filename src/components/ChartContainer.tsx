import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { RawData, DailyData, WeeklyAggregatedData, LineType } from '../types';
import { transformToChartData, aggregateByWeek } from '../utils/dataProcessing';
import styles from '../styles/ChartContainer.module.css';

interface ChartContainerProps {
  data: RawData;
  selectedVariation: string;
  timeRange: 'day' | 'week';
  lineType: LineType;
}

const VARIATION_COLORS: Record<string, string> = {
  '0': '#8884d8',      
  '10001': '#82ca9d',  
  '10002': '#ffc658',
  '10003': '#ff7c7c',
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    dataKey: string;
    value: number;
    color: string;
  }>;
  label?: string;
  rawData: DailyData[] | WeeklyAggregatedData[];
  selectedVariation: string;
  getVariationName: (id: string) => string;
}

const CustomTooltip = ({ 
  active, 
  payload, 
  label,
  rawData,
  selectedVariation,
  getVariationName 
}: CustomTooltipProps) => {
  if (!active || !payload || !label) {
    return null;
  }

  const dataPoint = rawData.find((d) => {
    const date = 'date' in d ? d.date : d.weekStart;
    return date === label;
  });

  if (!dataPoint) {
    return null;
  }

  // Если выбрано "Все вариации", показываем данные для всех
  if (selectedVariation === 'all') {
    return (
      <div className={styles.tooltip}>
        <p className={styles.tooltipDate}>{label}</p>
        {payload.map((entry) => {
          const variationId = entry.dataKey;
          const visits = dataPoint.visits[variationId];
          const conversions = dataPoint.conversions[variationId];
          
          if (visits === undefined || conversions === undefined) {
            return null;
          }

          return (
            <div key={variationId} className={styles.tooltipVariation}>
              <p 
                className={styles.tooltipVariationName}
                style={{ color: entry.color }}
              >
                {getVariationName(variationId)}
              </p>
              <p className={styles.tooltipData}>
                Visits: {visits}
              </p>
              <p className={styles.tooltipData}>
                Conversions: {conversions}
              </p>
              <p className={styles.tooltipRate}>
                Rate: {typeof entry.value === 'number' ? entry.value.toFixed(2) : '0.00'}%
              </p>
            </div>
          );
        })}
      </div>
    );
  }

  // Для одной вариации
  const visits = dataPoint.visits[selectedVariation];
  const conversions = dataPoint.conversions[selectedVariation];
  const conversionRate = payload.find(p => p.dataKey === selectedVariation)?.value;

  if (visits === undefined || conversions === undefined) {
    return null;
  }

  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipDate}>{label}</p>
      <div className={styles.tooltipVariation}>
        <p 
          className={styles.tooltipVariationName}
          style={{ color: VARIATION_COLORS[selectedVariation] || '#8884d8' }}
        >
          {getVariationName(selectedVariation)}
        </p>
        <p className={styles.tooltipData}>
          Visits: {visits}
        </p>
        <p className={styles.tooltipData}>
          Conversions: {conversions}
        </p>
        <p className={styles.tooltipRate}>
          Rate: {typeof conversionRate === 'number' ? conversionRate.toFixed(2) : '0.00'}%
        </p>
      </div>
    </div>
  );
};

const ChartContainer = ({ data, selectedVariation, timeRange, lineType }: ChartContainerProps) => {
  const selectedVariations = useMemo(() => {
    if (selectedVariation === 'all') {
      return new Set(
        data.variations.map(v => v.id !== undefined ? String(v.id) : '0')
      );
    }
    return new Set([selectedVariation]);
  }, [selectedVariation, data.variations]);

  const processedRawData = useMemo(() => {
    return timeRange === 'week' 
      ? aggregateByWeek(data.data)
      : data.data;
  }, [data.data, timeRange]);

  const chartData = useMemo(() => {
    return transformToChartData(processedRawData, selectedVariations);
  }, [processedRawData, selectedVariations]);

  const yAxisDomain = useMemo(() => {
    if (chartData.length === 0) return [0, 100];

    let min = Infinity;
    let max = -Infinity;

    chartData.forEach((point) => {
      selectedVariations.forEach((variationId) => {
        const value = point[variationId];
        if (typeof value === 'number') {
          min = Math.min(min, value);
          max = Math.max(max, value);
        }
      });
    });

    return [Math.max(0, min), max];
  }, [chartData, selectedVariations]);

  const getVariationName = (variationId: string): string => {
    const variation = data.variations.find(v => {
      const id = v.id !== undefined ? String(v.id) : '0';
      return id === variationId;
    });
    return variation?.name || variationId;
  };

  const formatYAxis = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className={styles.container}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
        >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date" 
          angle={window.innerWidth <= 900 ? -45 : 0}
          textAnchor={window.innerWidth <= 900 ? 'end' : 'middle'}
          height={window.innerWidth <= 900 ? 60 : 30}
        />
        <YAxis 
          domain={yAxisDomain}
          tickFormatter={formatYAxis}
          width={window.innerWidth <= 670 ? 45 : 60}
        />
        <Tooltip 
          content={
            <CustomTooltip 
              rawData={processedRawData}
              selectedVariation={selectedVariation}
              getVariationName={getVariationName}
            />
          }
          cursor={{ stroke: '#666', strokeWidth: 1, strokeDasharray: '5 5' }}
        />
        <Legend/>
        
        {selectedVariation === 'all' ? (
          Array.from(selectedVariations).map((variationId) => (
            <Line
              key={variationId}
              type={lineType}
              dataKey={variationId}
              name={getVariationName(variationId)}
              stroke={VARIATION_COLORS[variationId] || '#8884d8'}
              strokeWidth={window.innerWidth <= 670 ? 1.5 : 2}
              dot={{ r: window.innerWidth <= 670 ? 2 : 3 }}
              activeDot={{ r: window.innerWidth <= 670 ? 4 : 5 }}
            />
          ))
        ) : (
          <Line
            type={lineType}
            dataKey={selectedVariation}
            name={getVariationName(selectedVariation)}
            stroke={VARIATION_COLORS[selectedVariation] || '#8884d8'}
            strokeWidth={window.innerWidth <= 670 ? 1.5 : 2}
            dot={{ r: window.innerWidth <= 670 ? 2 : 3 }}
            activeDot={{ r: window.innerWidth <= 670 ? 4 : 5 }}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
    </div>
  );
};

export default ChartContainer;
