/**
 * controllers/knowledgeController.js
 * Admin endpoints to add/manage knowledge base.
 */

'use strict';

const KnowledgeBase = require('../models/KnowledgeBase');
const Client = require('../models/Client');
const { generateEmbedding } = require('../services/embeddingService');
const pdfParse = require('pdf-parse');
const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Text Splitting Utility
 * Breaks long text into smaller chunks for better embedding and retrieval.
 */
function chunkText(text, maxChunkSize = 1500) {
    // Simple paragraph-based or length-based chunking
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    const chunks = [];
    let currentChunk = '';

    for (const p of paragraphs) {
        if (currentChunk.length + p.length > maxChunkSize && currentChunk.length > 0) {
            chunks.push(currentChunk.trim());
            currentChunk = '';
        }
        currentChunk += p + '\n\n';
    }
    if (currentChunk.trim().length > 0) {
        chunks.push(currentChunk.trim());
    }

    // Fallback if no paragraphs and just one massive string
    if (chunks.length === 0 && text.trim().length > 0) {
        let startIndex = 0;
        while (startIndex < text.length) {
            chunks.push(text.substring(startIndex, startIndex + maxChunkSize));
            startIndex += maxChunkSize;
        }
    }

    return chunks;
}

/**
 * Reusable function to save chunks to DB
 */
async function processAndStoreChunks(clientId, text, source) {
    const chunks = chunkText(text);
    const savedChunks = [];

    for (const chunkText of chunks) {
        // Generate embedding via Gemini
        const embedding = await generateEmbedding(chunkText);

        const chunk = await KnowledgeBase.create({
            clientId,
            text: chunkText,
            embedding,
            source: source,
        });
        savedChunks.push(chunk._id);
    }
    return savedChunks;
}

/**
 * Helper to Verify Client
 */
async function verifyClient(clientId) {
    const client = await Client.findOne({ clientId });
    if (!client) throw new Error('Client not found');
    return client;
}

/**
 * 1. Add manual text to a client's knowledge base.
 */
exports.addKnowledgeText = async (req, res, next) => {
    try {
        const { clientId, text, source } = req.body;

        if (!clientId || !text) {
            return res.status(400).json({ success: false, message: 'clientId and text are required' });
        }

        await verifyClient(clientId);
        const savedIds = await processAndStoreChunks(clientId, text, source || 'manual');

        res.status(201).json({ success: true, message: 'Text added to knowledge base', chunksAdded: savedIds.length });
    } catch (error) {
        next(error);
    }
};

/**
 * 2. Add via Website Scraper
 */
exports.addKnowledgeWeb = async (req, res, next) => {
    try {
        const { clientId, url } = req.body;
        if (!clientId || !url) return res.status(400).json({ success: false, message: 'clientId and url are required' });

        await verifyClient(clientId);

        // Fetch page
        const response = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const html = response.data;
        const $ = cheerio.load(html);

        // Remove script, style, and nav tags to clean up text
        $('script, style, nav, footer, header').remove();

        // Extract headings, paragraphs, and list items
        let extractedText = '';
        $('h1, h2, h3, h4, h5, h6, p, li').each((i, el) => {
            const txt = $(el).text().trim();
            if (txt.length > 5) {
                extractedText += txt + '\n\n';
            }
        });

        if (!extractedText.trim()) {
            return res.status(400).json({ success: false, message: 'Could not extract meaningful text from URL' });
        }

        const savedIds = await processAndStoreChunks(clientId, extractedText, `website: ${url}`);

        res.status(201).json({ success: true, message: 'Website scraped and added', chunksAdded: savedIds.length });
    } catch (error) {
        next(error);
    }
}

/**
 * 3. Add via PDF Upload
 * Expects multer to have processed `req.file`
 */
exports.addKnowledgePDF = async (req, res, next) => {
    try {
        const { clientId } = req.body;
        if (!clientId) return res.status(400).json({ success: false, message: 'clientId is required' });
        if (!req.file) return res.status(400).json({ success: false, message: 'No PDF file uploaded' });

        await verifyClient(clientId);

        const dataBuffer = req.file.buffer;
        const pdfData = await pdfParse(dataBuffer);

        if (!pdfData.text || pdfData.text.trim() === '') {
            return res.status(400).json({ success: false, message: 'Could not extract text from PDF' });
        }

        const savedIds = await processAndStoreChunks(clientId, pdfData.text, `pdf: ${req.file.originalname}`);

        res.status(201).json({ success: true, message: 'PDF processed and added', chunksAdded: savedIds.length });
    } catch (error) {
        next(error);
    }
}

/**
 * 4. Add FAQ
 */
exports.addKnowledgeFAQ = async (req, res, next) => {
    try {
        const { clientId, question, answer } = req.body;
        if (!clientId || !question || !answer) {
            return res.status(400).json({ success: false, message: 'clientId, question, and answer are required' });
        }

        await verifyClient(clientId);

        const faqText = `Q: ${question}\nA: ${answer}`;

        // FAQs are usually short enough to be a single chunk
        const embedding = await generateEmbedding(faqText);

        await KnowledgeBase.create({
            clientId,
            text: faqText,
            embedding,
            source: 'faq',
        });

        res.status(201).json({ success: true, message: 'FAQ added' });
    } catch (error) {
        next(error);
    }
}

/**
 * Get all knowledge chunks for a client (without embeddings for lighter payload)
 */
exports.getClientKnowledge = async (req, res, next) => {
    try {
        const chunks = await KnowledgeBase.find({ clientId: req.params.clientId }).select('-embedding').sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: chunks });
    } catch (error) {
        next(error);
    }
}

/**
 * Delete a specific knowledge chunk
 */
exports.deleteKnowledgeChunk = async (req, res, next) => {
    try {
        const { chunkId } = req.params;
        await KnowledgeBase.findByIdAndDelete(chunkId);
        res.status(200).json({ success: true, message: 'Knowledge chunk deleted' });
    } catch (error) {
        next(error);
    }
};

/**
 * Update a knowledge chunk's text and re-generate its embedding
 */
exports.updateKnowledgeChunk = async (req, res, next) => {
    try {
        const { chunkId } = req.params;
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ success: false, message: 'Text is required for update' });
        }

        const chunk = await KnowledgeBase.findById(chunkId);
        if (!chunk) {
            return res.status(404).json({ success: false, message: 'Knowledge chunk not found' });
        }

        // Re-generate the vector embedding because the text changed
        const newEmbedding = await generateEmbedding(text);

        chunk.text = text;
        chunk.embedding = newEmbedding;

        await chunk.save();

        res.status(200).json({ success: true, message: 'Knowledge chunk updated successfully' });
    } catch (error) {
        next(error);
    }
};
