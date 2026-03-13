/**
 * routes/knowledgeRoutes.js
 * Express router for managing knowledge bases.
 */

'use strict';

const express = require('express');
const router = express.Router();
const knowledgeController = require('../controllers/knowledgeController');

const multer = require('multer');

// Configure Multer for PDF uploads (store in memory buffer)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

/**
 * Middleware to check admin API key
 */
const requireAdmin = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
        return res.status(401).json({ success: false, message: 'Unauthorized. Invalid API Key.' });
    }
    next();
};

// Protect all knowledge ingestion routes
router.use(requireAdmin);

// POST /api/knowledge/text (Standard/Manual)
router.post('/text', knowledgeController.addKnowledgeText);

// POST /api/knowledge/web (Website Scraper)
router.post('/web', knowledgeController.addKnowledgeWeb);

// POST /api/knowledge/pdf (PDF Upload)
router.post('/pdf', upload.single('file'), knowledgeController.addKnowledgePDF);

// POST /api/knowledge/faq (FAQ Pair)
router.post('/faq', knowledgeController.addKnowledgeFAQ);

// GET /api/knowledge/:clientId
router.get('/:clientId', knowledgeController.getClientKnowledge);

// PUT /api/knowledge/:chunkId
router.put('/:chunkId', knowledgeController.updateKnowledgeChunk);

// DELETE /api/knowledge/:chunkId
router.delete('/:chunkId', knowledgeController.deleteKnowledgeChunk);

module.exports = router;
