import React from 'react';

export default function TransactionList({
  transactions,
  onEdit,
  onDelete,
  canModify,
}) {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="matrix-table-container">
        <div className="matrix-table-header-bar">
          <span>★ ACTIVE TRANSACTIONS MATRIX</span>
          <span>[ 0 RECORDS FOUND ]</span>
        </div>
        <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>
          [ NO TRANSACTIONS REGISTERED IN THIS TIMEFRAME ]
        </div>
      </div>
    );
  }

  return (
    <div className="matrix-table-container">
      {/* Top Black Bar (Matching Image 2) */}
      <div className="matrix-table-header-bar">
        <span>★ ACTIVE TRANSACTIONS MATRIX</span>
        <span>[ {transactions.length} ITEMS LOADED ]</span>
      </div>

      <table className="matrix-table">
        <thead>
          <tr>
            <th>DATE</th>
            <th>DESCRIPTION</th>
            <th>CATEGORY</th>
            <th>TYPE</th>
            <th>AMOUNT</th>
            {canModify && <th style={{ textAlign: 'right' }}>ACTIONS</th>}
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => {
            const dateStr = new Date(tx.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: '2-digit',
            });

            const categoryTag = (tx.category_name || tx.category || 'GENERAL').toUpperCase();

            return (
              <tr key={tx.id}>
                <td style={{ fontWeight: 800 }}>{dateStr}</td>
                <td style={{ fontWeight: 700 }}>{tx.description}</td>
                <td>
                  <span className="tag-category">
                    [{categoryTag}]
                  </span>
                </td>
                <td>
                  <span
                    className={`badge-matrix ${
                      tx.type === 'income' ? 'badge-income' : 'badge-expense'
                    }`}
                  >
                    {tx.type === 'income' ? '✓ INFLOW' : '• OUTFLOW'}
                  </span>
                </td>
                <td
                  style={{
                    fontWeight: 900,
                    color: tx.type === 'income' ? '#065F46' : '#991B1B',
                  }}
                >
                  {tx.type === 'income' ? '+' : '-'}₹
                  {Number(tx.amount).toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
                {canModify && (
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button
                        className="btn-forge btn-forge-sm btn-forge-white"
                        onClick={() => onEdit(tx)}
                      >
                        EDIT
                      </button>
                      <button
                        className="btn-forge btn-forge-sm btn-forge-danger"
                        onClick={() => onDelete(tx.id)}
                      >
                        DEL
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
