# Ping Pong - Coin Rush with Online Leaderboard

A fun ping pong game with 2 levels, coin collection, and an online leaderboard system.

## Features

- 🎮 Classic ping pong gameplay with modern graphics
- 🪙 Collect coins for bonus points
- 📊 2 challenging levels with increasing difficulty
- 🏆 Online leaderboard with database storage
- 👤 Username-based score tracking
- 🌐 Real-time leaderboard updates

## Setup Instructions

### 1. Install Dependencies

```bash
cd ~/Desktop
npm install
```

This will install:
- `express` - Web server
- `cors` - Cross-origin resource sharing
- `better-sqlite3` - SQLite database

### 2. Start the Server

```bash
npm start
```

The server will start on `http://localhost:3000`

### 3. Open the Game

Open `pong.html` in your browser, or visit `http://localhost:3000/pong.html` if running the server.

## How to Play

1. **Enter your username** when the game starts
2. **Control the paddle** with your mouse or arrow keys (← →)
3. **Hit the ball** 10 times to complete each level
4. **Collect coins** that appear after hitting the ball for bonus points
5. **Complete both levels** to win!
6. **Check the leaderboard** in the top-right corner to see top scores

## API Endpoints

- `GET /api/leaderboard?limit=10` - Get top scores
- `POST /api/scores` - Submit a new score
- `GET /api/user/:username` - Get user's best score and stats
- `GET /api/stats` - Get overall game statistics

## Database

Scores are stored in `leaderboard.db` (SQLite database). The database is automatically created when you first run the server.

## Development

For development with auto-reload:

```bash
npm run dev
```

(Requires `nodemon` - install with `npm install -D nodemon`)

## Deployment

To deploy online:

1. Deploy the server to a hosting service (Heroku, Railway, Render, etc.)
2. Update the `API_URL` in `pong.html` to point to your server URL
3. Make sure the database file persists (or use a cloud database)

## Files

- `pong.html` - Game frontend
- `server.js` - Express backend server
- `package.json` - Dependencies and scripts
- `leaderboard.db` - SQLite database (created automatically)

Enjoy the game! 🎮

