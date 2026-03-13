require('dotenv').config();
const axios = require('axios');

async function run() {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

        console.log("Fetching models from:", url.replace(apiKey, 'API_KEY'));
        const response = await axios.get(url);

        console.log("--- Authorized Models ---");
        const chatModels = response.data.models.filter(m => m.supportedGenerationMethods.includes('generateContent'));
        const embedModels = response.data.models.filter(m => m.supportedGenerationMethods.includes('embedContent'));

        console.log("Chat Models:");
        chatModels.forEach(m => console.log(` - ${m.name.split('/').pop()} (${m.displayName})`));

        console.log("\nEmbedding Models:");
        embedModels.forEach(m => console.log(` - ${m.name.split('/').pop()} (${m.displayName})`));

    } catch (e) {
        console.error('Error listing models:', e.response ? e.response.data : e.message);
    }
}
run();
