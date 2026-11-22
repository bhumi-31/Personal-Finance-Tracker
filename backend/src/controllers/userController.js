import pool from '../config/db.js';

export const getUsers = async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT id, email, name, role, created_at, updated_at FROM users ORDER BY created_at DESC'
    );
    res.json({ users: result.rows });
  } catch (err) {
    next(err);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Prevent admin from changing their own role
    if (id === req.user.id) {
      return res.status(400).json({ message: 'Cannot change your own role' });
    }

    const result = await pool.query(
      `UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2
       RETURNING id, email, name, role, updated_at`,
      [role, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Role updated', user: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

