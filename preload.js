const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    // Word chain operations
    canChain: (word1, word2) => ipcRenderer.invoke('can-chain', word1, word2),
    findNextWords: (word) => ipcRenderer.invoke('find-next-words', word),
    findNextWordsEnhanced: (word) => ipcRenderer.invoke('find-next-words-enhanced', word),
    findPreviousWords: (word) => ipcRenderer.invoke('find-previous-words', word),
    validateChain: (chain) => ipcRenderer.invoke('validate-chain', chain),
    generateWordChains: (word, maxChains, maxLength) => ipcRenderer.invoke('generate-word-chains', word, maxChains, maxLength),
    findChainsToDeadWords: (word, maxChains, maxLength) => ipcRenderer.invoke('find-chains-to-dead-words', word, maxChains, maxLength),
    hasWord: (word) => ipcRenderer.invoke('has-word', word),
    isValidCompoundWord: (word) => ipcRenderer.invoke('is-valid-compound-word', word),
    getStats: () => ipcRenderer.invoke('get-stats'),
    addWords: (words) => ipcRenderer.invoke('add-words', words),
    removeWords: (words) => ipcRenderer.invoke('remove-words', words),
    getUserWords: () => ipcRenderer.invoke('get-user-words'),
    getRandomWords: (count) => ipcRenderer.invoke('get-random-words', count),
    
    // Window controls
    toggleAlwaysOnTop: () => ipcRenderer.invoke('toggle-always-on-top')
});