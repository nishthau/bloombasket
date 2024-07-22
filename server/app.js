const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const xlsx = require('xlsx');
const app = express();
const path = require('path');
const groceries = require('./grocery_list.json');
// const session = require('express-session');
const bcrypt = require('bcrypt');
// const article = require('./Articles.xlsx');

// Initialize SQLite database
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/database.db');

app.use(cors());
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, '..')));

// app.use(session({
//     secret: 'your_secret_key',
//     resave: false,
//     saveUninitialized: true
// }));

// Function to read the Excel file and convert it to JSON
function readExcelFile(filePath) {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);
    return data;
}

app.get('/api/groceries', (req, res) => {
    const filePath = path.join(__dirname, 'Articles.xlsx');
    const groceries = readExcelFile(filePath);
    res.json(groceries);
});



// Create tables if they don't exist
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        phone TEXT,
        address TEXT
    )`);
console.log('Table customers is created');

    db.run(`CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER,
        product_name TEXT,
        quantity INTEGER,
        subtotal REAL,
        FOREIGN KEY (customer_id) REFERENCES customers (id)
    )`);
    console.log('Table orders is created');

    db.run(`CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT
    )`);

    // Insert a default admin user (username: admin, password: admin123)
    bcrypt.hash('admin123', 10, (err, hash) => {
        if (err) throw err;
        db.run(`INSERT OR IGNORE INTO admins (username, password) VALUES (?, ?)`, ['admin', hash]);
    });
});

// Handle admin login
app.post('/admin-login', (req, res) => {
    const { username, password } = req.body;
    db.get(`SELECT * FROM admins WHERE username = ?`, [username], (err, admin) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!admin) return res.status(401).json({ success: false, message: 'Invalid username or password' });

        bcrypt.compare(password, admin.password, (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!result) return res.status(401).json({ success: false, message: 'Invalid username or password' });

            req.session.admin = admin.username;
            res.json({ success: true });
        });
    });
});

// Fetch all orders (admin only)
app.get('/orders', (req, res) => {
    if (!req.session.admin) return res.status(403).json({ success: false, message: 'Unauthorized' });

    db.all(`SELECT o.id, c.name, c.phone, c.address, GROUP_CONCAT(o.product_name || '|' || o.quantity || '|' || o.subtotal, ',') AS items
            FROM orders o
            JOIN customers c ON o.customer_id = c.id
            GROUP BY o.customer_id`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });

        const orders = rows.map(row => ({
            id: row.id,
            name: row.name,
            phone: row.phone,
            address: row.address,
            items: row.items.split(',').map(item => {
                const [productName, quantity, subtotal] = item.split('|');
                return { productName, quantity: parseInt(quantity, 10), subtotal: parseFloat(subtotal) };
            })
        }));
        res.json({ orders });
    });
});



// Endpoint to handle checkout
app.post('/checkout', (req, res) => {
    const { name, phone, address, cartItems } = req.body;

    db.run(`INSERT INTO customers (name, phone, address) VALUES (?, ?, ?)`, [name, phone, address], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        msg='Table customers is inserted';

        const customerId = this.lastID;
        const stmt = db.prepare(`INSERT INTO orders (customer_id, product_name, quantity, subtotal) VALUES (?, ?, ?, ?)`);

        cartItems.forEach(item => {
            stmt.run(customerId, item.productName, item.quantity, item.subtotal);
            msg=msg+'  Table orders is inserted';
        });
        stmt.finalize();

        db.all('SELECT * FROM orders WHERE customer_id = ?', [customerId], (err, rows) => {
            if (err) {
                console.error(err);
                return;
            }
            console.log(rows); // Do something with the retrieved order data
        });

        res.json({ message: msg+'| Order placed successfully!|' });
    });
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});



