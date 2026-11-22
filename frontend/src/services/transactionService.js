import api from './api';

export const transactionService = {
  getTransactions(params = {}) {
    return api.get('/transactions', { params });
  },

  getTransaction(id) {
    return api.get(`/transactions/${id}`);
  },

  createTransaction(data) {
    return api.post('/transactions', data);
  },

  updateTransaction(id, data) {
    return api.put(`/transactions/${id}`, data);
  },

  deleteTransaction(id) {
    return api.delete(`/transactions/${id}`);
  },
};
