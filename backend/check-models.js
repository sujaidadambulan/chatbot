require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function run() {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("❌ No GEMINI_API_KEY found in process.env");
            return;
        }

        // Note: The @google/generative-ai Node SDK doesn't have a direct 'listModels' method in the main class.
        // It's usually part of the GoogleAIFileManager or just using the REST API.
        // But we can test common model names to see what works.

        const genAI = new GoogleGenerativeAI(apiKey);
        const modelsToTest = [
            'gemini-1.5-flash',
            'gemini-1.5-pro',
            'text-embedding-004',
            'gemini-embedding-001',
            'embedding-001'
        ];

        console.log("--- Testing Models ---");
        for (const modelName of modelsToTest) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                if (modelName.includes('embedding')) {
                    await model.embedContent("test");
                } else {
                    await model.generateContent("test");
                }
                console.log(`✅ ${modelName}: AVAILABLE`);
            } catch (e) {
                console.log(`❌ ${modelName}: FAILED (${e.message})`);
            }
        }

    } catch (e) {
        console.error('Unexpected Error:', e);
    }
}
run();
