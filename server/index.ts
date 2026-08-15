import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import apiRouter from './routes';
import { initDatabase } from './db';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 8080;

app.use(cors());
app.use(express.json());

// API health endpoint for DigitalOcean health checks
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Mount API routes
app.use('/api', apiRouter);

// Serve static frontend files in production
const distPath = path.join(process.cwd(), 'dist');
app.use(express.static(distPath));

// Express 5 compatible Catch-all for Single Page Application routing
app.use((req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start listening immediately on 0.0.0.0 for DigitalOcean health checks
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 BudgetMaster server running on 0.0.0.0:${PORT}`);
  console.log(`📡 Health check active at http://0.0.0.0:${PORT}/health`);

  // Initialize Database Schema asynchronously without blocking the web listener
  initDatabase().catch((err) => {
    console.error('Database background initialization error:', err);
  });
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
