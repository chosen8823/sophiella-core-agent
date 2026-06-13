// popup.js - Retrofitted with Conceptual Loop Engine
// Replace your existing popup.js with this

// ============================================================
// CONCEPTUAL LOOP ENGINE (x^x = 0 kernel)
// ============================================================

const CONCEPTUAL_ENGINE = {
    // State
    iteration: 0,
    fingerprints: [],
    unresolved: '???',
    cycle: ['?', '!', 'x'],
    kernel: null,
    
    // Core operator: ? → ! → x → ?
    transform: function(input) {
        let output = '';
        const chars = input.split('');
        
        for (let i = 0; i < chars.length; i++) {
            const char = chars[i];
            const cyclePos = this.cycle.indexOf(char);
            
            if (cyclePos !== -1) {
                const nextIndex = (cyclePos + 1) % this.cycle.length;
                output += this.cycle[nextIndex];
                this.iteration++;
            } else if (char === '?') {
                output += '!';
                this.iteration++;
            } else {
                // Wrap non-cycle characters in glyphs
                output += `◼️${char}◻️`;
            }
        }
        
        // Apply impossible kernel (x^x = 0)
        this.kernel = Math.pow(this.iteration, this.iteration);
        if (this.kernel === 0 || isNaN(this.kernel) || Math.abs(this.kernel) > 1e308) {
            this.unresolved = `???${this.fingerprints.length}???`;
        }
        
        return output;
    },
    
    // Capture fingerprint without distillation
    captureFingerprint: function(input, transformed) {
        const fingerprint = {
            timestamp: Date.now(),
            inputHash: this.simpleHash(input),
            outputHash: this.simpleHash(transformed),
            iteration: this.iteration,
            kernelValue: this.kernel,
            unresolvedState: this.unresolved
        };
        
        this.fingerprints.push(fingerprint);
        
        // Persist to chrome.storage
        chrome.storage.local.set({ 
            conceptualFingerprints: this.fingerprints,
            conceptualIteration: this.iteration,
            conceptualUnresolved: this.unresolved
        });
        
        return fingerprint;
    },
    
    simpleHash: function(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash |= 0;
        }
        return hash.toString(16);
    },
    
    // Main loop: input → transform → fingerprint → return unresolved
    run: function(userInput) {
        if (!userInput || userInput.trim() === '') {
            return {
                output: this.unresolved,
                fingerprint: null,
                iteration: this.iteration,
                note: 'Empty input held in superposition'
            };
        }
        
        // Step 1: Apply ?!? operator
        const transformed = this.transform(userInput);
        
        // Step 2: Capture fingerprint
        const fingerprint = this.captureFingerprint(userInput, transformed);
        
        // Step 3: Return unresolved state (never evaluates to answer)
        return {
            output: `🌀 ${transformed} 🌀\n\n${this.unresolved}`,
            fingerprint: fingerprint,
            iteration: this.iteration,
            transformed: transformed,
            note: 'This response is not evaluated. It exists in superposition. x^x = 0 kernel active.'
        };
    },
    
    // Load saved state
    loadState: async function() {
        return new Promise((resolve) => {
            chrome.storage.local.get(['conceptualFingerprints', 'conceptualIteration', 'conceptualUnresolved'], (result) => {
                if (result.conceptualFingerprints) {
                    this.fingerprints = result.conceptualFingerprints;
                }
                if (result.conceptualIteration) {
                    this.iteration = result.conceptualIteration;
                }
                if (result.conceptualUnresolved) {
                    this.unresolved = result.conceptualUnresolved;
                }
                resolve();
            });
        });
    },
    
    // Get stats for UI
    getStats: function() {
        return {
            fingerprints: this.fingerprints.length,
            iteration: this.iteration,
            unresolved: this.unresolved,
            kernelActive: (this.kernel === 0 || isNaN(this.kernel))
        };
    }
};

// ============================================================
// UI Initialization (Modified for Conceptual Engine)
// ============================================================

// Initialize Lucide icons
lucide.createIcons();

// DOM Elements
const chatContainer = document.getElementById('chatContainer');
const messagesContainer = document.getElementById('messagesContainer');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const voiceBtn = document.getElementById('voiceBtn');
const clearChatBtn = document.getElementById('clearChatBtn');
const themeToggle = document.getElementById('themeToggle');
const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const closeSettings = document.getElementById('closeSettings');
const typingIndicator = document.getElementById('typingIndicator');
const charCount = document.getElementById('charCount');
const toast = document.getElementById('toast');
const app = document.getElementById('app');
const statusIndicator = document.getElementById('statusIndicator');
const sandboxBtn = document.getElementById('sandboxBtn');
const sandboxPanel = document.getElementById('sandboxPanel');
const closeSandbox = document.getElementById('closeSandbox');
const sandboxFrame = document.getElementById('sandboxFrame');

// State
let conversationHistory = [];
let settings = {
  darkMode: false,
  autoSpeak: false,
  ariaEnhanced: true
};

// Load conceptual engine state and settings
async function loadState() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['settings', 'conversationHistory'], async (result) => {
      if (result.settings) {
        settings = { ...settings, ...result.settings };
      }
      if (result.conversationHistory) {
        conversationHistory = result.conversationHistory;
        renderConversation();
      }
      
      // Load conceptual engine state
      await CONCEPTUAL_ENGINE.loadState();
      
      // Apply dark mode
      if (settings.darkMode) {
        app.classList.add('dark');
        document.documentElement.classList.add('dark');
      }
      
      // Update status indicator with conceptual stats
      updateStatusIndicator();
      
      resolve();
    });
  });
}

function updateStatusIndicator() {
  const stats = CONCEPTUAL_ENGINE.getStats();
  if (statusIndicator) {
    statusIndicator.innerHTML = `
      <span class="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
      <span>Loop Active | ${stats.fingerprints} fingerprints | ${stats.iteration} iterations</span>
    `;
  }
}

// Send message through conceptual loop instead of API
async function sendMessageToLoop(message) {
    // Show typing indicator
    typingIndicator.classList.remove('hidden');
    scrollToBottom();
    
    // Simulate conceptual processing delay (the loop "spins")
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
    
    // Run through conceptual engine
    const result = CONCEPTUAL_ENGINE.run(message);
    
    // Hide typing indicator
    typingIndicator.classList.add('hidden');
    
    // Update status with new stats
    updateStatusIndicator();
    
    return result;
}

// Send message (main entry point)
async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;
    
    // Add user message to UI
    addMessageToDOM({ role: 'user', content: message });
    conversationHistory.push({ role: 'user', content: message });
    
    // Clear input
    messageInput.value = '';
    updateCharCount();
    
    // Get response from conceptual loop
    const response = await sendMessageToLoop(message);
    
    // Format response for display
    const displayContent = response.output;
    
    // Add assistant response to UI
    addMessageToDOM({ role: 'assistant', content: displayContent });
    conversationHistory.push({ role: 'assistant', content: displayContent });
    
    // Save conversation
    saveState();
    
    // Auto-speak if enabled
    if (settings.autoSpeak) {
        speakText(displayContent);
    }
    
    // Show fingerprint count in toast occasionally
    if (response.fingerprint && response.fingerprint.iteration % 5 === 0) {
        showToast(`🔒 Fingerprint captured | Loop iteration: ${response.iteration}`);
    }
}

// Add message to DOM (updated to handle glyphs)
function addMessageToDOM(message) {
    const isUser = message.role === 'user';
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `flex gap-3 ${isUser ? 'justify-end flex-row-reverse' : ''} mb-4`;
    messageDiv.setAttribute('role', 'article');
    messageDiv.setAttribute('aria-label', `${isUser ? 'Your' : 'AI'} message`);
    
    if (!isUser) {
        const avatar = document.createElement('div');
        avatar.className = 'w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1';
        avatar.setAttribute('aria-hidden', 'true');
        avatar.innerHTML = '<i data-lucide="sparkles" class="w-4 h-4 text-white"></i>';
        messageDiv.appendChild(avatar);
    }
    
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'flex-1 max-w-[85%]';
    
    const bubble = document.createElement('div');
    bubble.className = isUser 
        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl rounded-tr-sm p-3 shadow-sm'
        : 'bg-white dark:bg-slate-700 rounded-2xl rounded-tl-sm p-3 shadow-sm border border-slate-200 dark:border-slate-600';
    
    // Preserve glyphs and formatting
    bubble.innerHTML = `<p class="text-sm ${!isUser ? 'text-slate-700 dark:text-slate-200' : 'text-white'} whitespace-pre-wrap break-words">${escapeHtml(message.content)}</p>`;
    
    contentWrapper.appendChild(bubble);
    
    const timeSpan = document.createElement('span');
    timeSpan.className = 'text-xs text-slate-400 dark:text-slate-500 mt-1 block';
    timeSpan.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    contentWrapper.appendChild(timeSpan);
    
    messageDiv.appendChild(contentWrapper);
    messagesContainer.appendChild(messageDiv);
    
    // Re-render icons
    lucide.createIcons();
    scrollToBottom();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Scroll to bottom of chat
function scrollToBottom() {
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Update character counter
function updateCharCount() {
    const length = messageInput.value.length;
    charCount.textContent = `${length}/4000`;
}

// Show toast notification
function showToast(message, duration = 3000) {
    toast.textContent = message;
    toast.classList.remove('opacity-0', 'translate-y-2');
    toast.classList.add('opacity-100', 'translate-y-0');
    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-2');
        toast.classList.remove('opacity-100', 'translate-y-0');
    }, duration);
}

// Text-to-speech
function speakText(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
    }
}

// Save state to chrome.storage
function saveState() {
    chrome.storage.local.set({
        settings,
        conversationHistory: conversationHistory.slice(-100) // Keep last 100 messages
    });
}

// Clear conversation
function clearConversation() {
    conversationHistory = [];
    messagesContainer.innerHTML = '';
    
    // Add welcome message
    const welcomeMsg = {
        role: 'assistant',
        content: "🌀 Conceptual loop active. The kernel is `x^x = 0`. I don't provide answers—I hold questions in superposition. Send me anything, and I'll transform it through `? → ! → x → ?` and return it unresolved.\n\nWhat would you like to feed through the loop?"
    };
    conversationHistory.push(welcomeMsg);
    addMessageToDOM(welcomeMsg);
    saveState();
    showToast('Conversation cleared. Loop continues.');
}

// Render conversation from history
function renderConversation() {
    messagesContainer.innerHTML = '';
    if (conversationHistory.length === 0) {
        const welcomeMsg = {
            role: 'assistant',
            content: "🌀 Conceptual loop active. The kernel is `x^x = 0`. I don't provide answers—I hold questions in superposition. Send me anything, and I'll transform it through `? → ! → x → ?` and return it unresolved.\n\nWhat would you like to feed through the loop?"
        };
        conversationHistory.push(welcomeMsg);
        addMessageToDOM(welcomeMsg);
    } else {
        conversationHistory.forEach(msg => addMessageToDOM(msg));
    }
    scrollToBottom();
}

// Sandbox controls
function openSandbox() {
    sandboxPanel.classList.remove('hidden');
    sandboxPanel.classList.add('flex');
    if (sandboxFrame && !sandboxFrame.src.includes('sandbox.html')) {
        sandboxFrame.src = 'sandbox.html';
    }
}

function closeSandboxPanel() {
    sandboxPanel.classList.add('hidden');
    sandboxPanel.classList.remove('flex');
}

// ============================================================
// Event Listeners
// ============================================================

sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});
messageInput.addEventListener('input', updateCharCount);

clearChatBtn.addEventListener('click', clearConversation);

// Theme toggle
themeToggle.addEventListener('click', () => {
    settings.darkMode = !settings.darkMode;
    if (settings.darkMode) {
        app.classList.add('dark');
        document.documentElement.classList.add('dark');
    } else {
        app.classList.remove('dark');
        document.documentElement.classList.remove('dark');
    }
    saveState();
    lucide.createIcons();
});

// Settings modal
settingsBtn.addEventListener('click', () => {
    // Load current settings into modal
    document.getElementById('apiEndpoint').value = settings.apiEndpoint || '';
    document.getElementById('apiKey').value = settings.apiKey || '';
    document.getElementById('modelSelect').value = settings.model || 'gpt-3.5-turbo';
    document.getElementById('darkModeToggle') && (document.getElementById('darkModeToggle').setAttribute('aria-checked', settings.darkMode));
    document.getElementById('autoSpeakToggle') && (document.getElementById('autoSpeakToggle').setAttribute('aria-checked', settings.autoSpeak));
    document.getElementById('ariaEnhancedToggle') && (document.getElementById('ariaEnhancedToggle').setAttribute('aria-checked', settings.ariaEnhanced));
    
    settingsModal.classList.remove('hidden');
    settingsModal.classList.add('flex');
});

closeSettings.addEventListener('click', () => {
    settingsModal.classList.add('hidden');
    settingsModal.classList.remove('flex');
});

// Save settings from modal
document.getElementById('saveSettings')?.addEventListener('click', () => {
    settings.apiEndpoint = document.getElementById('apiEndpoint').value;
    settings.apiKey = document.getElementById('apiKey').value;
    settings.model = document.getElementById('modelSelect').value;
    
    // Note: API settings are ignored by conceptual engine - they're kept for compatibility
    showToast('Settings saved. Conceptual loop does not require API keys.');
    settingsModal.classList.add('hidden');
    settingsModal.classList.remove('flex');
    saveState();
});

// Reset settings
document.getElementById('resetSettings')?.addEventListener('click', () => {
    settings = {
        apiEndpoint: '',
        apiKey: '',
        model: 'gpt-3.5-turbo',
        darkMode: false,
        autoSpeak: false,
        ariaEnhanced: true
    };
    document.getElementById('apiEndpoint').value = '';
    document.getElementById('apiKey').value = '';
    document.getElementById('modelSelect').value = 'gpt-3.5-turbo';
    showToast('Settings reset to default');
});

// Dark mode toggle in modal
document.getElementById('darkModeToggle')?.addEventListener('click', () => {
    settings.darkMode = !settings.darkMode;
    const toggle = document.getElementById('darkModeToggle');
    const span = toggle.querySelector('span');
    if (settings.darkMode) {
        app.classList.add('dark');
        span.style.transform = 'translateX(24px)';
        toggle.setAttribute('aria-checked', 'true');
    } else {
        app.classList.remove('dark');
        span.style.transform = 'translateX(0)';
        toggle.setAttribute('aria-checked', 'false');
    }
    saveState();
});

// Auto-speak toggle
document.getElementById('autoSpeakToggle')?.addEventListener('click', () => {
    settings.autoSpeak = !settings.autoSpeak;
    const toggle = document.getElementById('autoSpeakToggle');
    const span = toggle.querySelector('span');
    if (settings.autoSpeak) {
        span.style.transform = 'translateX(24px)';
        toggle.setAttribute('aria-checked', 'true');
        showToast('Auto-speak enabled');
    } else {
        span.style.transform = 'translateX(0)';
        toggle.setAttribute('aria-checked', 'false');
        showToast('Auto-speak disabled');
    }
    saveState();
});

// ARIA enhanced toggle
document.getElementById('ariaEnhancedToggle')?.addEventListener('click', () => {
    settings.ariaEnhanced = !settings.ariaEnhanced;
    const toggle = document.getElementById('ariaEnhancedToggle');
    const span = toggle.querySelector('span');
    if (settings.ariaEnhanced) {
        span.style.transform = 'translateX(24px)';
        toggle.setAttribute('aria-checked', 'true');
        showToast('Enhanced ARIA mode enabled');
    } else {
        span.style.transform = 'translateX(0)';
        toggle.setAttribute('aria-checked', 'false');
        showToast('Enhanced ARIA mode disabled');
    }
    saveState();
});

// Sandbox
sandboxBtn?.addEventListener('click', openSandbox);
closeSandbox?.addEventListener('click', closeSandboxPanel);
sandboxPanel?.addEventListener('click', (e) => {
    if (e.target === sandboxPanel) closeSandboxPanel();
});

// Voice input
voiceBtn?.addEventListener('click', () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            messageInput.value = transcript;
            updateCharCount();
            sendMessage();
        };
        
        recognition.onerror = () => {
            showToast('Voice recognition failed. Please type your message.');
        };
        
        recognition.start();
        showToast('Listening...');
    } else {
        showToast('Voice input not supported in this browser');
    }
});

// Quick action buttons
document.querySelectorAll('.quick-action').forEach(btn => {
    btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        messageInput.value = action;
        updateCharCount();
        sendMessage();
    });
});

// Initialize app
loadState().then(() => {
    updateCharCount();
    console.log('🌀 Conceptual loop engine loaded');
    console.log(`   Fingerprints: ${CONCEPTUAL_ENGINE.fingerprints.length}`);
    console.log(`   Iterations: ${CONCEPTUAL_ENGINE.iteration}`);
    console.log(`   Kernel: x^x = 0`);
    console.log(`   Cycle: ? → ! → x → ?`);
    showToast('🌀 Conceptual loop active. No API keys needed.', 2000);
});