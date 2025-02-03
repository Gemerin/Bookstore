import express from 'express';
import db from '../config/db.js';

const router = express.Router();

/* GET users listing. */
router.get('/', async (req, res) => {
  const query = `SELECT * FROM members`;
  try {
    const [results] = await db.query(query);
    res.status(200).json(results);
  } catch (err) {
    console.error('Error fetching members:', err.message);
    res.status(500).json({ error: 'Failed to fetch members' });
  }
});


// GET user details by userId
router.get('/:userId', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM members WHERE userid = ?', [req.params.userId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching user details:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Handle login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await db.query('SELECT * FROM Members WHERE email = ? AND password = ?', [email, password]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = rows[0];
    res.status(200).json({ userId: user.userid, message: 'Login successful' });
  } catch (err) {
    console.error('Error during login:', err.message);
    res.status(500).json({ error: err.message });
  }
});


// Handle registration
router.post('/register', async (req, res) => {
  const { fname, lname, address, city, zip, phone, email, password } = req.body;
  const query = `INSERT INTO members (fname, lname, address, city, zip, phone, email, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

  try {
    const [results] = await db.query(query, [fname, lname, address, city, zip, phone || null, email, password]);
    res.status(201).json({ message: 'User registered successfully', userId: results.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Email already exists' });
    }
    console.error('Error inserting member:', err.message);
    res.status(500).json({ error: 'Failed to insert member' });
  }
});


export default router;