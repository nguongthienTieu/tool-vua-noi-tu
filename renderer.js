// DOM elements - wrapped in functions to ensure DOM is ready
const getTabButtons = () => document.querySelectorAll('.tab-btn');
const getTabPanels = () => document.querySelectorAll('.tab-panel');
const getTogglePinBtn = () => document.getElementById('togglePinBtn');
const getShowExamplesBtn = () => document.getElementById('showExamplesBtn');
const getExamplesArea = () => document.getElementById('examplesArea');

// Stats elements
const getTotalWordsEl = () => document.getElementById('totalWords');
const getUserWordsEl = () => document.getElementById('userWords');

// Find tab elements
const getFindWordInput = () => document.getElementById('findWord');
const getFindNextBtn = () => document.getElementById('findNextBtn');
const getFindPrevBtn = () => document.getElementById('findPrevBtn');
const getFindResult = () => document.getElementById('findResult');

// Chains generation tab elements
const getChainsWordInput = () => document.getElementById('chainsWord');
const getMaxChainsInput = () => document.getElementById('maxChains');
const getMaxLengthInput = () => document.getElementById('maxLength');
const getGenerateChainsBtn = () => document.getElementById('generateChainsBtn');
const getChainsResult = () => document.getElementById('chainsResult');

// Manage words tab elements
const getNewWordsInput = () => document.getElementById('newWords');
const getAddWordsBtn = () => document.getElementById('addWordsBtn');
const getRemoveWordsBtn = () => document.getElementById('removeWordsBtn');
const getAddResult = () => document.getElementById('addResult');
const getUserWordsList = () => document.getElementById('userWordsList');

class WordChainApp {
    constructor() {
        this.isPinned = true; // Start pinned by default
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadStats();
        await this.loadUserWords();
    }

    setupEventListeners() {
        // Tab switching
        getTabButtons().forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });

        // Window controls
        const togglePinBtn = getTogglePinBtn();
        if (togglePinBtn) {
            togglePinBtn.addEventListener('click', () => this.togglePin());
        }
        
        // Examples toggle
        const showExamplesBtn = getShowExamplesBtn();
        if (showExamplesBtn) {
            showExamplesBtn.addEventListener('click', () => this.toggleExamples());
        }

        // Find functionality
        const findNextBtn = getFindNextBtn();
        const findPrevBtn = getFindPrevBtn();
        const findWordInput = getFindWordInput();
        
        if (findNextBtn) {
            findNextBtn.addEventListener('click', () => this.findWords('next'));
        }
        if (findPrevBtn) {
            findPrevBtn.addEventListener('click', () => this.findWords('prev'));
        }
        if (findWordInput) {
            findWordInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.findWords('next');
            });
        }

        // Generate chains
        const generateChainsBtn = getGenerateChainsBtn();
        const chainsWordInput = getChainsWordInput();
        
        if (generateChainsBtn) {
            generateChainsBtn.addEventListener('click', () => this.generateChains());
        }
        if (chainsWordInput) {
            chainsWordInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.generateChains();
            });
        }

        // Manage words
        const addWordsBtn = getAddWordsBtn();
        const removeWordsBtn = getRemoveWordsBtn();
        const newWordsInput = getNewWordsInput();
        
        if (addWordsBtn) {
            addWordsBtn.addEventListener('click', () => this.addWords());
        }
        if (removeWordsBtn) {
            removeWordsBtn.addEventListener('click', () => this.removeWords());
        }
        if (newWordsInput) {
            newWordsInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && e.ctrlKey) this.addWords();
            });
        }
    }

    async switchTab(tabName) {
        // Update button states
        getTabButtons().forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        // Update panel visibility
        getTabPanels().forEach(panel => {
            panel.classList.toggle('active', panel.id === `${tabName}-tab`);
        });

        // Load data specific to certain tabs
        if (tabName === 'manage') {
            await this.loadUserWords();
        }
    }

    async togglePin() {
        try {
            this.isPinned = await window.electronAPI.toggleAlwaysOnTop();
            const togglePinBtn = getTogglePinBtn();
            if (togglePinBtn) {
                togglePinBtn.textContent = this.isPinned ? '📌' : '📍';
                togglePinBtn.title = this.isPinned ? 'Bỏ ghim cửa sổ' : 'Ghim cửa sổ lên trên';
            }
        } catch (error) {
            console.error('Lỗi khi thay đổi trạng thái ghim cửa sổ:', error);
        }
    }

    async toggleExamples() {
        const examplesArea = getExamplesArea();
        const showExamplesBtn = getShowExamplesBtn();
        
        if (!examplesArea || !showExamplesBtn) return;
        
        if (examplesArea.style.display === 'none') {
            try {
                const examples = await window.electronAPI.getRandomWords(20);
                examplesArea.innerHTML = this.createWordList(examples);
                examplesArea.style.display = 'block';
                showExamplesBtn.textContent = 'Ẩn từ mẫu';
            } catch (error) {
                this.showResult(examplesArea, 'Lỗi khi tải từ mẫu', 'error');
            }
        } else {
            examplesArea.style.display = 'none';
            showExamplesBtn.textContent = 'Hiển thị từ mẫu';
        }
    }

    async loadStats() {
        try {
            const stats = await window.electronAPI.getStats();
            const totalWordsEl = getTotalWordsEl();
            const userWordsEl = getUserWordsEl();
            
            if (totalWordsEl) {
                totalWordsEl.textContent = stats.totalWords.toLocaleString();
            }
            if (userWordsEl) {
                userWordsEl.textContent = stats.userAddedWords.toLocaleString();
            }
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }

    async findWords(direction) {
        const findWordInput = getFindWordInput();
        const findResult = getFindResult();
        
        if (!findWordInput || !findResult) return;
        
        const word = findWordInput.value.trim();

        if (!word) {
            this.showResult(findResult, 'Vui lòng nhập từ để tìm kiếm', 'error');
            return;
        }

        try {
            let words;
            if (direction === 'next') {
                // Get enhanced format for next words with dead word detection
                words = await window.electronAPI.findNextWordsEnhanced(word);
            } else {
                // Previous words still use simple format
                words = await window.electronAPI.findPreviousWords(word);
                words = words.map(word => ({ word, isDead: false })); // Convert to enhanced format
            }

            if (words.length > 0) {
                const title = direction === 'next' 
                    ? `Các từ có thể theo sau "${word}":` 
                    : `Các từ có thể đứng trước "${word}":`;
                
                const wordList = this.createEnhancedWordList(words.slice(0, 15)); // Limit to 15 words
                const moreText = words.length > 15 ? `<p style="margin-top: 8px; font-size: 10px; color: #666;">và ${words.length - 15} từ khác...</p>` : '';
                
                // Show dead words count if any
                const deadCount = words.filter(item => item.isDead).length;
                const deadInfo = deadCount > 0 ? `<p style="margin: 4px 0; font-size: 11px; color: #856404;">💀 ${deadCount} từ "kết thúc" (có thể kết thúc trò chơi)</p>` : '';
                
                this.showResult(findResult, `<p style="margin-bottom: 8px;">${title}</p>${deadInfo}${wordList}${moreText}`, 'success');
            } else {
                const message = direction === 'next' 
                    ? `Không tìm thấy từ nào có thể theo sau "${word}"`
                    : `Không tìm thấy từ nào có thể đứng trước "${word}"`;
                
                this.showResult(findResult, message, 'info');
            }
        } catch (error) {
            this.showResult(findResult, 'Lỗi khi tìm kiếm từ', 'error');
        }
    }

    async addWords() {
        const newWordsInput = getNewWordsInput();
        const addResult = getAddResult();
        
        if (!newWordsInput || !addResult) return;
        
        const wordsText = newWordsInput.value.trim();

        if (!wordsText) {
            this.showResult(addResult, 'Vui lòng nhập từ cần thêm', 'error');
            return;
        }

        const words = wordsText.split(',').map(word => word.trim()).filter(word => word);

        if (words.length === 0) {
            this.showResult(addResult, 'Không có từ hợp lệ để thêm', 'error');
            return;
        }

        try {
            const result = await window.electronAPI.addWords(words);
            
            if (result) {
                // Display results with validation feedback
                let message = '';
                if (result.added.length > 0) {
                    message += `✅ Đã thêm ${result.added.length} từ: ${result.added.join(', ')}`;
                }
                if (result.duplicates.length > 0) {
                    if (message) message += '<br>';
                    message += `⚠️ ${result.duplicates.length} từ đã tồn tại: ${result.duplicates.join(', ')}`;
                }
                if (result.rejected.length > 0) {
                    if (message) message += '<br>';
                    message += `❌ ${result.rejected.length} từ không hợp lệ: ${result.rejected.join(', ')}`;
                }
                
                const hasSuccess = result.added.length > 0;
                this.showResult(addResult, message, hasSuccess ? 'success' : 'warning');
            } else {
                this.showResult(addResult, `Đã thêm ${words.length} từ thành công`, 'success');
            }
            
            await this.loadStats(); // Refresh stats
            await this.loadUserWords(); // Refresh user words list
            if (newWordsInput) {
                newWordsInput.value = '';
            }
        } catch (error) {
            this.showResult(addResult, 'Lỗi khi thêm từ', 'error');
        }
    }

    async removeWords() {
        const newWordsInput = getNewWordsInput();
        const addResult = getAddResult();
        
        if (!newWordsInput || !addResult) return;
        
        const wordsText = newWordsInput.value.trim();

        if (!wordsText) {
            this.showResult(addResult, 'Vui lòng nhập từ cần xóa', 'error');
            return;
        }

        const words = wordsText.split(',').map(word => word.trim()).filter(word => word);

        if (words.length === 0) {
            this.showResult(addResult, 'Không có từ hợp lệ để xóa', 'error');
            return;
        }

        try {
            const result = await window.electronAPI.removeWords(words);
            
            // Display results with validation feedback
            let message = '';
            if (result.removed.length > 0) {
                message += `✅ Đã xóa ${result.removed.length} từ: ${result.removed.join(', ')}`;
            }
            if (result.notFound.length > 0) {
                if (message) message += '<br>';
                message += `❌ ${result.notFound.length} từ không có trong danh sách người dùng: ${result.notFound.join(', ')}`;
            }
            
            const hasSuccess = result.removed.length > 0;
            this.showResult(addResult, message, hasSuccess ? 'success' : 'warning');
            
            if (hasSuccess) {
                await this.loadStats(); // Refresh stats
                await this.loadUserWords(); // Refresh user words list
                if (newWordsInput) {
                    newWordsInput.value = '';
                }
            }
        } catch (error) {
            this.showResult(addResult, 'Lỗi khi xóa từ', 'error');
        }
    }

    async generateChains() {
        const chainsWordInput = getChainsWordInput();
        const maxChainsInput = getMaxChainsInput();
        const maxLengthInput = getMaxLengthInput();
        const chainsResult = getChainsResult();
        
        if (!chainsWordInput || !maxChainsInput || !maxLengthInput || !chainsResult) return;
        
        const word = chainsWordInput.value.trim();
        const maxChains = parseInt(maxChainsInput.value) || 5;
        const maxLength = parseInt(maxLengthInput.value) || 10;

        // Get selected algorithm
        const algorithmRadio = document.querySelector('input[name="algorithm"]:checked');
        const algorithm = algorithmRadio ? algorithmRadio.value : 'bfs';

        if (!word) {
            this.showResult(chainsResult, 'Vui lòng nhập từ để tìm chuỗi', 'error');
            return;
        }

        if (maxChains < 3 || maxChains > 5) {
            this.showResult(chainsResult, 'Số chuỗi phải từ 3 đến 5', 'error');
            return;
        }

        if (maxLength < 2 || maxLength > 10) {
            this.showResult(chainsResult, 'Độ dài chuỗi phải từ 2 đến 10', 'error');
            return;
        }

        const algorithmName = algorithm === 'bfs' ? 'BFS (chuỗi ngắn nhất)' : 'DFS (tất cả đường dẫn)';
        this.showResult(chainsResult, `⏳ Đang tìm chuỗi bằng thuật toán ${algorithmName}...`, 'info');

        try {
            let chains;
            if (algorithm === 'bfs') {
                chains = await window.electronAPI.findShortestChainsBFS(word, maxChains, maxLength);
            } else {
                chains = await window.electronAPI.findAllChainsToEndDFS(word, maxChains, maxLength);
            }

            if (chains.length > 0) {
                const chainsHtml = this.createChainsDisplay(chains, algorithm);
                const gameEndingCount = chains.filter(chain => chain.isGameEnding).length;
                
                const algorithmEmoji = algorithm === 'bfs' ? '🚀' : '🌍';
                const algorithmText = algorithm === 'bfs' ? 'BFS - Ngắn nhất' : 'DFS - Tất cả đường';
                
                const summary = `<p style="margin-bottom: 15px;">${algorithmEmoji} Thuật toán ${algorithmText}: Tìm được ${chains.length} chuỗi từ "${word}" dẫn đến kết thúc:<br>` +
                              `💀 ${gameEndingCount} chuỗi kết thúc game (tất cả chuỗi đều dẫn đến kết thúc)</p>`;
                
                this.showResult(chainsResult, summary + chainsHtml, 'success');
            } else {
                this.showResult(chainsResult, `❌ Không tìm thấy chuỗi từ "${word}" dẫn đến kết thúc (có thể từ này đã là kết thúc hoặc không có đường đi)`, 'info');
            }
        } catch (error) {
            this.showResult(chainsResult, 'Lỗi khi tìm chuỗi từ', 'error');
        }
    }

    createEnhancedWordList(wordsData) {
        return `<div class="word-list">${wordsData.map(item => {
            const wordClass = item.isDead ? 'word-item dead-word' : 'word-item live-word';
            const title = item.isDead ? 'Từ "kết thúc" - có thể kết thúc trò chơi. Nhấp để sao chép.' : 'Từ "sống" - có thể tiếp tục. Nhấp để sao chép.';
            return `<span class="${wordClass}" title="${title}">${item.word}</span>`;
        }).join('')}</div>`;
    }

    createChainsDisplay(chains, algorithm = 'bfs') {
        const algorithmBadge = algorithm === 'bfs' ? '🚀 BFS' : '🌍 DFS';
        
        return chains.map((chainInfo, index) => {
            const statusClass = chainInfo.isGameEnding ? 'game-ending' : 'can-continue';
            const statusText = chainInfo.isGameEnding ? 'Kết thúc game' : 'Có thể tiếp tục';
            const algorithmInfo = chainInfo.algorithm ? ` [${chainInfo.algorithm}]` : '';
            
            return `
                <div class="chain-result-item">
                    <div class="chain-header">
                        <span class="chain-info">Chuỗi ${index + 1} (${chainInfo.length} từ) ${algorithmBadge}${algorithmInfo}</span>
                        <span class="chain-status ${statusClass}">${statusText}</span>
                    </div>
                    <div class="chain-words">${chainInfo.chain.join(' → ')}</div>
                </div>
            `;
        }).join('');
    }

    async loadUserWords() {
        try {
            const userWords = await window.electronAPI.getUserWords();
            const userWordsList = getUserWordsList();
            if (userWordsList) {
                if (userWords.length > 0) {
                    const wordList = this.createWordList(userWords);
                    userWordsList.innerHTML = wordList;
                } else {
                    userWordsList.innerHTML = '<p style="color: #666; font-size: 11px; margin: 0;">Chưa có từ nào được thêm bởi người dùng.</p>';
                }
            }
        } catch (error) {
            console.error('Lỗi khi tải từ người dùng:', error);
        }
    }

    createWordList(words) {
        return `<div class="word-list">${words.map(word => 
            `<span class="word-item" title="Nhấp để sao chép">${word}</span>`
        ).join('')}</div>`;
    }

    showResult(element, message, type = 'info') {
        element.innerHTML = message;
        element.className = `result-area ${type}`;
        
        // Add click-to-copy functionality for word items
        element.querySelectorAll('.word-item').forEach(item => {
            item.addEventListener('click', () => {
                navigator.clipboard.writeText(item.textContent);
                const originalText = item.textContent;
                item.textContent = '✓ Đã sao chép';
                setTimeout(() => {
                    item.textContent = originalText;
                }, 1000);
            });
        });
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WordChainApp();
});