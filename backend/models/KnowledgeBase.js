/**
 * models/KnowledgeBase.js
 * Defines the MongoDB schema for storing client knowledge chunks and their vector embeddings.
 */

'use strict';

const mongoose = require('mongoose');

const knowledgeBaseSchema = new mongoose.Schema({
    clientId: {
        type: String,
        required: true,
        index: true, // Used to filter knowledge by client
    },
    text: {
        type: String,
        required: true,
    },
    embedding: {
        type: [Number], // Array of floats representing the vector embedding
        required: true,
        // Note: If using MongoDB Atlas Vector Search, you don't need a traditional index here.
        // The vector index is configured in the Atlas UI or via specific Atlas commands.
    },
    source: {
        type: String,
        default: 'manual', // e.g., 'manual', 'website', 'pdf'
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Create a compound index for faster client-specific queries if needed
knowledgeBaseSchema.index({ clientId: 1, createdAt: -1 });

module.exports = mongoose.model('KnowledgeBase', knowledgeBaseSchema);
