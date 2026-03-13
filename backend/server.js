/**
 * server.js
 * Main entry point for the Multi-Client AI Chatbot Platform.
 * Configures Express server with security middleware and mounts all routes.
 */

'use strict';

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');

const connectDB = require('./config/database');
const chatRoutes = require('./routes/chatRoutes');
const knowledgeRoutes = require('./routes/knowledgeRoutes');
const clientRoutes = require('./routes/clientRoutes');

// ─── App Setup ───────────────────────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 5000;

// ─── Connect to MongoDB ───────────────────────────────────────────────────────
connectDB();

// ─── Security Middleware ──────────────────────────────────────────────────────

// Secure HTTP headers
app.use(helmet());

// CORS - allow specific origins or all (configure in .env)
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['*'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g., curl, Postman) or allowed origins
      if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
  })
);

// Parse JSON bodies (limit size to prevent payload attacks)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Sanitize data against NoSQL query injection attacks
app.use(mongoSanitize());

// ─── Rate Limiting ────────────────────────────────────────────────────────────

// General API rate limit
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,                  // max 200 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

// Stricter rate limit for the chat endpoint to prevent AI cost abuse
const chatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30,                  // max 30 chat messages per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Chat rate limit exceeded. Please wait a moment.' },
});

app.use('/api', generalLimiter);
app.use('/api/chat', chatLimiter);

// ─── Serve Widget Static Files ─────────────────────────────────────────────────
// Allows clients to embed the widget via <script src="/widget/chatbot.js">
app.use('/widget', express.static(path.join(__dirname, '..', 'widget')));

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/chat', chatRoutes);
app.use('/api/knowledge', knowledgeRoutes);
app.use('/api/clients', clientRoutes);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Chatbot Platform is running.', timestamp: new Date().toISOString() });
});

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.stack || err.message);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'An internal server error occurred.',
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Chatbot Platform server running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log(`   Widget: http://localhost:${PORT}/widget/chatbot.js`);
});

module.exports = app;
