const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const WordChainHelper = require('./index.js');

// Disable sandboxing for compatibility in development environments
app.commandLine.appendSwitch('--no-sandbox');
app.commandLine.appendSwitch('--disable-dev-shm-usage');
app.commandLine.appendSwitch('--disable-gpu-sandbox');

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
            title: 'Goat Tiếng Việt Beng'
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

        ipcMain.handle('find-previous-words', async (event, word) => {
            return this.wordChainHelper.findPreviousWords(word);
        });

        ipcMain.handle('validate-chain', async (event, chain) => {
            return this.wordChainHelper.validateChain(chain);
        });

        ipcMain.handle('generate-word-chains', async (event, word, maxChains, maxLength) => {
            return this.wordChainHelper.generateWordChains(word, maxChains, maxLength);
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
            const allWords = this.wordChainHelper.getAllWords();
            const shuffled = allWords.sort(() => 0.5 - Math.random());
            return shuffled.slice(0, count);
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