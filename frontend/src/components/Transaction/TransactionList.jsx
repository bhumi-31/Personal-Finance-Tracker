import React, { useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';

export default function TransactionList({
  transactions,
  onEdit,
  onDelete,
  canModify,
  height = 500,
}) {
  const Row = useCallback(
    ({ index, style }) => {
      const tx = transactions[index];
      if (!tx) return null;

      const dateStr = new Date(tx.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

      // Backend returns category_name and category_icon
      const categoryLabel = tx.category_icon
        ? `${tx.category_icon} ${tx.category_name}`
        : tx.category_name || tx.category || '—';

      return (
        <div
          className={`tx-row ${index % 2 === 0 ? 'tx-row-even' : 'tx-row-odd'}`}
          style={style}
        >
          <div className="tx-cell tx-date">{dateStr}</div>
          <div className="tx-cell tx-desc" title={tx.description}>
            {tx.description}
          </div>
          <div className="tx-cell tx-category">{categoryLabel}</div>
          <div className="tx-cell tx-type">
            <span className={`badge badge-${tx.type}`}>{tx.type}</span>
          </div>
          <div
            className={`tx-cell tx-amount ${
              tx.type === 'income' ? 'amount-income' : 'amount-expense'
            }`}
          >
            {tx.type === 'income' ? '+' : '-'}₹
            {Number(tx.amount).toLocaleString('en-IN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
          {canModify && (
            <div className="tx-cell tx-actions">
              <button
                className="btn btn-sm btn-outline"
                onClick={() => onEdit(tx)}
                title="Edit"
              >
                ✏️
              </button>
              <button
                className="btn btn-sm btn-danger"
                onClick={() => onDelete(tx.id)}
                title="Delete"
              >
                🗑️
              </button>
            </div>
          )}
        </div>
      );
    },
    [transactions, onEdit, onDelete, canModify]
  );

  if (!transactions || transactions.length === 0) {
    return (
      <div className="empty-state">
        <p>No transactions found</p>
      </div>
    );
  }

  return (
    <div className="transaction-list">
      <div className="tx-header">
        <div className="tx-cell tx-date">Date</div>
        <div className="tx-cell tx-desc">Description</div>
        <div className="tx-cell tx-category">Category</div>
        <div className="tx-cell tx-type">Type</div>
        <div className="tx-cell tx-amount">Amount</div>
        {canModify && <div className="tx-cell tx-actions">Actions</div>}
      </div>
      <List
        height={height}
        itemCount={transactions.length}
        itemSize={56}
        width="100%"
      >
        {Row}
      </List>
    </div>
  );
}
