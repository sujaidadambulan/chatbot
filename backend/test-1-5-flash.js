require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function run() {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        console.log("Testing gemini-1.5-flash...");
        const result = await model.generateContent("Say hello");
        const response = await result.response;
        console.log("SUCCESS:", response.text());
    } catch (e) {
        console.error('FAILED:', e.message);
    }
}
run();
