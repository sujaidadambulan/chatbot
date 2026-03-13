require('dotenv').config();
const axios = require('axios');

async function run() {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

        console.log("Fetching models...");
        const response = await axios.get(url);

        if (!response.data || !response.data.models) {
            console.log("No models returned in response data.");
            console.log("Response:", JSON.stringify(response.data));
            return;
        }

        console.log(`Total models found: ${response.data.models.length}`);

        console.log("--- List of all Model Names ---");
        response.data.models.forEach(m => {
            console.log(` - ${m.name}`);
        });

    } catch (e) {
        console.error('Error listing models:', e.response ? JSON.stringify(e.response.data) : e.message);
    }
}
run();
