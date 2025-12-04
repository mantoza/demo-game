const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Initialize database
const db = new Database('leaderboard.db');

// Create table if it doesn't exist
db.exec(`
    CREATE TABLE IF NOT EXISTS scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        score INTEGER NOT NULL,
        coins INTEGER NOT NULL,
        level INTEGER NOT NULL,
        completed BOOLEAN NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_score ON scores(score DESC);
    CREATE INDEX IF NOT EXISTS idx_created_at ON scores(created_at DESC);
`);

// API Routes

// Get leaderboard (top scores)
app.get('/api/leaderboard', (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const scores = db.prepare(`
            SELECT username, score, coins, level, completed, 
                   datetime(created_at, 'localtime') as created_at
            FROM scores
            ORDER BY score DESC, created_at DESC
            LIMIT ?
        `).all(limit);
        
        res.json({ success: true, scores });
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch leaderboard' });
    }
});

// Get user's best score
app.get('/api/user/:username', (req, res) => {
    try {
        const { username } = req.params;
        const userScore = db.prepare(`
            SELECT username, MAX(score) as best_score, 
                   SUM(coins) as total_coins,
                   COUNT(*) as games_played,
                   MAX(level) as highest_level,
                   SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as games_completed
            FROM scores
            WHERE username = ?
            GROUP BY username
        `).get(username);
        
        if (!userScore) {
            return res.json({ success: true, userScore: null });
        }
        
        res.json({ success: true, userScore });
    } catch (error) {
        console.error('Error fetching user score:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch user score' });
    }
});

// Submit score
app.post('/api/scores', (req, res) => {
    try {
        const { username, score, coins, level, completed } = req.body;
        
        if (!username || typeof score !== 'number' || typeof coins !== 'number') {
            return res.status(400).json({ 
                success: false, 
                error: 'Missing required fields: username, score, coins' 
            });
        }
        
        // Sanitize username (alphanumeric and spaces only, max 20 chars)
        const sanitizedUsername = username.trim().substring(0, 20).replace(/[^a-zA-Z0-9\s]/g, '');
        
        if (!sanitizedUsername) {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid username' 
            });
        }
        
        const stmt = db.prepare(`
            INSERT INTO scores (username, score, coins, level, completed)
            VALUES (?, ?, ?, ?, ?)
        `);
        
        const result = stmt.run(
            sanitizedUsername,
            Math.max(0, Math.floor(score)),
            Math.max(0, Math.floor(coins)),
            Math.max(1, Math.min(2, level || 1)),
            completed ? 1 : 0
        );
        
        // Get rank
        const rank = db.prepare(`
            SELECT COUNT(*) + 1 as rank
            FROM scores
            WHERE score > ?
        `).get(score).rank;
        
        res.json({ 
            success: true, 
            id: result.lastInsertRowid,
            rank,
            message: 'Score saved successfully'
        });
    } catch (error) {
        console.error('Error saving score:', error);
        res.status(500).json({ success: false, error: 'Failed to save score' });
    }
});

// Get stats
app.get('/api/stats', (req, res) => {
    try {
        const stats = db.prepare(`
            SELECT 
                COUNT(*) as total_games,
                COUNT(DISTINCT username) as total_players,
                MAX(score) as highest_score,
                AVG(score) as avg_score,
                SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as games_completed
            FROM scores
        `).get();
        
        res.json({ success: true, stats });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch stats' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Database initialized: leaderboard.db`);
});

