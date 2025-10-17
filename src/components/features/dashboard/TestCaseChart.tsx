// Path: src/components/features/dashboard/TestCaseChart.tsx
import React from 'react';
import { TestCaseTrendPoint } from '../../../services/dashboardService';

interface TestCaseChartProps {
  data: TestCaseTrendPoint[];
  isLoading: boolean;
}

const statusConfig = {
    passed: { color: '#22c55e', name: 'Passed' },
    blocked: { color: '#6b7280', name: 'Blocked' },
    skipped: { color: '#f59e0b', name: 'Skipped' },
    failed: { color: '#ef4444', name: 'Failed' },
    automationPassed: { color: '#22c55e', name: 'Automation Passed'},
    automationFailed: { color: '#ef4444', name: 'Automation Failed'},
    automationError: { color: '#8b5cf6', name: 'Automation Error'},
};
type StatusKey = keyof typeof statusConfig;

const LegendItem: React.FC<{color: string, value: number, percentage: number, name: string}> = ({ color, value, percentage, name }) => (
    <div className="flex items-center space-x-2">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
        <div className="flex flex-col">
            <span className="font-bold text-gray-800 dark:text-white">{value} {name}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{percentage}% set to {name.split(' ')[1] || name}</span>
        </div>
    </div>
);

const TestCaseChart: React.FC<TestCaseChartProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md animate-pulse">
            <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
    );
  }

  if (data.length === 0) {
    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">Test Case Trend</h2>
            <p className="text-gray-500 dark:text-gray-400">No data available to display chart.</p>
        </div>
    );
  }

  const chartHeight = 140;
  const chartWidth = 1500;
  const padding = { top: 20, right: 20, bottom: 30, left: 30 };
  const drawableHeight = chartHeight - padding.top - padding.bottom;
  const drawableWidth = chartWidth - padding.left - padding.right;

  const allValues = data.flatMap(d => Object.values(d.statuses));
  const maxY = Math.ceil(Math.max(...allValues, 10) / 5) * 5; // Round up to nearest 5
  const yAxisTicks = Array.from({ length: (maxY / 5) + 1 }, (_, i) => i * 5);


  const getCoords = (point: TestCaseTrendPoint, index: number) => {
    const x = padding.left + (index / (data.length - 1)) * drawableWidth;
    return Object.entries(point.statuses).reduce((acc, [key, value]) => {
      const y = padding.top + drawableHeight - (value / maxY) * drawableHeight;
      acc[key as StatusKey] = { x, y };
      return acc;
    }, {} as Record<StatusKey, { x: number; y: number }>);
  };
  
  const points = data.map(getCoords);
  const paths = Object.keys(statusConfig).map(key => {
      const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[key as StatusKey].x} ${p[key as StatusKey].y}`).join(' ');
      return { key, d };
  });

  const lastDataPoint = data[data.length - 1].statuses;
  const manualTotal = lastDataPoint.passed + lastDataPoint.blocked + lastDataPoint.skipped + lastDataPoint.failed;
  const automationTotal = lastDataPoint.automationPassed + lastDataPoint.automationFailed + lastDataPoint.automationError;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">Test Case Trend</h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">In the past {data.length} days</span>
        </div>
      <div className="flex flex-col md:flex-row items-start gap-6">
        <div className="flex-grow">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto">
            {/* Y-Axis Grid Lines & Labels */}
            {yAxisTicks.map(tick => {
              const y = padding.top + drawableHeight - (tick / maxY) * drawableHeight;
              return (
                <g key={tick}>
                  <line x1={padding.left} y1={y} x2={chartWidth - padding.right} y2={y} className="stroke-current text-gray-200 dark:text-gray-700" strokeWidth="1" />
                  <text x={padding.left - 8} y={y + 4} textAnchor="end" className="text-xs fill-current text-gray-500 dark:text-gray-400">{tick}</text>
                </g>
              );
            })}
            
            {/* X-Axis Labels */}
            {data.map((d, i) => {
                const x = padding.left + (i / (data.length - 1)) * drawableWidth;
                return (
                    <text key={i} x={x} y={chartHeight - 5} textAnchor="middle" className="text-xs fill-current text-gray-500 dark:text-gray-400">{d.date}</text>
                );
            })}

            {/* Data Lines */}
            {paths.map(({key, d}) => (
                <path key={key} d={d} stroke={statusConfig[key as StatusKey].color} fill="none" strokeWidth="2" />
            ))}
            
            {/* Data Points */}
            {points.map((pointGroup, i) => (
                Object.entries(pointGroup).map(([key, coords]) => (
                    <circle key={`${i}-${key}`} cx={coords.x} cy={coords.y} r="3" fill={statusConfig[key as StatusKey].color} className="stroke-white dark:stroke-gray-800" strokeWidth="1" />
                ))
            ))}
          </svg>
        </div>
        <div className="flex-shrink-0 flex flex-col sm:flex-row gap-4 sm:gap-8">
            {/* Manual results */}
            <div className="space-y-3">
                <LegendItem color={statusConfig.passed.color} name={statusConfig.passed.name} value={lastDataPoint.passed} percentage={Math.round(manualTotal > 0 ? (lastDataPoint.passed / manualTotal) * 100 : 0)} />
                <LegendItem color={statusConfig.blocked.color} name={statusConfig.blocked.name} value={lastDataPoint.blocked} percentage={Math.round(manualTotal > 0 ? (lastDataPoint.blocked / manualTotal) * 100 : 0)} />
                {/* FIX: Removed a large block of extraneous text that was breaking the code. */}
                <LegendItem color={statusConfig.skipped.color} name={statusConfig.skipped.name} value={lastDataPoint.skipped} percentage={Math.round(manualTotal > 0 ? (lastDataPoint.skipped / manualTotal) * 100 : 0)} />
                <LegendItem color={statusConfig.failed.color} name={statusConfig.failed.name} value={lastDataPoint.failed} percentage={Math.round(manualTotal > 0 ? (lastDataPoint.failed / manualTotal) * 100 : 0)} />
            </div>
             {/* Automation results */}
             <div className="space-y-3">
                <LegendItem color={statusConfig.automationPassed.color} name={statusConfig.automationPassed.name} value={lastDataPoint.automationPassed} percentage={Math.round(automationTotal > 0 ? (lastDataPoint.automationPassed / automationTotal) * 100 : 0)} />
                <LegendItem color={statusConfig.automationFailed.color} name={statusConfig.automationFailed.name} value={lastDataPoint.automationFailed} percentage={Math.round(automationTotal > 0 ? (lastDataPoint.automationFailed / automationTotal) * 100 : 0)} />
                <LegendItem color={statusConfig.automationError.color} name={statusConfig.automationError.name} value={lastDataPoint.automationError} percentage={Math.round(automationTotal > 0 ? (lastDataPoint.automationError / automationTotal) * 100 : 0)} />
            </div>
        </div>
      </div>
    </div>
  );
};

export default TestCaseChart;