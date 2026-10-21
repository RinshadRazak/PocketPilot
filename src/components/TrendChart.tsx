import React from 'react';
import { TrendingUp } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { AppState } from '../types';
import { getHistoricalChartData } from '../utils/calculations';
import { formatCurrency } from '../utils/formatters';

interface TrendChartProps {
  state: AppState;
  month: string;
}

export const TrendChart: React.FC<TrendChartProps> = ({ state, month }) => {
  const data = getHistoricalChartData(state, month);
  const hasData = data.some(d => d.income > 0 || d.expenses > 0);

  if (!hasData) {
    return (
      <div className="trend-chart" style={{ display: 'grid', placeItems: 'center', height: '248px' }}>
        <div className="empty-state compact-empty" style={{ minHeight: '180px', padding: '16px' }}>
          <TrendingUp size={28} style={{ color: 'var(--mint)', opacity: 0.85, marginBottom: '8px' }} />
          <h3 style={{ fontSize: '15px', margin: '4px 0 2px', color: '#e3edf7' }}>No cash flow activity yet</h3>
          <p style={{ fontSize: '11px', margin: 0, color: 'var(--muted)', maxWidth: '300px', lineHeight: 1.5 }}>
            Add income or expense transactions to view your six-month financial trends.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="trend-chart">
      <div
        className="chart-graphic"
        role="img"
        aria-label={`Income and expenses over six months. ${data
          .map(d => `${d.month}: income ${formatCurrency(d.income)}, expenses ${formatCurrency(d.expenses)}`)
          .join('; ')}`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 14, right: 5, bottom: 0, left: -24 }}
          >
            <defs>
              <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#74f6c8" stopOpacity={0.24} />
                <stop offset="100%" stopColor="#74f6c8" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a49cff" stopOpacity={0.18} />
                <stop offset="100%" stopColor="#a49cff" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              vertical={false}
              stroke="rgba(185,202,229,.11)"
              strokeDasharray="3 6"
            />

            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#8696af', fontSize: 12 }}
              dy={12}
            />

            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#71839e', fontSize: 11 }}
              tickFormatter={a => `₹${Math.round(a / 1000)}k`}
              width={46}
            />

            <Tooltip
              cursor={{
                stroke: 'rgba(164,156,255,.35)',
                strokeDasharray: '4 4',
              }}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="chart-tooltip">
                    <span className="chart-tooltip-label">{label}</span>
                    {payload.map(item => (
                      <div className="chart-tooltip-row" key={item.dataKey}>
                        <i style={{ background: item.color }} />
                        {item.name}
                        <strong>{formatCurrency(Number(item.value))}</strong>
                      </div>
                    ))}
                  </div>
                );
              }}
            />

            <Area
              type="monotone"
              dataKey="income"
              name="Income"
              stroke="#74f6c8"
              strokeWidth={2.5}
              fill="url(#incomeFill)"
              dot={false}
              activeDot={{ r: 5, stroke: '#0c192c', strokeWidth: 3 }}
              animationDuration={700}
            />

            <Area
              type="monotone"
              dataKey="expenses"
              name="Expenses"
              stroke="#a49cff"
              strokeWidth={2.5}
              fill="url(#expenseFill)"
              dot={false}
              activeDot={{ r: 5, stroke: '#0c192c', strokeWidth: 3 }}
              animationDuration={700}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <table className="visually-hidden">
        <caption>
          Monthly income and expenses, ending {month}
        </caption>
        <thead>
          <tr>
            <th scope="col">Month</th>
            <th scope="col">Income</th>
            <th scope="col">Expenses</th>
          </tr>
        </thead>
        <tbody>
          {data.map(d => (
            <tr key={d.monthKey}>
              <th scope="row">{d.monthKey}</th>
              <td>{formatCurrency(d.income, 2)}</td>
              <td>{formatCurrency(d.expenses, 2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
