/**
 * models/ChatLog.js
 * Defines the MongoDB schema for storing conversation history.
 */

'use strict';

const mongoose = require('mongoose');

const chatLogSchema = new mongoose.Schema({
    clientId: {
        type: String,
        required: true,
        index: true,
    },
    userMessage: {
        type: String,
        required: true,
    },
    botResponse: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('ChatLog', chatLogSchema);
