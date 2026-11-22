import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { analyticsService } from '../services/analyticsService';
import PieChartComponent from '../components/Charts/PieChart';
import LineChartComponent from '../components/Charts/LineChart';
import BarChartComponent from '../components/Charts/BarChart';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [trendsData, setTrendsData] = useState([]);
  const [cacheStats, setCacheStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');

  const params = useMemo(() => {
    const p = {};
    if (year) p.year = year;
    if (month) p.month = month;
    return p;
  }, [year, month]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [summaryRes, categoryRes, trendsRes, cacheRes] = await Promise.all([
        analyticsService.getSummary(params),
        analyticsService.getCategoryBreakdown(params),
        analyticsService.getTrends(params),
        analyticsService.getCacheStats(),
      ]);

      setSummary(summaryRes.data);
      setCategoryData(categoryRes.data?.breakdown || categoryRes.data || []);
      setTrendsData(trendsRes.data?.trends || trendsRes.data || []);
      setCacheStats(cacheRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load telemetry data');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const summaryCards = useMemo(() => {
    if (!summary) return [];
    const totalIncome = summary.totalIncome ?? summary.income ?? 0;
    const totalExpenses = summary.totalExpenses ?? summary.expenses ?? 0;
    const balance = summary.balance ?? totalIncome - totalExpenses;
    const count = summary.transactionCount ?? summary.count ?? 0;

    return [
      { label: 'TOTAL INFLOW', value: totalIncome, glyph: '▲', colorClass: 'metric-income' },
      { label: 'TOTAL OUTFLOW', value: totalExpenses, glyph: '▼', colorClass: 'metric-expense' },
      { label: 'NET LIQUIDITY', value: balance, glyph: '■', colorClass: 'metric-balance' },
      { label: 'RECORD COUNT', value: count, glyph: '●', isCount: true },
    ];
  }, [summary]);

  const pieData = useMemo(() => {
    const list = Array.isArray(categoryData) ? categoryData : (categoryData?.breakdown || []);
    return list
      .filter((item) => (item.category_type || item.type || 'expense') === 'expense')
      .map((item) => ({
        name: `[${(item.category_name || item.name || 'OTHER').toUpperCase()}]`,
        value: Number(item.total || item.amount || 0),
      }))
      .filter((item) => item.value > 0);
  }, [categoryData]);

  const chartTrends = useMemo(() => {
    const list = Array.isArray(trendsData) ? trendsData : (trendsData?.trends || []);
    return list.map((item) => ({
      month: item.month || item.label || '',
      income: Number(item.income || 0),
      expenses: Number(item.expenses || item.expense || 0),
    }));
  }, [trendsData]);

  const handleYearChange = useCallback((e) => {
    setYear(e.target.value ? Number(e.target.value) : '');
  }, []);

  const handleMonthChange = useCallback((e) => {
    setMonth(e.target.value ? Number(e.target.value) : '');
  }, []);

  return (
    <div>
      {/* Engine Banner */}
      <div className="engine-banner">
        <div className="engine-banner-info">
          <h1>FINANCIAL ANALYTICS & COMPUTATION ENGINE</h1>
          <p>
            TELEMETRY REPOSITORY // STATUS: REAL-TIME LEDGER SYNC // TIMEFRAME:{' '}
            {year ? year : 'ALL-TIME'} {month ? `M${month}` : ''}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <select
            value={year}
            onChange={handleYearChange}
            className="filter-select-forge"
          >
            <option value="">[ALL YEARS]</option>
            {[2026, 2025, 2024, 2023].map((y) => (
              <option key={y} value={y}>
                YEAR: {y}
              </option>
            ))}
          </select>
          <select
            value={month}
            onChange={handleMonthChange}
            className="filter-select-forge"
          >
            <option value="">[ALL MONTHS]</option>
            {[
              '01 - JAN', '02 - FEB', '03 - MAR', '04 - APR', '05 - MAY', '06 - JUN',
              '07 - JUL', '08 - AUG', '09 - SEP', '10 - OCT', '11 - NOV', '12 - DEC',
            ].map((m, i) => (
              <option key={m} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="alert-forge alert-forge-error">{error}</div>}

      {/* Redis Cache Performance Telemetry Bar (Deliverable Requirement) */}
      <div className="retro-window" style={{ marginBottom: '24px' }}>
        <div className="retro-window-header" style={{ background: '#111827' }}>
          <div className="retro-window-title">
            ★ REDIS CACHE PERFORMANCE TELEMETRY
          </div>
          <div className="retro-window-controls">
            [ STATUS: {cacheStats?.connected ? 'CONNECTED (PORT 6379)' : 'INACTIVE'} ]
          </div>
        </div>
        <div
          style={{
            background: '#F9FAFB',
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.78rem',
            fontWeight: 800,
          }}
        >
          <div>
            <span>HIT RATE: </span>
            <span style={{ color: '#047857', fontSize: '0.9rem' }}>
              {cacheStats?.hitRate || 'N/A'}
            </span>
          </div>
          <div>
            <span>CACHE HITS: </span>
            <span style={{ color: '#047857' }}>{cacheStats?.hits ?? 0}</span>
          </div>
          <div>
            <span>CACHE MISSES: </span>
            <span style={{ color: '#B91C1C' }}>{cacheStats?.misses ?? 0}</span>
          </div>
          <div>
            <span>TOTAL QUERIES: </span>
            <span>{cacheStats?.total ?? 0}</span>
          </div>
          <div>
            <span>CACHE TTL: </span>
            <span style={{ color: '#4B5563' }}>[ANALYTICS: 15M] // [CATEGORIES: 1H]</span>
          </div>
        </div>
      </div>

      {/* Metric Blocks / Summary Cards */}
      <div className="summary-cards-forge">
        {summaryCards.map((card) => (
          <div key={card.label} className="metric-block">
            <div className="metric-header">
              <span className="metric-label">{card.label}</span>
              <span className="metric-glyph">{card.glyph}</span>
            </div>
            <div className={`metric-value ${card.colorClass || ''}`}>
              {card.isCount
                ? card.value.toLocaleString()
                : `₹${Number(card.value).toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`}
            </div>
          </div>
        ))}
      </div>

      {/* Retro Window Chart Grid */}
      <div className="charts-grid-forge">
        <div className="retro-window">
          <div className="retro-window-header">
            <div className="retro-window-title">
              ★ EXPENSE CATEGORY DISTRIBUTION MATRIX
            </div>
            <div className="retro-window-controls">[ - ] [ × ]</div>
          </div>
          <div className="retro-window-body">
            <PieChartComponent data={pieData} />
          </div>
        </div>

        <div className="retro-window">
          <div className="retro-window-header">
            <div className="retro-window-title">
              ★ 12-MONTH CASH FLOW TRENDS
            </div>
            <div className="retro-window-controls">[ - ] [ × ]</div>
          </div>
          <div className="retro-window-body">
            <LineChartComponent data={chartTrends} />
          </div>
        </div>

        <div className="retro-window full-width">
          <div className="retro-window-header">
            <div className="retro-window-title">
              ★ COMPARATIVE INFLOW VS OUTFLOW VOLUME
            </div>
            <div className="retro-window-controls">[ - ] [ × ]</div>
          </div>
          <div className="retro-window-body">
            <BarChartComponent data={chartTrends} />
          </div>
        </div>
      </div>
    </div>
  );
}
