import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { transactionService } from '../services/transactionService';
import TransactionList from '../components/Transaction/TransactionList';
import TransactionForm from '../components/Transaction/TransactionForm';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function Transactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const debounceTimer = useRef(null);

  const canModify = useMemo(
    () => user?.role === 'admin' || user?.role === 'user',
    [user]
  );

  // Debounce search input
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [search]);

  // Build API params — use backend's snake_case names
  const fetchParams = useMemo(() => {
    const params = { page, limit: 50 };
    if (debouncedSearch) params.search = debouncedSearch;
    if (typeFilter) params.type = typeFilter;
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    return params;
  }, [page, debouncedSearch, typeFilter, startDate, endDate]);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await transactionService.getTransactions(fetchParams);
      const data = res.data;
      // Backend returns: { transactions: [...], pagination: { page, limit, total, totalPages } }
      setTransactions(data.transactions || []);
      setTotalPages(data.pagination?.totalPages ?? data.totalPages ?? 1);
      setTotal(data.pagination?.total ?? data.total ?? 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [fetchParams]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleAdd = useCallback(() => {
    setEditingTx(null);
    setModalOpen(true);
  }, []);

  const handleEdit = useCallback((tx) => {
    setEditingTx(tx);
    setModalOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (id) => {
      if (!window.confirm('Are you sure you want to delete this transaction?')) return;
      try {
        await transactionService.deleteTransaction(id);
        fetchTransactions();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete transaction');
      }
    },
    [fetchTransactions]
  );

  const handleFormSubmit = useCallback(
    async (data) => {
      if (editingTx) {
        await transactionService.updateTransaction(editingTx.id, data);
      } else {
        await transactionService.createTransaction(data);
      }
      setModalOpen(false);
      setEditingTx(null);
      fetchTransactions();
    },
    [editingTx, fetchTransactions]
  );

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setEditingTx(null);
  }, []);

  const handleTypeChange = useCallback((e) => {
    setTypeFilter(e.target.value);
    setPage(1);
  }, []);

  const handleStartDateChange = useCallback((e) => {
    setStartDate(e.target.value);
    setPage(1);
  }, []);

  const handleEndDateChange = useCallback((e) => {
    setEndDate(e.target.value);
    setPage(1);
  }, []);

  return (
    <div className="transactions-page">
      <div className="page-header">
        <h1>Transactions</h1>
        {canModify && (
          <button className="btn btn-primary" onClick={handleAdd}>
            + Add Transaction
          </button>
        )}
        {!canModify && (
          <span className="badge badge-readonly" title="Read-only access">
            👁 View Only
          </span>
        )}
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search description…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="filter-input"
        />
        <select value={typeFilter} onChange={handleTypeChange} className="filter-select">
          <option value="">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <input
          type="date"
          value={startDate}
          onChange={handleStartDateChange}
          className="filter-input"
          title="From date"
        />
        <input
          type="date"
          value={endDate}
          onChange={handleEndDateChange}
          className="filter-input"
          title="To date"
        />
        {(search || typeFilter || startDate || endDate) && (
          <button
            className="btn btn-outline btn-sm"
            onClick={() => {
              setSearch('');
              setTypeFilter('');
              setStartDate('');
              setEndDate('');
              setPage(1);
            }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="page-loading">
          <LoadingSpinner size="large" />
        </div>
      ) : (
        <>
          <div className="result-meta">
            {total > 0 && (
              <span className="text-muted">
                Showing {transactions.length} of {total} transaction{total !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          <TransactionList
            transactions={transactions}
            onEdit={handleEdit}
            onDelete={handleDelete}
            canModify={canModify}
            height={520}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                ← Prev
              </button>
              <span className="pagination-info">
                Page {page} of {totalPages}
              </span>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={editingTx ? 'Edit Transaction' : 'Add Transaction'}
      >
        <TransactionForm
          transaction={editingTx}
          onSubmit={handleFormSubmit}
          onCancel={handleCloseModal}
          readOnly={!canModify}
        />
      </Modal>
    </div>
  );
}
