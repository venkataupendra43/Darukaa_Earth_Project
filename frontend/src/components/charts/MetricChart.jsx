import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { formatDate } from '../../utils/formatters';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const MetricChart = ({ metricName, unit, dataPoints = [] }) => {
  if (!dataPoints || dataPoints.length === 0) {
    return (
      <div
        style={{
          height: '240px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.875rem',
          backgroundColor: 'var(--bg-surface-secondary)',
          borderRadius: 'var(--radius-sm)',
        }}
      >
        No historical measurements recorded for {metricName}.
      </div>
    );
  }

  // Sort chronological
  const sortedPoints = [...dataPoints].sort(
    (a, b) => new Date(a.recorded_at) - new Date(b.recorded_at)
  );

  const labels = sortedPoints.map((dp) => formatDate(dp.recorded_at));
  const values = sortedPoints.map((dp) => dp.metric_value);

  const data = {
    labels,
    datasets: [
      {
        label: `${metricName} (${unit})`,
        data: values,
        borderColor: '#059669',
        backgroundColor: 'rgba(5, 150, 105, 0.12)',
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#064e3b',
        pointBorderColor: '#ffffff',
        pointHoverRadius: 6,
        pointRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            family: 'Plus Jakarta Sans',
            weight: 600,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => ` Value: ${context.raw} ${unit}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: { family: 'Plus Jakarta Sans', size: 11 },
        },
      },
      y: {
        grid: {
          color: '#f1f5f9',
        },
        ticks: {
          font: { family: 'Plus Jakarta Sans', size: 11 },
        },
        title: {
          display: true,
          text: unit,
          font: { family: 'Plus Jakarta Sans', weight: 600 },
        },
      },
    },
  };

  return (
    <div style={{ height: '260px', width: '100%' }}>
      <Line data={data} options={options} />
    </div>
  );
};
