import express from 'express';
import db from '../config/db.js';

const router = express.Router();

// Get all subjects
router.get('/subjects', async (req, res) => {
    try {
        const [results] = await db.query('SELECT DISTINCT subject FROM books ORDER BY subject');
        const subjects = results.map(row => row.subject);
        res.json(subjects);
    } catch (err) {
        console.error('Error fetching subjects:', err.message);
        res.status(500).json({ error: 'Failed to fetch subjects' });
    }
});

// Get books by subject
router.get('/', async (req, res) => {
    const { subject } = req.query;
    try {
        const [results] = await db.query('SELECT * FROM books WHERE subject = ?', [subject]);
        res.json(results);
    } catch (err) {
        console.error('Error fetching books:', err.message);
        res.status(500).json({ error: 'Failed to fetch books' });
    }
});

// Search by author/title
router.get('/search', async (req, res) => {
    const { author, title } = req.query;

    try {
        let query = 'SELECT * FROM books WHERE ';
        let params = [];

        if (author) {
            query += 'author LIKE ?';
            params.push(`%${author}%`);
        }

        if (title) {
            if (author) query += ' AND ';
            query += 'title LIKE ?';
            params.push(`%${title}%`);
        }

        const [books] = await db.query(query, params);
        res.json(books);
    } catch (err) {
        console.error('Error searching books:', err.message);
        res.status(500).json({ error: 'Failed to search books' });
    }
});

export default router;