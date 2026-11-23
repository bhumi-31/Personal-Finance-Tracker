import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import pool from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seed() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // ── Run schema SQL ──────────────────────────────────────────────
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
    await client.query(schemaSql);
    console.log('✅ Schema created successfully');

    // ── Create demo users ───────────────────────────────────────────
    const users = [
      { email: 'admin@demo.com', password: 'admin123', name: 'Admin User', role: 'admin' },
      { email: 'user@demo.com', password: 'user123', name: 'Demo User', role: 'user' },
      { email: 'readonly@demo.com', password: 'readonly123', name: 'Read Only User', role: 'read-only' },
      { email: 'admin@financetracker.com', password: 'Admin@123', name: 'System Admin', role: 'admin' },
      { email: 'user@financetracker.com', password: 'User@123', name: 'Standard User', role: 'user' },
      { email: 'readonly@financetracker.com', password: 'Readonly@123', name: 'Read Only Auditor', role: 'read-only' },
    ];

    const userIds = [];
    for (const u of users) {
      const hash = await bcrypt.hash(u.password, 12);
      const result = await client.query(
        `INSERT INTO users (email, password_hash, name, role)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (email) DO UPDATE SET password_hash = $2, name = $3, role = $4
         RETURNING id`,
        [u.email, hash, u.name, u.role]
      );
      userIds.push(result.rows[0].id);
      console.log(`✅ User created: ${u.email} (${u.role})`);
    }

    // ── Fetch categories ────────────────────────────────────────────
    const catResult = await client.query('SELECT id, name, type FROM categories');
    const categories = catResult.rows;
    const expenseCats = categories.filter((c) => c.type === 'expense');
    const incomeCats = categories.filter((c) => c.type === 'income');

    // ── Helper to generate random date in the past 6 months ────────
    function randomDate() {
      const now = new Date();
      const past = new Date(now);
      past.setMonth(past.getMonth() - 6);
      const diff = now.getTime() - past.getTime();
      const rand = new Date(past.getTime() + Math.random() * diff);
      return rand.toISOString().split('T')[0];
    }

    function randomAmount(min, max) {
      return (Math.random() * (max - min) + min).toFixed(2);
    }

    function pick(arr) {
      return arr[Math.floor(Math.random() * arr.length)];
    }

    // ── Create ~30 sample transactions ──────────────────────────────
    const descriptions = {
      Food: ['Grocery shopping', 'Restaurant dinner', 'Coffee shop', 'Lunch takeout'],
      Transport: ['Uber ride', 'Gas refill', 'Metro pass', 'Parking fee'],
      Entertainment: ['Movie tickets', 'Netflix subscription', 'Concert tickets', 'Gaming'],
      Shopping: ['New shoes', 'Electronics', 'Clothing', 'Home decor'],
      Healthcare: ['Doctor visit', 'Pharmacy', 'Gym membership', 'Dental checkup'],
      Education: ['Online course', 'Books', 'Workshop fee', 'Certification exam'],
      Utilities: ['Electricity bill', 'Water bill', 'Internet bill', 'Phone bill'],
      Salary: ['Monthly salary', 'Bonus payment'],
      Freelance: ['Web development project', 'Design work', 'Consulting fee'],
      Investment: ['Stock dividends', 'Interest income', 'Crypto gains'],
      Rent: ['Monthly rent', 'Maintenance fee'],
      Other: ['Miscellaneous', 'Gift', 'Donation'],
    };

    // Clear existing transactions for idempotent seeding
    await client.query('DELETE FROM transactions WHERE user_id = ANY($1)', [userIds]);

    let txCount = 0;
    // Spread transactions across all three users (admin, user, and read-only)
    for (let i = 0; i < 45; i++) {
      const userId = i < 15 ? userIds[0] : i < 30 ? userIds[1] : userIds[2];
      const isIncome = Math.random() < 0.3;
      const cat = isIncome ? pick(incomeCats) : pick(expenseCats);
      const amount = isIncome ? randomAmount(1000, 8000) : randomAmount(10, 500);
      const desc = pick(descriptions[cat.name] || ['Transaction']);
      const date = randomDate();

      await client.query(
        `INSERT INTO transactions (user_id, category_id, type, amount, description, date)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [userId, cat.id, cat.type, amount, desc, date]
      );
      txCount++;
    }

    console.log(`✅ Created ${txCount} sample transactions`);

    await client.query('COMMIT');
    console.log('\n🎉 Seed completed successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seed failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
