'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  TimeScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  TimeScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

interface PriceDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

interface PriceChartProps {
  productId: string;
  data: PriceDataPoint[];
  timeframe?: '7d' | '30d' | '90d' | '1y';
  className?: string;
}

const PriceChart: React.FC<PriceChartProps> = ({ 
  productId, 
  data, 
  timeframe = '30d', 
  className = '' 
}) => {
  const chartRef = useRef<ChartJS>(null);
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Prepare line chart data (using close prices)
    const labels = data.map(point => new Date(point.date));
    const prices = data.map(point => point.close);

    // Create chart configuration
    const config = {
      type: 'line' as const,
      data: {
        labels,
        datasets: [
          {
            label: 'Price',
            data: prices,
            borderColor: 'var(--accent-bronze)',
            backgroundColor: 'rgba(168, 99, 50, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.1,
            pointBackgroundColor: 'var(--accent-bronze)',
            pointBorderColor: 'var(--accent-bronze)',
            pointRadius: 3,
            pointHoverRadius: 5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: `Price History (${timeframe})`,
            color: 'var(--text-primary)',
            font: {
              size: 16,
              weight: 'bold',
            },
          },
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: 'var(--bg-secondary)',
            titleColor: 'var(--text-primary)',
            bodyColor: 'var(--text-secondary)',
            borderColor: 'var(--border-primary)',
            borderWidth: 1,
            callbacks: {
              title: (context: any) => {
                return new Date(context[0].parsed.x).toLocaleDateString();
              },
              label: (context: any) => {
                return `Price: $${context.parsed.y.toFixed(2)}`;
              },
            },
          },
        },
        scales: {
          x: {
            type: 'time',
            time: {
              unit: timeframe === '7d' ? 'day' : timeframe === '30d' ? 'day' : 'week',
            },
            grid: {
              color: 'var(--border-primary)',
            },
            ticks: {
              color: 'var(--text-secondary)',
            },
          },
          y: {
            beginAtZero: false,
            grid: {
              color: 'var(--border-primary)',
            },
            ticks: {
              color: 'var(--text-secondary)',
              callback: function(value: any) {
                return '$' + value.toFixed(2);
              },
            },
          },
        },
        interaction: {
          intersect: false,
          mode: 'index' as const,
        },
      },
    };

    setChartData(config);
  }, [data, timeframe]);

  if (!chartData) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="text-[var(--text-secondary)]">Loading chart...</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={`flex items-center justify-center h-64 art-deco-card ${className}`}>
        <div className="text-center">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
            No Price Data Available
          </h3>
          <p className="text-[var(--text-secondary)]">
            Price history will appear here once scraping data is collected.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`art-deco-card p-6 ${className}`}>
      <div className="h-64 md:h-80">
        <Chart ref={chartRef} {...chartData} />
      </div>
      
      {/* Chart Statistics */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-[var(--border-primary)]">
        <div className="text-center">
          <div className="text-sm text-[var(--text-secondary)]">Current</div>
          <div className="text-lg font-bold text-[var(--text-primary)]">
            ${data[data.length - 1]?.close.toFixed(2) || '0.00'}
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-[var(--text-secondary)]">24h Change</div>
          <div className={`text-lg font-bold ${
            data.length > 1 && data[data.length - 1].close > data[data.length - 2].close
              ? 'text-green-400'
              : 'text-red-400'
          }`}>
            {data.length > 1 
              ? `${((data[data.length - 1].close - data[data.length - 2].close) / data[data.length - 2].close * 100).toFixed(1)}%`
              : '0.0%'
            }
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-[var(--text-secondary)]">High</div>
          <div className="text-lg font-bold text-[var(--text-primary)]">
            ${Math.max(...data.map(d => d.high)).toFixed(2)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-[var(--text-secondary)]">Low</div>
          <div className="text-lg font-bold text-[var(--text-primary)]">
            ${Math.min(...data.map(d => d.low)).toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceChart;
