/**
 * services/geminiService.js
 * Combines retrieved knowledge context with the user prompt and queries the LLM.
 */

'use strict';

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const chatModelName = process.env.GEMINI_CHAT_MODEL || 'gemini-1.5-flash';
const model = genAI.getGenerativeModel({ model: chatModelName });

/**
 * Generates an answer using the provided context and the user query.
 * @param {string} message The user's actual question.
 * @param {Array<Object>} contextChunks Chunks returned from embedding search.
 * @returns {Promise<string>} The AI generated response.
 */
exports.generateChatResponse = async (message, contextChunks) => {
    try {
        // Compile chunks into a single readable context block
        let contextText = '';
        if (contextChunks && contextChunks.length > 0) {
            contextText = contextChunks.map((c, i) => `[Source ${i + 1}]:\n${c.text}`).join('\n\n');
        }

        // Define the rigid prompt format to prevent hallucinations and enforce RAG
        const prompt = `
You are a helpful, professional customer support agent for the company.
Answer the user's question based ONLY on the following knowledge base context.

If the answer cannot be found in the context provided, politely state that you do not have that information and offer to connect them with a human agent, rather than making up answers. Do not mention the word "context" to the user.

KNOWLEDGE BASE:
----------------
${contextText || "No context provided."}
----------------

USER QUESTION: ${message}

YOUR HELPFUL RESPONSE:
`;

        // Make the API call
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();

    } catch (error) {
        console.error('❌ Error generating chat response from Gemini:', error.message);
        if (error.stack) console.error(error.stack);
        throw new Error(`Chat generation failed: ${error.message}`);
    }
};
