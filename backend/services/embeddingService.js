/**
 * services/embeddingService.js
 * Handles generating vector embeddings for text chunks using Google Gemini AI.
 * Also includes basic cosine similarity search if running locally.
 */

'use strict';

const { GoogleGenerativeAI } = require('@google/generative-ai');
const KnowledgeBase = require('../models/KnowledgeBase');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Use the embedding model specified in .env, fallback to 'text-embedding-004'
const embeddingModelName = process.env.GEMINI_EMBEDDING_MODEL || 'text-embedding-004';
const model = genAI.getGenerativeModel({ model: embeddingModelName });

/**
 * Generates an embedding vector for a given piece of text.
 * @param {string} text The text to evaluate.
 * @returns {Promise<Array<number>>} The vector embedding array.
 */
exports.generateEmbedding = async (text) => {
    try {
        const result = await model.embedContent(text);
        return result.embedding.values;
    } catch (error) {
        console.error('❌ Error generating embedding:', error);
        throw new Error('Failed to generate embedding');
    }
};

/**
 * Calculates cosine similarity between two vectors.
 * Used as a fallback if MongoDB Atlas Vector Search isn't set up.
 */
function cosineSimilarity(vecA, vecB) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] ** 2;
        normB += vecB[i] ** 2;
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Searches the knowledge base for the most relevant chunks using vector similarity.
 * @param {string} clientId Tenant ID
 * @param {string} query The user's question
 * @param {number} topK Number of chunks to return
 * @returns {Promise<Array<{text: string, score: number}>>}
 */
exports.searchKnowledgeBase = async (clientId, query, topK = parseInt(process.env.TOP_K_RESULTS) || 5) => {
    try {
        const queryEmbedding = await module.exports.generateEmbedding(query);

        // Fetch all chunks for the client (In production with large KB, use MongoDB Atlas Vector Search `$vectorSearch`)
        // For universal compatibility in this demo, we calculate cosine similarity in JS memory.
        const allChunks = await KnowledgeBase.find({ clientId }).select('text embedding -_id').lean();

        if (!allChunks || allChunks.length === 0) {
            return [];
        }

        // Rank chunks
        const rankedChunks = allChunks.map(chunk => ({
            text: chunk.text,
            score: cosineSimilarity(queryEmbedding, chunk.embedding)
        }));

        // Sort descending by score and pick top K
        rankedChunks.sort((a, b) => b.score - a.score);
        return rankedChunks.slice(0, topK);

    } catch (error) {
        console.error('❌ Error searching knowledge base:', error);
        throw new Error('Failed to search knowledge base');
    }
};
