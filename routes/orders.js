import express from 'express';
import db from '../config/db.js';

const router = express.Router();

// GET all orders for a user
router.get('/user/:userId', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM orders WHERE userid = ?', [req.params.userId]);
        res.json(rows);
    } catch (err) {
        console.error('Error fetching orders:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// GET order details by orderId
router.get('/details/:orderId', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM odetails WHERE ono = ?', [req.params.orderId]);
        res.json(rows);
    } catch (err) {
        console.error('Error fetching order details:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// POST create a new order
router.post('/', async (req, res) => {
    const { userId, cartItems } = req.body;
    try {
        // Fetch user address
        const [user] = await db.query('SELECT address, city, zip FROM members WHERE userid = ?', [userId]);
        if (user.length === 0) {
            console.error('User not found');
            return res.status(400).json({ error: 'User not found' });
        }
        const { address, city, zip } = user[0];

        // Create a new order
        const [result] = await db.query('INSERT INTO orders (userid, created, shipAddress, shipCity, shipZip) VALUES (?, NOW(), ?, ?, ?)', [userId, address, city, zip]);
        const orderId = result.insertId;

        console.log(`Order created with ID: ${orderId}`);

        // Insert order details
        for (const item of cartItems) {
            const amount = item.qty * item.price;
            console.log(`Inserting order detail: Order ID: ${orderId}, ISBN: ${item.isbn}, Quantity: ${item.qty}, Amount: ${amount}`);
            await db.query('INSERT INTO odetails (ono, isbn, qty, amount) VALUES (?, ?, ?, ?)', [orderId, item.isbn, item.qty, amount]);
            console.log(`Inserted order detail: Order ID: ${orderId}, ISBN: ${item.isbn}, Quantity: ${item.qty}, Amount: ${amount}`);
        }

        // Clear the user's cart
        await db.query('DELETE FROM cart WHERE userid = ?', [userId]);

        res.status(201).json({ message: 'Order created', orderId });
    } catch (err) {
        console.error('Error creating order:', err.message);
        res.status(500).json({ error: err.message });
    }
});

export default router;