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
import type { MonthlyStat } from '@/types';
import { formatAmount } from '@/utils/formatters';

const CustomLineTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white px-4 py-2 rounded-xl shadow-lg border border-gray-100">
        <p className="text-sm font-medium text-gray-800 mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm font-semibold" style={{ color: entry.color }}>
            {entry.name}: ¥{formatAmount(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export interface MonthlyTrendChartProps {
  data: MonthlyStat[];
}

export function MonthlyTrendChart({ data }: MonthlyTrendChartProps) {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
          <XAxis
            dataKey="monthLabel"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
            tickFormatter={(value) => {
              if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
              return value.toString();
            }}
          />
          <Tooltip content={<CustomLineTooltip />} />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ paddingTop: 10 }}
            formatter={(value: string) => (
              <span className="text-sm text-gray-600">{value}</span>
            )}
          />
          <Line
            type="monotone"
            dataKey="income"
            name="收入"
            stroke="#22C55E"
            strokeWidth={3}
            dot={{ fill: '#22C55E', r: 4, strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 6, stroke: '#22C55E', strokeWidth: 2, fill: '#fff' }}
          />
          <Line
            type="monotone"
            dataKey="expense"
            name="支出"
            stroke="#EF4444"
            strokeWidth={3}
            dot={{ fill: '#EF4444', r: 4, strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 6, stroke: '#EF4444', strokeWidth: 2, fill: '#fff' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
