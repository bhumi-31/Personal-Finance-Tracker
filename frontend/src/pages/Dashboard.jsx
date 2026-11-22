import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { analyticsService } from '../services/analyticsService';
import PieChartComponent from '../components/Charts/PieChart';
import LineChartComponent from '../components/Charts/LineChart';
import BarChartComponent from '../components/Charts/BarChart';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [trendsData, setTrendsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState('');

  const params = useMemo(() => {
    const p = { year };
    if (month) p.month = month;
    return p;
  }, [year, month]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [summaryRes, categoryRes, trendsRes] = await Promise.all([
        analyticsService.getSummary(params),
        analyticsService.getCategoryBreakdown(params),
        analyticsService.getTrends(params),
      ]);

      setSummary(summaryRes.data);
      setCategoryData(categoryRes.data);
      setTrendsData(trendsRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
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
      { label: 'Total Income', value: totalIncome, icon: '📈', color: '#10b981' },
      { label: 'Total Expenses', value: totalExpenses, icon: '📉', color: '#f43f5e' },
      { label: 'Balance', value: balance, icon: '💰', color: balance >= 0 ? '#10b981' : '#f43f5e' },
      { label: 'Transactions', value: count, icon: '📋', color: '#6366f1', isCount: true },
    ];
  }, [summary]);

  const pieData = useMemo(() => {
    if (!categoryData || !Array.isArray(categoryData)) return [];
    return categoryData.map((item) => ({
      name: item.category || item._id || item.name,
      value: item.total || item.amount || item.value || 0,
    }));
  }, [categoryData]);

  const chartTrends = useMemo(() => {
    if (!trendsData || !Array.isArray(trendsData)) return [];
    return trendsData.map((item) => ({
      month: item.month || item._id || item.label,
      income: item.income || 0,
      expenses: item.expenses || item.expense || 0,
    }));
  }, [trendsData]);

  const handleYearChange = useCallback((e) => {
    setYear(Number(e.target.value));
  }, []);

  const handleMonthChange = useCallback((e) => {
    setMonth(e.target.value);
  }, []);

  if (loading) {
    return (
      <div className="page-loading">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-error">
        <div className="alert alert-error">{error}</div>
        <button className="btn btn-primary" onClick={fetchData}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1>Dashboard</h1>
        <div className="filter-bar">
          <select value={year} onChange={handleYearChange} className="filter-select">
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <select value={month} onChange={handleMonthChange} className="filter-select">
            <option value="">All Months</option>
            {[
              'January', 'February', 'March', 'April', 'May', 'June',
              'July', 'August', 'September', 'October', 'November', 'December',
            ].map((m, i) => (
              <option key={m} value={i + 1}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="summary-cards">
        {summaryCards.map((card) => (
          <div key={card.label} className="summary-card">
            <div className="summary-card-icon">{card.icon}</div>
            <div className="summary-card-content">
              <p className="summary-card-label">{card.label}</p>
              <p className="summary-card-value" style={{ color: card.color }}>
                {card.isCount
                  ? card.value.toLocaleString()
                  : `$${Number(card.value).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <PieChartComponent data={pieData} title="Category Breakdown" />
        </div>
        <div className="chart-card">
          <LineChartComponent data={chartTrends} title="Monthly Trends" />
        </div>
        <div className="chart-card chart-card-full">
          <BarChartComponent data={chartTrends} title="Income vs Expenses" />
        </div>
      </div>
    </div>
  );
}
