// Background service worker
chrome.runtime.onInstalled.addListener(() => {
  console.log('AI Companion extension installed');
  
  // Initialize default settings
  chrome.storage.local.get(['settings'], (result) => {
    if (!result.settings) {
      const defaultSettings = {
        apiEndpoint: '',
        apiKey: '',
        model: 'gpt-3.5-turbo',
        darkMode: false,
        autoSpeak: false,
        ariaEnhanced: true
      };
      chrome.storage.local.set({ settings: defaultSettings });
    }
  });
  
  // Create context menu
  chrome.contextMenus.create({
    id: 'analyzePage',
    title: 'Analyze this page with AI',
    contexts: ['page']
  });
  
  chrome.contextMenus.create({
    id: 'checkAccessibility',
    title: 'Check accessibility with AI',
    contexts: ['page']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'analyzePage') {
    chrome.tabs.sendMessage(tab.id, { action: 'triggerAnalysis' });
  } else if (info.menuItemId === 'checkAccessibility') {
    chrome.tabs.sendMessage(tab.id, { action: 'triggerAccessibilityCheck' });
  }
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getPageContent') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'extractContent' }, (response) => {
          sendResponse(response);
        });
      }
    });
    return true; // Keep the message channel open
  }
  
  if (request.action === 'getARIAInfo') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'extractARIA' }, (response) => {
          sendResponse(response);
        });
      }
    });
    return true;
  }
});

// Periodic check for updates
setInterval(() => {
  chrome.storage.local.get(['lastUpdate'], (result) => {
    const now = Date.now();
    if (!result.lastUpdate || now - result.lastUpdate > 3600000) {
      // Perform any periodic tasks
      chrome.storage.local.set({ lastUpdate: now });
    }
  });
}, 300000); // Every 5 minutes