import api from './api';

export const userService = {
  getUsers() {
    return api.get('/users');
  },

  updateRole(userId, role) {
    return api.patch(`/users/${userId}/role`, { role });
  },
};
