// server.js
const express = require('express');
const fs = require('fs');
const cors = require('cors'); // Required to allow web page requests
const path = require('path'); // Node.js utility to correctly build file paths

const app = express();
const PORT = 3000;
// FIX: Use path.join(__dirname, ...) to correctly point to db.json 
// which is in the same folder as server.js
const DB_FILE = path.join(__dirname, 'db.json'); 

// Middleware
app.use(cors()); // Allow requests from your HTML file
app.use(express.json()); // Parses incoming JSON requests

// --- READ (GET) ENDPOINT ---
app.get('/api/balance', (req, res) => {
    fs.readFile(DB_FILE, (err, data) => {
        if (err) {
            console.error(err);
            // Return 500 status to the client (index.html) if reading fails
            return res.status(500).json({ error: 'Failed to read database' });
        }
        try {
            const db = JSON.parse(data);
            res.json({ balance: db.playerData.balance });
        } catch (e) {
            console.error(e);
            res.status(500).json({ error: 'Invalid database file format' });
        }
    });
});

// --- WRITE (POST) ENDPOINT ---
app.post('/api/balance', (req, res) => {
    const newBalance = req.body.balance;
    if (typeof newBalance !== 'number' || newBalance < 0) {
        return res.status(400).json({ error: 'Invalid balance amount' });
    }

    fs.readFile(DB_FILE, (err, data) => {
        if (err) return res.status(500).json({ error: 'Failed to read database' });

        try {
            let db = JSON.parse(data);
            
            // 1. Update the balance
            db.playerData.balance = newBalance;
            
            // 2. Write the updated data back to the file
            fs.writeFile(DB_FILE, JSON.stringify(db, null, 2), (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: 'Failed to write to database' });
                }
                res.json({ message: 'Balance updated successfully', balance: newBalance });
            });
        } catch (e) {
            res.status(500).json({ error: 'Database update failed' });
        }
    });
});

app.listen(PORT, () => {
    console.log(`Baccarat server running at http://localhost:${PORT}`);
});