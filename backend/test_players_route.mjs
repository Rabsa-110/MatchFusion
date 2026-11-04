// Test the players route directly
import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

// Import and test the route
import playersRouter from './routes/players.js';

const app = express();
app.use(express.json());
app.use('/api/players', playersRouter);

const server = app.listen(5099, async () => {
  try {
    const { default: fetch } = await import('node-fetch');
    const res = await fetch('http://localhost:5099/api/players?sport=all&page=1&limit=5');
    const data = await res.json();
    console.log('Status:', res.status);
    console.log('Response:', JSON.stringify({ success: data.success, total: data.total, count: data.count, source: data.source, note: data.note, firstPlayer: data.players?.[0]?.name }, null, 2));
  } catch (err) {
    console.error('Test error:', err.message);
  } finally {
    server.close();
    process.exit(0);
  }
});

