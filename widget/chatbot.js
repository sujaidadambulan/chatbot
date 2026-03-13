/**
 * chatbot.js
 * Embeddable script for the AI Chatbot Widget.
 * Included on client websites via <script src="https://domain.com/widget/chatbot.js"></script>
 */

(function () {
    'use strict';

    // 1. Identify Client ID from the global config object
    const config = window.chatbotConfig || {};
    const clientId = config.clientId;

    if (!clientId) {
        console.error('Chatbot Widget: Missing clientId in window.chatbotConfig');
        return;
    }

    // 2. Configuration & State
    // The build script replaces __API_URL__ with the actual environment variable during Vercel deployment.
    // Falls back to a config-provided URL or localhost.
    const injectedApiUrl = '__API_URL__';
    const baseApiUrl = window.chatbotConfig.apiUrl || (injectedApiUrl !== '__API_URL__' ? injectedApiUrl : 'https://chatbot-production-85cf.up.railway.app/api');
    const backendUrl = `${baseApiUrl}/chat`;
    const cssUrl = `${baseApiUrl.replace('/api', '/widget')}/chatbot.css`;

    let isOpen = false;
    let isWaitingForResponse = false;

    // 3. Inject CSS
    function injectStyles() {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = cssUrl;
        document.head.appendChild(link);
    }

    // 4. Create UI Elements
    function createWidget() {
        // Container
        const container = document.createElement('div');
        container.id = 'ai-chatbot-container';
        container.className = 'ai-chatbot-closed';

        // Launcher Button
        const launcher = document.createElement('button');
        launcher.id = 'ai-chatbot-launcher';
        launcher.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
    `;
        launcher.onclick = toggleChat;

        // Chat Window
        const chatWindow = document.createElement('div');
        chatWindow.id = 'ai-chatbot-window';

        // Header
        const header = document.createElement('div');
        header.id = 'ai-chatbot-header';
        header.innerHTML = `
      <span>Support Chat</span>
      <button id="ai-chatbot-close-btn">&times;</button>
    `;

        // Messages Area
        const messagesContainer = document.createElement('div');
        messagesContainer.id = 'ai-chatbot-messages';

        // Initial greeting
        const greeting = document.createElement('div');
        greeting.className = 'ai-chatbot-message bot';
        greeting.innerText = 'Hello! How can I help you today?';
        messagesContainer.appendChild(greeting);

        // Input Area
        const inputArea = document.createElement('div');
        inputArea.id = 'ai-chatbot-input-area';

        const input = document.createElement('input');
        input.type = 'text';
        input.id = 'ai-chatbot-input';
        input.placeholder = 'Type your message...';
        input.autocomplete = 'off';

        const sendBtn = document.createElement('button');
        sendBtn.id = 'ai-chatbot-send-btn';
        sendBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="22" y1="2" x2="11" y2="13"></line>
        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
      </svg>
    `;

        // Assembly
        inputArea.appendChild(input);
        inputArea.appendChild(sendBtn);

        chatWindow.appendChild(header);
        chatWindow.appendChild(messagesContainer);
        chatWindow.appendChild(inputArea);

        container.appendChild(chatWindow);
        container.appendChild(launcher);

        document.body.appendChild(container);

        // Event Listeners
        header.querySelector('#ai-chatbot-close-btn').onclick = toggleChat;
        sendBtn.onclick = handleSend;
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSend();
        });
    }

    // 5. Logic
    function toggleChat() {
        const container = document.getElementById('ai-chatbot-container');
        isOpen = !isOpen;
        if (isOpen) {
            container.className = 'ai-chatbot-open';
            document.getElementById('ai-chatbot-input').focus();
        } else {
            container.className = 'ai-chatbot-closed';
        }
    }

    function appendMessage(text, sender) {
        const messagesContainer = document.getElementById('ai-chatbot-messages');
        const msgDiv = document.createElement('div');
        msgDiv.className = `ai-chatbot-message ${sender}`;
        msgDiv.innerText = text;
        messagesContainer.appendChild(msgDiv);

        // Auto-scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function addLoadingIndicator() {
        const messagesContainer = document.getElementById('ai-chatbot-messages');
        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'ai-chatbot-loading';
        loadingDiv.className = 'ai-chatbot-message bot';
        loadingDiv.innerHTML = '<span class="dot"></span><span class="dot"></span><span class="dot"></span>';
        messagesContainer.appendChild(loadingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function removeLoadingIndicator() {
        const loadingDiv = document.getElementById('ai-chatbot-loading');
        if (loadingDiv) {
            loadingDiv.remove();
        }
    }

    async function handleSend() {
        if (isWaitingForResponse) return;

        const input = document.getElementById('ai-chatbot-input');
        const message = input.value.trim();
        if (!message) return;

        // UI Updates
        appendMessage(message, 'user');
        input.value = '';
        isWaitingForResponse = true;
        addLoadingIndicator();

        try {
            // API Call to Backend
            const response = await fetch(backendUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    clientId: clientId,
                    message: message
                }),
            });

            const data = await response.json();
            removeLoadingIndicator();

            if (response.ok && data.success) {
                appendMessage(data.message, 'bot');
            } else {
                appendMessage(data.message || 'Sorry, I encountered an error. Please try again.', 'bot error');
            }
        } catch (error) {
            console.error('Chatbot error:', error);
            removeLoadingIndicator();
            appendMessage('Network error. Please check your connection.', 'bot error');
        } finally {
            isWaitingForResponse = false;
        }
    }

    // 6. Initialize
    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            injectStyles();
            createWidget();
        });
    } else {
        injectStyles();
        createWidget();
    }

})();
