require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function run() {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("❌ No GEMINI_API_KEY found in process.env");
            return;
        }
        console.log("Using API Key (first 5):", apiKey.substring(0, 5));

        const genAI = new GoogleGenerativeAI(apiKey);
        const chatModelName = process.env.GEMINI_CHAT_MODEL || 'gemini-1.5-flash';
        console.log("Testing Chat Model:", chatModelName);

        const model = genAI.getGenerativeModel({ model: chatModelName });
        console.log("Model object created. Sending request...");

        const result = await model.generateContent("Say hello");
        console.log("Request finished.");

        const response = await result.response;
        console.log("Chat Success:", response.text());
    } catch (e) {
        console.error('ERROR Chat Failed:', e.message);
        if (e.stack) console.error(e.stack);
    }
}
run();
