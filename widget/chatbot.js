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

    // 3. Inject CSS inline to avoid cross-origin stylesheet issues
    function injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
:root{--chatbot-primary:#2563eb;--chatbot-primary-hover:#1d4ed8;--chatbot-bg:#ffffff;--chatbot-text:#1f2937;--chatbot-border:#e5e7eb;--chatbot-user-msg:#2563eb;--chatbot-bot-msg:#f3f4f6;--chatbot-shadow:0 10px 15px -3px rgba(0,0,0,0.1),0 4px 6px -2px rgba(0,0,0,0.05);--chatbot-z-index:999999}
#ai-chatbot-container{position:fixed;bottom:24px;right:24px;z-index:var(--chatbot-z-index);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;display:flex;flex-direction:column;align-items:flex-end}
#ai-chatbot-launcher{width:56px;height:56px;border-radius:50%;background-color:var(--chatbot-primary);color:white;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:var(--chatbot-shadow);transition:transform 0.2s,background-color 0.2s;padding:0}
#ai-chatbot-launcher:hover{background-color:var(--chatbot-primary-hover);transform:scale(1.05)}
#ai-chatbot-window{width:350px;height:500px;max-height:calc(100vh - 100px);background-color:var(--chatbot-bg);border-radius:12px;box-shadow:var(--chatbot-shadow);display:flex;flex-direction:column;overflow:hidden;margin-bottom:16px;border:1px solid var(--chatbot-border);transition:opacity 0.3s,transform 0.3s,visibility 0.3s;transform-origin:bottom right}
.ai-chatbot-closed #ai-chatbot-window{opacity:0;transform:scale(0.95);visibility:hidden;pointer-events:none}
.ai-chatbot-open #ai-chatbot-window{opacity:1;transform:scale(1);visibility:visible;pointer-events:auto}
#ai-chatbot-header{background-color:var(--chatbot-primary);color:white;padding:16px;font-weight:600;font-size:16px;display:flex;justify-content:space-between;align-items:center;border-top-left-radius:12px;border-top-right-radius:12px}
#ai-chatbot-close-btn{background:none;border:none;color:white;font-size:24px;line-height:1;cursor:pointer;padding:0 4px;opacity:0.8}
#ai-chatbot-close-btn:hover{opacity:1}
#ai-chatbot-messages{flex:1;padding:16px;overflow-y:auto;display:flex;flex-direction:column;gap:12px;background-color:#f9fafb}
.ai-chatbot-message{max-width:85%;padding:10px 14px;border-radius:12px;font-size:14px;line-height:1.4;word-wrap:break-word}
.ai-chatbot-message.bot{background-color:var(--chatbot-bot-msg);color:var(--chatbot-text);align-self:flex-start;border-bottom-left-radius:4px}
.ai-chatbot-message.bot.error{background-color:#fee2e2;color:#b91c1c}
.ai-chatbot-message.user{background-color:var(--chatbot-user-msg);color:white;align-self:flex-end;border-bottom-right-radius:4px}
#ai-chatbot-input-area{padding:12px;background-color:var(--chatbot-bg);border-top:1px solid var(--chatbot-border);display:flex;gap:8px}
#ai-chatbot-input{flex:1;padding:10px 12px;border:1px solid var(--chatbot-border);border-radius:20px;font-size:14px;outline:none;transition:border-color 0.2s;background-color:#fff;color:#000}
#ai-chatbot-input:focus{border-color:var(--chatbot-primary)}
#ai-chatbot-send-btn{width:40px;height:40px;border-radius:50%;background-color:var(--chatbot-primary);color:white;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;transition:background-color 0.2s}
#ai-chatbot-send-btn:hover{background-color:var(--chatbot-primary-hover)}
#ai-chatbot-loading{display:flex;gap:4px;padding:12px 16px;width:fit-content}
#ai-chatbot-loading .dot{width:6px;height:6px;background-color:#6b7280;border-radius:50%;animation:bounce 1.4s infinite ease-in-out both}
#ai-chatbot-loading .dot:nth-child(1){animation-delay:-0.32s}
#ai-chatbot-loading .dot:nth-child(2){animation-delay:-0.16s}
@keyframes bounce{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}
@media(max-width:480px){#ai-chatbot-window{width:calc(100vw - 32px);height:calc(100vh - 120px)}}
        `;
        document.head.appendChild(style);
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
