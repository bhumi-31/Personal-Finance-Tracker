import React from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function BarChartComponent({ data, title }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>
        [ NO VOLUME DATA LOADED ]
      </div>
    );
  }

  return (
    <div>
      {title && <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 900, marginBottom: '12px' }}>{title}</h3>}
      <ResponsiveContainer width="100%" height={280}>
        <RechartsBarChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="2 2" stroke="#CCCCCC" />
          <XAxis
            dataKey="month"
            tick={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700 }}
            stroke="#000000"
          />
          <YAxis
            tick={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700 }}
            tickFormatter={(v) => `₹${v}`}
            stroke="#000000"
          />
          <Tooltip
            contentStyle={{
              background: '#000000',
              color: '#FFFFFF',
              border: '2px solid #000000',
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
          <Bar
            dataKey="income"
            fill="#10B981"
            stroke="#000000"
            strokeWidth={1.5}
            name="INFLOW (+)"
          />
          <Bar
            dataKey="expenses"
            fill="#EF4444"
            stroke="#000000"
            strokeWidth={1.5}
            name="OUTFLOW (-)"
          />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}
