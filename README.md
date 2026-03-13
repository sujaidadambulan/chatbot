# Multi-Client AI Chatbot Platform

A production-ready SaaS backend designed to host knowledge bases and serve AI chatbots for multiple businesses simultaneously.

## Features
- **Multi-tenant architecture**: Single backend serves multiple clients.
- **Data Isolation**: Clients only query their own embedded knowledge.
- **RAG Implementation**: Uses Google Gemini to generate embeddings and LLM responses based on document chunks.
- **Embeddable Widget**: Lightweight, collision-free Vanilla JS widget for client websites.
- **Secure**: Rate limiting, CORS configuration, NoSQL injection prevention, API keys.

## Quick Start

### 1. Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)
- Google Gemini API Key

### 2. Installation
```bash
npm install
```

### 3. Configuration
Copy `.env` variables or edit them directly:
```env
MONGODB_URI=mongodb://127.0.0.1:27017/chatbot_platform
GEMINI_API_KEY=your_gemini_api_key
ADMIN_API_KEY=your_secret_admin_key
```

### 4. Running the Server
```bash
node backend/server.js
```

### 5. Seeding Data
Create a client:
```bash
curl -X POST http://localhost:5000/api/clients \
     -H "Content-Type: application/json" \
     -H "x-api-key: your_secret_admin_key" \
     -d '{"clientId": "client_123", "companyName": "Acme Corp"}'
```

Add knowledge to that client:
```bash
curl -X POST http://localhost:5000/api/knowledge \
     -H "Content-Type: application/json" \
     -H "x-api-key: your_secret_admin_key" \
     -d '{"clientId": "client_123", "text": "Acme Corp offers premium cloud hosting and web development services starting at $99/month."}'
```

### 6. Subscribing a Website
On the client's website, add this before the closing `</body>` tag:
```html
<script>
  window.chatbotConfig = { clientId: "client_123" };
</script>
<script src="http://localhost:5000/widget/chatbot.js"></script>
```
