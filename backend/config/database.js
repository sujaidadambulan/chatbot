/**
 * config/database.js
 * Handles MongoDB connection using Mongoose.
 * Includes graceful shutdown and reconnect handling.
 */

'use strict';

const mongoose = require('mongoose');

/**
 * Connects to MongoDB using the URI from environment variables.
 * Exits the process on failure so the server doesn't start without a DB.
 */
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            // Mongoose 6+ deprecates these options, but they are kept for compatibility
        });

        console.log(`✅ MongoDB connected: ${conn.connection.host}`);

        // Handle disconnection events
        mongoose.connection.on('disconnected', () => {
            console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('✅ MongoDB reconnected.');
        });

        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB error:', err.message);
        });

    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        process.exit(1); // Exit with failure so PM2/Docker can restart
    }
};

// Graceful shutdown: close DB connection when process terminates
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('MongoDB connection closed due to app termination.');
    process.exit(0);
});

module.exports = connectDB;
