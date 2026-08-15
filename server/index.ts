import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import apiRouter from './routes';
import { initDatabase } from './db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Mount API routes
app.use('/api', apiRouter);

// Serve static frontend files in production
const distPath = path.join(process.cwd(), 'dist');
app.use(express.static(distPath));

// Fallback for Single Page Application
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

async function startServer() {
  // Initialize Database Schema if DATABASE_URL is set
  await initDatabase();

  app.listen(PORT, () => {
    console.log(`🚀 BudgetMaster server running on port ${PORT}`);
    console.log(`📡 API Endpoints available at http://localhost:${PORT}/api`);
  });
}

startServer();
