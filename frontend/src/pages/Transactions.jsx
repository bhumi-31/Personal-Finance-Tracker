import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { transactionService } from '../services/transactionService';
import TransactionList from '../components/Transaction/TransactionList';
import TransactionForm from '../components/Transaction/TransactionForm';
import Modal from '../components/common/Modal';

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

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [search]);

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
      setTransactions(data.transactions || []);
      setTotalPages(data.pagination?.totalPages ?? data.totalPages ?? 1);
      setTotal(data.pagination?.total ?? data.total ?? 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch ledger rows');
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
      if (!window.confirm('CONFIRM PURGE: Delete this transaction record from ledger?')) return;
      try {
        await transactionService.deleteTransaction(id);
        fetchTransactions();
      } catch (err) {
        setError(err.response?.data?.message || 'Purge operation failed');
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

  return (
    <div>
      {/* Engine Banner (Matching Image 2) */}
      <div className="engine-banner">
        <div className="engine-banner-info">
          <h1>TRANSACTION LEDGER & SETTLEMENT ENGINE</h1>
          <p>
            REPOSITORY MATRIX // TOTAL RECORDS: {total} // STATUS:{' '}
            {canModify ? 'WRITE-ENABLED' : 'READ-ONLY ACCESS'}
          </p>
        </div>

        <div>
          {canModify ? (
            <button className="btn-forge" onClick={handleAdd}>
              + CREATE TRANSACTION
            </button>
          ) : (
            <span className="status-pill status-readonly">
              [ACCESS: VIEW_ONLY]
            </span>
          )}
        </div>
      </div>

      {/* Tactical Filter Bar */}
      <div className="filter-bar-forge">
        <input
          type="text"
          placeholder="SEARCH DESCRIPTION // QUERY..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="filter-input-forge"
          style={{ minWidth: '220px' }}
        />
        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setPage(1);
          }}
          className="filter-select-forge"
        >
          <option value="">[ALL TYPES]</option>
          <option value="income">TYPE: INFLOW (+)</option>
          <option value="expense">TYPE: OUTFLOW (-)</option>
        </select>
        <input
          type="date"
          value={startDate}
          onChange={(e) => {
            setStartDate(e.target.value);
            setPage(1);
          }}
          className="filter-input-forge"
          title="START DATE"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => {
            setEndDate(e.target.value);
            setPage(1);
          }}
          className="filter-input-forge"
          title="END DATE"
        />
        {(search || typeFilter || startDate || endDate) && (
          <button
            className="btn-forge btn-forge-sm btn-forge-white"
            onClick={() => {
              setSearch('');
              setTypeFilter('');
              setStartDate('');
              setEndDate('');
              setPage(1);
            }}
          >
            [CLEAR]
          </button>
        )}
      </div>

      {error && <div className="alert-forge alert-forge-error">{error}</div>}

      {/* Transactions Matrix Table (Matching Image 2) */}
      <TransactionList
        transactions={transactions}
        onEdit={handleEdit}
        onDelete={handleDelete}
        canModify={canModify}
      />

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '20px' }}>
          <button
            className="btn-forge btn-forge-sm btn-forge-white"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            ← PREV
          </button>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontWeight: 800,
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            PAGE {page} OF {totalPages}
          </span>
          <button
            className="btn-forge btn-forge-sm btn-forge-white"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            NEXT →
          </button>
        </div>
      )}

      {/* Transaction Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={editingTx ? '★ MODIFY RECORD MATRIX' : '★ INITIALIZE NEW RECORD'}
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
