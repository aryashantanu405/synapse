// packages/services/api-server/index.js

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http'; // 1. Import Node's built-in HTTP module
import { Server } from 'socket.io'; // 2. Import the Server class from socket.io
import axios from 'axios';

import connectDB from './config/db.js';
import projectRoutes from './routes/projectroute.js';
import userRoutes from './routes/userroutes.js';
import User from './models/user.model.js'; // We'll need this for context

dotenv.config();
connectDB();

const app = express();
const port = process.env.PORT || 4000;

// --- 3. Create the HTTP server and attach the Socket.IO server ---
const server = http.createServer(app); // Create an HTTP server with the Express app
const io = new Server(server, {
  // Socket.IO needs its own CORS configuration
  cors: {
    origin: "http://localhost:3000", // Allow connections from your Next.js frontend
    methods: ["GET", "POST"]
  }
});


// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/projects', projectRoutes);
app.use('/api/users', userRoutes);
app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'API Server is running!' }));

const lastHintTimestamps = new Map();
// --- 4. Define WebSocket Logic ---
// This block runs every time a new user connects via WebSocket
io.on('connection', (socket) => {
  console.log(`🔌 WebSocket connected: ${socket.id}`);
    lastHintTimestamps.set(socket.id, 0); 

  // This is the event listener for real-time code changes from the frontend
  socket.on('code_change', async (data) => {
    // data will look like: { clerkId, code_snippet, language, ... }
    console.log(`Received code change from ${socket.id}`);
    const now = Date.now();
    const lastHintTime = lastHintTimestamps.get(socket.id);
    const tenSeconds = 10 * 1000;

    // If less than 10 seconds have passed, do nothing.
    if (now - lastHintTime < tenSeconds) {
      // console.log("Rate limit: Not requesting hint yet.");
      return; 
    }
    try {
      // Step A: Find the user to get their archetype
      const user = await User.findOne({ clerkId: data.clerkId });
      if (!user) {
        socket.emit('hint_error', { message: 'User not found for hint generation.' });
        return;
      }

      // Step B: Construct the context payload for the ml-service
      const contextPayload = {
        userArchetype: user.userArchetype,
        currentLanguage: data.language,
        // Using placeholders for now, this data will come from the frontend
        conceptMasteryScore: 0.3, 
        timeInSession_minutes: 60,
        recentErrorCount: 2
      };

      // Step C: Call the ml-service to get a predictive hint
      const mlServiceUrl = 'http://localhost:8000/generate/hint';
      const mlResponse = await axios.post(mlServiceUrl, {
        language: data.language,
        code_snippet: data.code_snippet,
        context: contextPayload
      });
      
      // Step D: Send the hint back to ONLY the user who sent the code
      socket.emit('new_hint', mlResponse.data);

    } catch (error) {
      console.error("Error in socket 'code_change' handler:", error.message);
      socket.emit('hint_error', { message: 'Failed to generate hint.' });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`🔌 WebSocket disconnected: ${socket.id}`);
    lastHintTimestamps.delete(socket.id);
  });
});


// --- 5. Start the server ---
// We now listen on the http server, not the express app directly
server.listen(port, () => {
  console.log(`🚀 API Server with WebSockets listening on http://localhost:${port}`);
});