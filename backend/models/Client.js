/**
 * models/Client.js
 * Defines the MongoDB schema for a tenant/client in the chatbot platform.
 */

'use strict';

const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
    clientId: {
        type: String,
        required: true,
        unique: true,
        index: true,     // Important for fast lookups
        trim: true,
    },
    companyName: {
        type: String,
        required: true,
        trim: true,
    },
    website: {
        type: String,
        trim: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Client', clientSchema);
