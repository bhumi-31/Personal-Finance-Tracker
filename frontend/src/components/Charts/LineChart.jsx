import React from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function LineChartComponent({ data, title }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>
        [ NO TIMELINE TRENDS LOADED ]
      </div>
    );
  }

  return (
    <div>
      {title && <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 900, marginBottom: '12px' }}>{title}</h3>}
      <ResponsiveContainer width="100%" height={280}>
        <RechartsLineChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="2 2" stroke="#475569" opacity={0.3} />
          <XAxis
            dataKey="month"
            tick={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, fill: '#94A3B8' }}
            stroke="#64748B"
          />
          <YAxis
            tick={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, fill: '#94A3B8' }}
            tickFormatter={(v) => `₹${v}`}
            stroke="#64748B"
          />
          <Tooltip
            contentStyle={{
              background: '#0B0F17',
              color: '#FFFFFF',
              border: '2px solid #334155',
              fontFamily: 'var(--font-mono)',
              fontWeight: 800,
              fontSize: '0.75rem',
            }}
            formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`}
          />
          <Legend
            wrapperStyle={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
              fontWeight: 800,
            }}
          />
          <Line
            type="step"
            dataKey="income"
            stroke="#10B981"
            name="INFLOW (+)"
            strokeWidth={2.5}
            dot={{ r: 4, stroke: '#000', strokeWidth: 1.5, fill: '#10B981' }}
          />
          <Line
            type="step"
            dataKey="expenses"
            stroke="#EF4444"
            name="OUTFLOW (-)"
            strokeWidth={2.5}
            dot={{ r: 4, stroke: '#000', strokeWidth: 1.5, fill: '#EF4444' }}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}
