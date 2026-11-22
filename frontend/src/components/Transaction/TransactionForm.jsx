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

  // Fetch categories from backend (cached for 1 hour server-side)
  useEffect(() => {
    setCategoriesLoading(true);
    api.get('/categories')
      .then((res) => setCategories(res.data.categories || []))
      .catch(() => setCategories([]))
      .finally(() => setCategoriesLoading(false));
  }, []);

  // Filtered categories based on selected type
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

  // Reset category when type changes (avoid invalid category_id for the new type)
  const handleTypeChange = useCallback((e) => {
    setFormData((prev) => ({ ...prev, type: e.target.value, category_id: '' }));
    setErrors((prev) => ({ ...prev, type: '', category_id: '' }));
  }, []);

  const validate = useCallback(() => {
    const newErrors = {};
    if (!formData.type) newErrors.type = 'Type is required';
    if (!formData.category_id) newErrors.category_id = 'Category is required';
    if (!formData.amount || isNaN(formData.amount) || Number(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be a positive number';
    }
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.date) newErrors.date = 'Date is required';
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
        setErrors({ submit: err.response?.data?.message || 'Failed to save transaction' });
      } finally {
        setSubmitting(false);
      }
    },
    [formData, validate, onSubmit]
  );

  return (
    <form className="transaction-form" onSubmit={handleSubmit}>
      {errors.submit && <div className="alert alert-error">{errors.submit}</div>}

      {/* Type */}
      <div className="form-group">
        <label htmlFor="type">Type</label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={handleTypeChange}
          disabled={readOnly}
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
        {errors.type && <span className="form-error">{errors.type}</span>}
      </div>

      {/* Category — fetched from API */}
      <div className="form-group">
        <label htmlFor="category_id">Category</label>
        <select
          id="category_id"
          name="category_id"
          value={formData.category_id}
          onChange={handleChange}
          disabled={readOnly || categoriesLoading}
        >
          <option value="">
            {categoriesLoading ? 'Loading categories…' : 'Select category'}
          </option>
          {filteredCategories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.icon} {cat.name}
            </option>
          ))}
        </select>
        {errors.category_id && <span className="form-error">{errors.category_id}</span>}
      </div>

      {/* Amount */}
      <div className="form-group">
        <label htmlFor="amount">Amount (₹)</label>
        <input
          id="amount"
          name="amount"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          value={formData.amount}
          onChange={handleChange}
          disabled={readOnly}
        />
        {errors.amount && <span className="form-error">{errors.amount}</span>}
      </div>

      {/* Description */}
      <div className="form-group">
        <label htmlFor="description">Description</label>
        <input
          id="description"
          name="description"
          type="text"
          placeholder="Enter description"
          value={formData.description}
          onChange={handleChange}
          disabled={readOnly}
        />
        {errors.description && <span className="form-error">{errors.description}</span>}
      </div>

      {/* Date */}
      <div className="form-group">
        <label htmlFor="date">Date</label>
        <input
          id="date"
          name="date"
          type="date"
          value={formData.date}
          onChange={handleChange}
          disabled={readOnly}
        />
        {errors.date && <span className="form-error">{errors.date}</span>}
      </div>

      {!readOnly && (
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Saving…' : transaction ? 'Update Transaction' : 'Add Transaction'}
          </button>
          <button type="button" className="btn btn-outline" onClick={onCancel}>
            Cancel
          </button>
        </div>
      )}
    </form>
  );
}
