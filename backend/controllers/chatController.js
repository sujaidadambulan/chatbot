/**
 * controllers/chatController.js
 * Handles incoming chat messages from the widget.
 * Orchestrates Retrieval-Augmented Generation (RAG).
 */

'use strict';

const Client = require('../models/Client');
const ChatLog = require('../models/ChatLog');
const { searchKnowledgeBase } = require('../services/embeddingService');
const { generateChatResponse } = require('../services/geminiService');

/**
 * Handles POST /api/chat
 * Expects { clientId, message } in request body.
 */
exports.handleChat = async (req, res, next) => {
    try {
        const { clientId, message } = req.body;

        // 1. Validate Input
        if (!clientId || !message) {
            return res.status(400).json({ success: false, message: 'clientId and message are required' });
        }

        // 2. Verify Client Authenticity & Status
        const client = await Client.findOne({ clientId });
        if (!client) {
            return res.status(404).json({ success: false, message: 'Client not found' });
        }
        if (!client.isActive) {
            return res.status(403).json({ success: false, message: 'Client account is inactive' });
        }

        // 3. Retrieve Context from Knowledge Base (RAG - Retrieve)
        // We search for vectors similar to the prompt to get context
        const contextChunks = await searchKnowledgeBase(clientId, message);

        // 4. Generate Response using LLM (RAG - Augment & Generate)
        const aiResponseText = await generateChatResponse(message, contextChunks);

        // 5. Log the Conversation (Asynchronously to not block response)
        ChatLog.create({
            clientId,
            userMessage: message,
            botResponse: aiResponseText
        }).catch(err => console.error('❌ Failed to log chat:', err));

        // 6. Return Response to Widget
        return res.status(200).json({
            success: true,
            message: aiResponseText
        });

    } catch (error) {
        next(error); // Passes to global error handler
    }
};
