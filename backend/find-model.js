require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function run() {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        const genAI = new GoogleGenerativeAI(apiKey);

        const modelsToTest = [
            'gemini-1.5-flash',
            'gemini-1.5-flash-latest',
            'gemini-1.5-pro',
            'gemini-1.5-pro-latest',
            'gemini-pro'
        ];

        console.log("--- Testing Chat Models ---");
        for (const modelName of modelsToTest) {
            try {
                process.stdout.write(`Testing ${modelName}... `);
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("test");
                const response = await result.response;
                console.log(`✅ WORKS: ${response.text().substring(0, 20)}...`);
            } catch (e) {
                console.log(`❌ FAILED: ${e.message}`);
            }
        }

    } catch (e) {
        console.error('Unexpected Error:', e);
    }
}
run();
