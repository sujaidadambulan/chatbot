/**
 * routes/chatRoutes.js
 * Express router for chat endpoint.
 */

'use strict';

const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// POST /api/chat - Receive message from widget
router.post('/', chatController.handleChat);

module.exports = router;
