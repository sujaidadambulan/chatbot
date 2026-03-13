// widget/build.js
const fs = require('fs');
const path = require('path');

// Target API URL from environment, fallback to localhost for safety
const apiUrl = process.env.VITE_API_URL || 'https://chatbot-production-85cf.up.railway.app/api';

console.log(`Building widget using API URL: ${apiUrl}`);

// Read the source chatbot.js
const srcPath = path.join(__dirname, 'chatbot.js');
let content = fs.readFileSync(srcPath, 'utf8');

// Replace the placeholder with the actual API URL
content = content.replace(/__API_URL__/g, apiUrl);

// Ensure dist directory exists
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir);
}

// Write the compiled file to dist/
fs.writeFileSync(path.join(distDir, 'chatbot.js'), content);

// Copy the CSS file as well
const cssSrcPath = path.join(__dirname, 'chatbot.css');
if (fs.existsSync(cssSrcPath)) {
    fs.copyFileSync(cssSrcPath, path.join(distDir, 'chatbot.css'));
}

console.log('Widget build complete. Output is in dist/');
