import express from 'express';
import db from '../config/db.js';

const router = express.Router();

// Get cart items for a user
router.get('/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const [cartItems] = await db.query(`
            SELECT c.isbn, b.title, b.price, c.qty
            FROM cart c
            JOIN books b ON c.isbn = b.isbn
            WHERE c.userid = ?
        `, [userId]);

        res.json(cartItems);
    } catch (err) {
        console.error('Error fetching cart items:', err.message);
        res.status(500).json({ error: 'Failed to fetch cart items' });
    }
});

// Add book to cart
router.post('/add', async (req, res) => {
    const { userId, isbn, qty } = req.body;

    try {
        // Check if the book exists in the books table
        const [book] = await db.query('SELECT * FROM books WHERE isbn = ?', [isbn]);
        if (book.length === 0) {
            return res.status(400).json({ error: 'ISBN does not exist in books table' });
        }
        // Check if the book already exists in the cart
        const [existingCartItem] = await db.query('SELECT * FROM cart WHERE userid = ? AND isbn = ?', [userId, isbn]);

        let updatedQty;
        if (existingCartItem.length > 0) {
            // Update the quantity if the book already exists in the cart
            await db.query('UPDATE cart SET qty = qty + ? WHERE userid = ? AND isbn = ?', [qty, userId, isbn]);
            updatedQty = existingCartItem[0].qty + qty;
        } else {
            // Add the book to the cart if it does not exist
            await db.query('INSERT INTO cart (userid, isbn, qty) VALUES (?, ?, ?)', [userId, isbn, qty]);
            updatedQty = qty;

        }

        res.status(200).json({ message: 'Book added to cart successfully', qty: updatedQty });
    } catch (err) {
        console.error('Error adding book to cart:', err.message);
        res.status(500).json({ error: 'Failed to add book to cart' });
    }
});

export default router; 