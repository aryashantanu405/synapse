import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import projectRoutes from './routes/projectroute.js';
import userRoutes from './routes/userroutes.js'; // 1. Import user routes

// Load environment variables
dotenv.config();

// Connect to the database
connectDB();

const app = express();
const port = 4000;

app.use(cors());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running and connected!' });
});

// Use the project and user routes
app.use('/api/projects', projectRoutes);
app.use('/api/users', userRoutes); // 2. Use the user routes

app.listen(port, () => {
  console.log(`🚀 API server listening on http://localhost:${port}`);
});