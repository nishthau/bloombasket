const express = require('express');
const bodyParser = require('body-parser');
const db = require('./server/database');

const app = express();
app.use(bodyParser.json());

// Endpoint to handle checkout
app.post('/checkout', (req, res) => {
    const { name, phone, address, cartItems } = req.body;

    // Insert customer details into the Customers table
    db.run(`INSERT INTO customers (name, phone, address) VALUES (?, ?, ?)`, [name, phone, address], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        const customerId = this.lastID;

        // Insert each cart item into the Orders table
        const stmt = db.prepare(`INSERT INTO orders (customer_id, product_name, quantity, subtotal) VALUES (?, ?, ?, ?)`);
        cartItems.forEach(item => {
            stmt.run(customerId, item.productName, item.quantity, item.subtotal);
        });
        stmt.finalize();

        res.json({ message: 'Order placed successfully!' });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
