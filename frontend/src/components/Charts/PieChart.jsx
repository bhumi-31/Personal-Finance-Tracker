import React from 'react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = [
  '#FFB800', '#10B981', '#F43F5E', '#0284C7', '#8B5CF6',
  '#F59E0B', '#14B8A6', '#EC4899', '#6366F1', '#64748B',
];

export default function PieChartComponent({ data, title }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>
        [ NO CATEGORICAL EXPENSE DATA RECORDED ]
      </div>
    );
  }

  return (
    <div>
      {title && <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 900, marginBottom: '12px' }}>{title}</h3>}
      <ResponsiveContainer width="100%" height={280}>
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={95}
            paddingAngle={3}
            dataKey="value"
            nameKey="name"
            stroke="#000000"
            strokeWidth={1.5}
            label={({ name, percent }) =>
              `${name} ${(percent * 100).toFixed(0)}%`
            }
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
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
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}
