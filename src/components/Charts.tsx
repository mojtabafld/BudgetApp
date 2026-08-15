import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Filler,
} from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';
import { useApp } from '../context/AppContext';
import { getCategoryById } from './CategoryIcon';
import { formatCurrency } from '../utils/currency';
import { formatMonthDisplay } from '../utils/date';

// Register Chart.js modules
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Filler
);

interface DonutChartProps {
  categoryTotals: Record<string, number>;
  totalExpense: number;
}

export const ExpenseDonutChart: React.FC<DonutChartProps> = ({ categoryTotals, totalExpense }) => {
  const { language, currency, theme, t } = useApp();
  const isDark = theme === 'dark';

  const categoryIds = Object.keys(categoryTotals);
  const labels = categoryIds.map((id) => {
    const cat = getCategoryById(id);
    return language === 'fa' ? cat.name_fa : cat.name;
  });

  const dataValues = categoryIds.map((id) => categoryTotals[id]);
  const colors = categoryIds.map((id) => getCategoryById(id).color);

  if (categoryIds.length === 0 || totalExpense === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-sm">
        <span>{t('no_transactions_month')}</span>
      </div>
    );
  }

  const chartData = {
    labels: labels,
    datasets: [
      {
        data: dataValues,
        backgroundColor: colors,
        borderColor: isDark ? '#1e293b' : '#ffffff',
        borderWidth: 3,
        hoverOffset: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: {
        position: 'bottom' as const,
        rtl: language === 'fa',
        labels: {
          color: isDark ? '#cbd5e1' : '#475569',
          font: {
            family: language === 'fa' ? 'Vazirmatn' : 'Inter',
            size: 11,
          },
          boxWidth: 12,
          boxHeight: 12,
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 12,
        },
      },
      tooltip: {
        rtl: language === 'fa',
        callbacks: {
          label: function (context: any) {
            const val = context.parsed;
            const pct = ((val / totalExpense) * 100).toFixed(1);
            return ` ${formatCurrency(val, currency, language)} (${pct}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="relative h-64 sm:h-72 w-full flex items-center justify-center">
      <Doughnut data={chartData} options={options} />
      {/* Center Label */}
      <div className="absolute top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          {t('spent')}
        </div>
        <div className="text-sm sm:text-base font-extrabold text-slate-800 dark:text-slate-100">
          {formatCurrency(totalExpense, currency, language)}
        </div>
      </div>
    </div>
  );
};

interface LineChartProps {
  monthKeys: string[];
  incomeData: number[];
  expenseData: number[];
}

export const IncomeExpenseLineChart: React.FC<LineChartProps> = ({
  monthKeys,
  incomeData,
  expenseData,
}) => {
  const { language, calendar, currency, theme, t } = useApp();
  const isDark = theme === 'dark';

  const labels = monthKeys.map((mk) => formatMonthDisplay(mk, calendar, language));

  const chartData = {
    labels,
    datasets: [
      {
        label: t('income'),
        data: incomeData,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.12)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#10b981',
        pointBorderColor: '#ffffff',
        pointHoverRadius: 6,
        pointRadius: 4,
      },
      {
        label: t('expense'),
        data: expenseData,
        borderColor: '#f43f5e',
        backgroundColor: 'rgba(244, 63, 94, 0.12)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#f43f5e',
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
        position: 'top' as const,
        rtl: language === 'fa',
        labels: {
          color: isDark ? '#cbd5e1' : '#475569',
          font: {
            family: language === 'fa' ? 'Vazirmatn' : 'Inter',
            size: 12,
            weight: 600,
          },
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 16,
        },
      },
      tooltip: {
        rtl: language === 'fa',
        callbacks: {
          label: function (context: any) {
            return ` ${context.dataset.label}: ${formatCurrency(context.parsed.y, currency, language)}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: isDark ? '#94a3b8' : '#64748b',
          font: {
            family: language === 'fa' ? 'Vazirmatn' : 'Inter',
            size: 11,
          },
        },
      },
      y: {
        grid: {
          color: isDark ? 'rgba(51, 65, 85, 0.4)' : 'rgba(226, 232, 240, 0.8)',
        },
        ticks: {
          color: isDark ? '#94a3b8' : '#64748b',
          font: {
            family: language === 'fa' ? 'Vazirmatn' : 'Inter',
            size: 11,
          },
          callback: function (value: any) {
            return formatCurrency(value, currency, language);
          },
        },
      },
    },
  };

  return (
    <div className="h-64 sm:h-80 w-full">
      <Line data={chartData} options={options as any} />
    </div>
  );
};
