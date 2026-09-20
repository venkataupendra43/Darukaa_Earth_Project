import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const ComparisonChart = ({ summaries = [] }) => {
  if (!summaries || summaries.length === 0) {
    return null;
  }

  const labels = summaries.map((s) => s.metric_name);
  const latestValues = summaries.map((s) => s.latest_value);

  const data = {
    labels,
    datasets: [
      {
        label: 'Latest Observation',
        data: latestValues,
        backgroundColor: '#10b981',
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => {
            const summary = summaries[context.dataIndex];
            return ` ${context.raw} ${summary ? summary.unit : ''}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { family: 'Plus Jakarta Sans', size: 11 } },
      },
      y: {
        grid: { color: '#f1f5f9' },
        ticks: { font: { family: 'Plus Jakarta Sans', size: 11 } },
      },
    },
  };

  return (
    <div style={{ height: '220px', width: '100%' }}>
      <Bar data={data} options={options} />
    </div>
  );
};
