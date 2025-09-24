const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    // Word chain operations
    canChain: (word1, word2) => ipcRenderer.invoke('can-chain', word1, word2),
    findNextWords: (word) => ipcRenderer.invoke('find-next-words', word),
    findPreviousWords: (word) => ipcRenderer.invoke('find-previous-words', word),
    validateChain: (chain) => ipcRenderer.invoke('validate-chain', chain),
    getStats: () => ipcRenderer.invoke('get-stats'),
    addWords: (words) => ipcRenderer.invoke('add-words', words),
    getRandomWords: (count) => ipcRenderer.invoke('get-random-words', count),
    
    // Window controls
    toggleAlwaysOnTop: () => ipcRenderer.invoke('toggle-always-on-top')
});