/**
 * Background Service Worker for Word Chain Helper Extension
 */

// Extension installation handler
chrome.runtime.onInstalled.addListener((details) => {
    console.log('Word Chain Helper Extension installed');
    
    // Set default storage values
    chrome.storage.local.set({
        userWords: {
            vietnamese: [],
            english: []
        },
        currentLanguage: 'vietnamese'
    });
});

// Handle messages from popup (if needed in the future)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // Handle any background processing if needed
    console.log('Background received message:', message);
    sendResponse({ success: true });
});