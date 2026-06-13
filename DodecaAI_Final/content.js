// Content script for page interaction
(function() {
  'use strict';
  
  // Listen for messages from popup or background
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'extractContent') {
      const content = extractPageContent();
      sendResponse({ content });
    }
    
    if (request.action === 'extractARIA') {
      const ariaInfo = extractARIAInfo();
      sendResponse({ ariaInfo });
    }
    
    if (request.action === 'triggerAnalysis') {
      injectAnalysisUI();
      sendResponse({ success: true });
    }
    
    if (request.action === 'triggerAccessibilityCheck') {
      injectAccessibilityUI();
      sendResponse({ success: true });
    }
    
    return true;
  });
  
  // Extract main page content
  function extractPageContent() {
    const title = document.title;
    const metaDescription = document.querySelector('meta[name="description"]')?.content || '';
    const h1 = document.querySelector('h1')?.textContent || '';
    const mainContent = document.querySelector('main')?.textContent?.substring(0, 5000) || 
                        document.querySelector('article')?.textContent?.substring(0, 5000) ||
                        document.body.textContent?.substring(0, 5000);
    
    return {
      title,
      metaDescription,
      h1,
      mainContent: mainContent?.replace(/\s+/g, ' ').trim(),
      url: window.location.href
    };
  }
  
  // Extract ARIA information
  function extractARIAInfo() {
    const ariaElements = [];
    const elements = document.querySelectorAll('[role], [aria-label], [aria-labelledby], [aria-describedby], [aria-hidden]');
    
    elements.forEach((el, index) => {
      if (index > 100) return; // Limit to prevent overwhelming data
      
      const ariaData = {
        tag: el.tagName.toLowerCase(),
        id: el.id || '',
        classes: Array.from(el.classList).join(' '),
        text: el.textContent?.substring(0, 100) || '',
        role: el.getAttribute('role'),
        ariaLabel: el.getAttribute('aria-label'),
        ariaLabelledby: el.getAttribute('aria-labelledby'),
        ariaDescribedby: el.getAttribute('aria-describedby'),
        ariaHidden: el.getAttribute('aria-hidden'),
        ariaExpanded: el.getAttribute('aria-expanded'),
        ariaLive: el.getAttribute('aria-live')
      };
      
      ariaElements.push(ariaData);
    });
    
    return {
      totalElements: elements.length,
      elements: ariaElements,
      landmarkRoles: document.querySelectorAll('[role="banner"], [role="navigation"], [role="main"], [role="complementary"], [role="contentinfo"]').length
    };
  }
  
  // Inject analysis UI overlay
  function injectAnalysisUI() {
    removeExistingUI();
    
    const overlay = document.createElement('div');
    overlay.id = 'ai-companion-overlay';
    overlay.innerHTML = `
      <div style="
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 400px;
        max-height: 500px;
        background: white;
        border-radius: 16px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        z-index: 999999;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      ">
        <div style="
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 16px;
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
        ">
          <h2 style="margin: 0; font-size: 16px; font-weight: 600;">AI Page Analysis ✨</h2>
          <button onclick="document.getElementById('ai-companion-overlay').remove()" style="
            background: rgba(255,255,255,0.2);
            border: none;
            color: white;
            width: 28px;
            height: 28px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
          ">✕</button>
        </div>
        <div style="
          padding: 16px;
          overflow-y: auto;
          max-height: 400px;
          color: #1a1a1a;
          font-size: 14px;
          line-height: 1.6;
        " id="analysis-content">
          <div style="
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px;
            background: #f0f0f0;
            border-radius: 12px;
          ">
            <div style="
              width: 24px;
              height: 24px;
              border: 3px solid #667eea;
              border-top-color: transparent;
              border-radius: 50%;
              animation: spin 0.8s linear infinite;
            "></div>
            <span>Analyzing page content...</span>
          </div>
        </div>
      </div>
      <style>
        @keyframes spin { to { transform: rotate(360deg); } }
      </style>
    `;
    
    document.body.appendChild(overlay);
    
    // Send page content for analysis
    const pageContent = extractPageContent();
    chrome.runtime.sendMessage({
      action: 'analyzeContent',
      content: pageContent
    }, (response) => {
      if (response) {
        updateAnalysisOverlay(response.analysis);
      }
    });
  }
  
  // Inject accessibility UI overlay
  function injectAccessibilityUI() {
    removeExistingUI();
    
    const ariaInfo = extractARIAInfo();
    
    const overlay = document.createElement('div');
    overlay.id = 'ai-companion-overlay';
    overlay.innerHTML = `
      <div style="
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 400px;
        max-height: 500px;
        background: white;
        border-radius: 16px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        z-index: 999999;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      ">
        <div style="
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          padding: 16px;
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
        ">
          <h2 style="margin: 0; font-size: 16px; font-weight: 600;">Accessibility Check ♿</h2>
          <button onclick="document.getElementById('ai-companion-overlay').remove()" style="
            background: rgba(255,255,255,0.2);
            border: none;
            color: white;
            width: 28px;
            height: 28px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
          ">✕</button>
        </div>
        <div style="padding: 16px; overflow-y: auto; max-height: 400px;">
          <div style="
            padding: 12px;
            background: #f0fff4;
            border: 1px solid #c6f6d5;
            border-radius: 12px;
            margin-bottom: 12px;
          ">
            <strong style="color: #2f855a;">✅ Page Analysis</strong>
            <p style="margin: 8px 0 0 0; color: #276749; font-size: 13px;">
              Found ${ariaInfo.totalElements} ARIA elements with ${ariaInfo.landmarkRoles} landmark roles.
            </p>
          </div>
          <div style="
            padding: 12px;
            background: #fffff0;
            border: 1px solid #fefcbf;
            border-radius: 12px;
            margin-bottom: 12px;
          ">
            <strong style="color: #975a16;">⚠️ Recommendations</strong>
            <ul style="margin: 8px 0 0 0; padding-left: 20px; color: #744210; font-size: 13px;">
              <li>Ensure all interactive elements have accessible names</li>
              <li>Verify heading hierarchy is logical</li>
              <li>Check color contrast ratios</li>
            </ul>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(overlay);
  }
  
  function removeExistingUI() {
    const existing = document.getElementById('ai-companion-overlay');
    if (existing) existing.remove();
  }
  
  function updateAnalysisOverlay(analysis) {
    const contentDiv = document.getElementById('analysis-content');
    if (contentDiv) {
      contentDiv.innerHTML = `
        <div style="
          padding: 12px;
          background: #f0fff4;
          border: 1px solid #c6f6d5;
          border-radius: 12px;
          margin-bottom: 12px;
        ">
          <strong style="color: #2f855a;">📊 Page Summary</strong>
          <p style="margin: 8px 0 0 0; color: #276749; font-size: 13px;">
            ${analysis || 'This page contains various elements and content. Use the extension popup for a detailed AI-powered analysis.'}
          </p>
        </div>
      `;
    }
  }
  
  console.log('AI Companion content script loaded');
})();