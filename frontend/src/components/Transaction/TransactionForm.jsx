import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../../services/api';

const initialFormState = {
  type: 'expense',
  category_id: '',
  amount: '',
  description: '',
  date: new Date().toISOString().split('T')[0],
};

export default function TransactionForm({ transaction, onSubmit, onCancel, readOnly }) {
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    setCategoriesLoading(true);
    api.get('/categories')
      .then((res) => setCategories(res.data.categories || []))
      .catch(() => setCategories([]))
      .finally(() => setCategoriesLoading(false));
  }, []);

  const filteredCategories = useMemo(
    () => categories.filter((c) => c.type === formData.type),
    [categories, formData.type]
  );

  useEffect(() => {
    if (transaction) {
      setFormData({
        type: transaction.type || 'expense',
        category_id: transaction.category_id?.toString() || '',
        amount: transaction.amount?.toString() || '',
        description: transaction.description || '',
        date: transaction.date
          ? new Date(transaction.date).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
      });
    } else {
      setFormData(initialFormState);
    }
  }, [transaction]);

  const handleTypeChange = useCallback((e) => {
    setFormData((prev) => ({ ...prev, type: e.target.value, category_id: '' }));
    setErrors((prev) => ({ ...prev, type: '', category_id: '' }));
  }, []);

  const validate = useCallback(() => {
    const newErrors = {};
    if (!formData.type) newErrors.type = 'Flow type required';
    if (!formData.category_id) newErrors.category_id = 'Category allocation required';
    if (!formData.amount || isNaN(formData.amount) || Number(formData.amount) <= 0) {
      newErrors.amount = 'Positive numerical amount required';
    }
    if (!formData.description.trim()) newErrors.description = 'Description label required';
    if (!formData.date) newErrors.date = 'Timestamp date required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!validate()) return;
      setSubmitting(true);
      try {
        await onSubmit({
          type: formData.type,
          category_id: parseInt(formData.category_id, 10),
          amount: Number(formData.amount),
          description: formData.description.trim(),
          date: formData.date,
        });
      } catch (err) {
        setErrors({ submit: err.response?.data?.message || 'Failed to commit transaction' });
      } finally {
        setSubmitting(false);
      }
    },
    [formData, validate, onSubmit]
  );

  return (
    <form onSubmit={handleSubmit}>
      {errors.submit && <div className="alert-forge alert-forge-error">{errors.submit}</div>}

      <div className="auth-form-group">
        <label className="auth-form-label">FLOW TYPE</label>
        <select
          name="type"
          value={formData.type}
          onChange={handleTypeChange}
          disabled={readOnly}
          className="auth-form-input"
        >
          <option value="expense">OUTFLOW (-) // EXPENSE</option>
          <option value="income">INFLOW (+) // REVENUE</option>
        </select>
        {errors.type && <span style={{ color: 'red', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>{errors.type}</span>}
      </div>

      <div className="auth-form-group">
        <label className="auth-form-label">CATEGORY ALLOCATION</label>
        <select
          name="category_id"
          value={formData.category_id}
          onChange={handleChange}
          disabled={readOnly || categoriesLoading}
          className="auth-form-input"
        >
          <option value="">
            {categoriesLoading ? '[LOADING CATEGORIES...]' : '[SELECT CATEGORY]'}
          </option>
          {filteredCategories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              [{cat.name.toUpperCase()}]
            </option>
          ))}
        </select>
        {errors.category_id && <span style={{ color: 'red', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>{errors.category_id}</span>}
      </div>

      <div className="auth-form-group">
        <label className="auth-form-label">AMOUNT (₹)</label>
        <input
          name="amount"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          value={formData.amount}
          onChange={handleChange}
          disabled={readOnly}
          className="auth-form-input"
        />
        {errors.amount && <span style={{ color: 'red', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>{errors.amount}</span>}
      </div>

      <div className="auth-form-group">
        <label className="auth-form-label">RECORD DESCRIPTION</label>
        <input
          name="description"
          type="text"
          placeholder="ENTER TRANSACTION MEMO"
          value={formData.description}
          onChange={handleChange}
          disabled={readOnly}
          className="auth-form-input"
        />
        {errors.description && <span style={{ color: 'red', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>{errors.description}</span>}
      </div>

      <div className="auth-form-group">
        <label className="auth-form-label">TRANSACTION DATE</label>
        <input
          name="date"
          type="date"
          value={formData.date}
          onChange={handleChange}
          disabled={readOnly}
          className="auth-form-input"
        />
        {errors.date && <span style={{ color: 'red', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>{errors.date}</span>}
      </div>

      {!readOnly && (
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button type="submit" className="btn-forge" disabled={submitting}>
            {submitting ? 'COMMITTING...' : transaction ? 'UPDATE RECORD' : '+ COMMIT RECORD'}
          </button>
          <button type="button" className="btn-forge btn-forge-white" onClick={onCancel}>
            DISCARD
          </button>
        </div>
      )}
    </form>
  );
}
