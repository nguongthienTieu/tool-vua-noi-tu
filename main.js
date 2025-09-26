const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const WordChainHelper = require('./index.js');

// Disable sandboxing for compatibility in development environments
app.commandLine.appendSwitch('--no-sandbox');
app.commandLine.appendSwitch('--disable-dev-shm-usage');
app.commandLine.appendSwitch('--disable-gpu-sandbox');
app.commandLine.appendSwitch('--disable-setuid-sandbox');
app.commandLine.appendSwitch('--disable-seccomp-filter-sandbox');
app.commandLine.appendSwitch('--disable-web-security');

// Disable GPU for headless environments
if (process.env.CI || process.env.HEADLESS) {
    app.commandLine.appendSwitch('--disable-gpu');
    app.commandLine.appendSwitch('--headless');
}

class ElectronWordChainApp {
    constructor() {
        this.mainWindow = null;
        this.wordChainHelper = new WordChainHelper();
    }

    createWindow() {
        // Create the browser window with small size and always on top
        this.mainWindow = new BrowserWindow({
            width: 400,
            height: 600,
            minWidth: 300,
            minHeight: 400,
            maxWidth: 800,
            maxHeight: 900,
            alwaysOnTop: true,
            resizable: true,
            frame: true,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                preload: path.join(__dirname, 'preload.js')
            },
            icon: path.join(__dirname, 'assets', 'icon.png'), // optional icon
            title: 'Goat nối từ Beng'
        });

        // Load the HTML file
        this.mainWindow.loadFile('renderer.html');

        // Optional: Open DevTools in development
        if (process.env.NODE_ENV === 'development') {
            this.mainWindow.webContents.openDevTools();
        }

        // Handle window closed
        this.mainWindow.on('closed', () => {
            this.mainWindow = null;
        });

        // Set up IPC handlers
        this.setupIPC();
    }

    setupIPC() {
        // Handle word chain operations
        ipcMain.handle('can-chain', async (event, word1, word2) => {
            return this.wordChainHelper.canChain(word1, word2);
        });

        ipcMain.handle('find-next-words', async (event, word) => {
            return this.wordChainHelper.findNextWords(word, true, true); // Return simple array for backward compatibility
        });

        ipcMain.handle('find-next-words-enhanced', async (event, word) => {
            return this.wordChainHelper.findNextWords(word, true, false); // Return enhanced format with dead word info
        });

        // New paginated handlers
        ipcMain.handle('find-next-words-paginated', async (event, word, maxResults, excludeWords = []) => {
            return this.wordChainHelper.findNextWordsPaginated(word, maxResults, excludeWords);
        });

        ipcMain.handle('find-previous-words-paginated', async (event, word, maxResults, excludeWords = []) => {
            return this.wordChainHelper.findPreviousWordsPaginated(word, maxResults, excludeWords);
        });

        ipcMain.handle('find-previous-words', async (event, word) => {
            return this.wordChainHelper.findPreviousWords(word);
        });

        ipcMain.handle('validate-chain', async (event, chain) => {
            return this.wordChainHelper.validateChain(chain);
        });

        ipcMain.handle('generate-word-chains', async (event, word, maxChains, maxLength) => {
            return this.wordChainHelper.generateWordChains(word, maxChains, maxLength);
        });

        ipcMain.handle('find-chains-to-dead-words', async (event, word, maxChains, maxLength) => {
            return this.wordChainHelper.findChainsToDeadWords(word, maxChains, maxLength);
        });

        ipcMain.handle('has-word', async (event, word) => {
            return this.wordChainHelper.hasWord(word);
        });

        ipcMain.handle('is-valid-compound-word', async (event, word) => {
            return this.wordChainHelper.isValidCompoundWord(word);
        });

        ipcMain.handle('validate-word-complete', async (event, word) => {
            return this.wordChainHelper.validateWordComplete(word);
        });

        ipcMain.handle('get-stats', async (event) => {
            return this.wordChainHelper.getStats();
        });

        ipcMain.handle('add-words', async (event, words) => {
            return this.wordChainHelper.addWords(words, true);
        });

        ipcMain.handle('remove-words', async (event, words) => {
            return this.wordChainHelper.removeWords(words);
        });

        ipcMain.handle('get-user-words', async (event) => {
            return this.wordChainHelper.getUserWords();
        });

        ipcMain.handle('get-random-words', async (event, count = 10) => {
            // Get examples for both languages
            const currentLanguage = this.wordChainHelper.getLanguage();
            
            // Get Vietnamese examples
            this.wordChainHelper.setLanguage('vietnamese');
            const vietnameseWords = this.wordChainHelper.getAllWords();
            const shuffledVietnamese = vietnameseWords.sort(() => 0.5 - Math.random()).slice(0, count);
            
            // Get English examples  
            this.wordChainHelper.setLanguage('english');
            const englishWords = this.wordChainHelper.getAllWords();
            const shuffledEnglish = englishWords.sort(() => 0.5 - Math.random()).slice(0, count);
            
            // Restore original language
            this.wordChainHelper.setLanguage(currentLanguage);
            
            return {
                vietnamese: shuffledVietnamese,
                english: shuffledEnglish,
                currentLanguage: currentLanguage
            };
        });

        // Handle language switching
        ipcMain.handle('set-language', async (event, language) => {
            this.wordChainHelper.setLanguage(language);
            return this.wordChainHelper.getLanguage();
        });

        ipcMain.handle('get-language', async (event) => {
            return this.wordChainHelper.getLanguage();
        });

        // Handle window controls
        ipcMain.handle('toggle-always-on-top', async (event) => {
            const isOnTop = this.mainWindow.isAlwaysOnTop();
            this.mainWindow.setAlwaysOnTop(!isOnTop);
            return !isOnTop;
        });
    }

    initialize() {
        // This method will be called when Electron has finished initialization
        app.whenReady().then(() => {
            this.createWindow();

            app.on('activate', () => {
                // On macOS, re-create window when dock icon is clicked
                if (BrowserWindow.getAllWindows().length === 0) {
                    this.createWindow();
                }
            });
        });

        // Quit when all windows are closed, except on macOS
        app.on('window-all-closed', () => {
            if (process.platform !== 'darwin') {
                app.quit();
            }
        });
    }
}

// Create and initialize the app
const electronApp = new ElectronWordChainApp();
electronApp.initialize();