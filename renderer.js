// DOM elements - wrapped in functions to ensure DOM is ready
const getTabButtons = () => document.querySelectorAll('.tab-btn');
const getTabPanels = () => document.querySelectorAll('.tab-panel');
const getTogglePinBtn = () => document.getElementById('togglePinBtn');
const getShowExamplesBtn = () => document.getElementById('showExamplesBtn');
const getExamplesArea = () => document.getElementById('examplesArea');

// Stats elements
const getTotalWordsEl = () => document.getElementById('totalWords');
const getUserWordsEl = () => document.getElementById('userWords');
const getLanguageSelect = () => document.getElementById('languageSelect');

// Find tab elements
const getFindWordInput = () => document.getElementById('findWord');
const getFindNextBtn = () => document.getElementById('findNextBtn');
const getFindPrevBtn = () => document.getElementById('findPrevBtn');
const getFindResult = () => document.getElementById('findResult');

// Manage words tab elements
const getNewWordsInput = () => document.getElementById('newWords');
const getAddWordsBtn = () => document.getElementById('addWordsBtn');
const getRemoveWordsBtn = () => document.getElementById('removeWordsBtn');
const getAddResult = () => document.getElementById('addResult');
const getUserWordsList = () => document.getElementById('userWordsList');

// Pagination elements
const getPaginationControls = () => document.getElementById('paginationControls');
const getLoadMoreNextBtn = () => document.getElementById('loadMoreNextBtn');
const getLoadMorePrevBtn = () => document.getElementById('loadMorePrevBtn');

class WordChainApp {
    constructor() {
        this.isPinned = true; // Start pinned by default
        this.currentSearchWord = '';
        this.currentDirection = null; // 'next' or 'prev'
        this.shownWords = []; // Keep track of shown words for pagination
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

        // Language selection
        const languageSelect = getLanguageSelect();
        if (languageSelect) {
            languageSelect.addEventListener('change', () => this.changeLanguage());
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

        // Pagination controls
        const loadMoreNextBtn = getLoadMoreNextBtn();
        const loadMorePrevBtn = getLoadMorePrevBtn();
        
        if (loadMoreNextBtn) {
            loadMoreNextBtn.addEventListener('click', () => this.loadMoreWords('next'));
        }
        if (loadMorePrevBtn) {
            loadMorePrevBtn.addEventListener('click', () => this.loadMoreWords('prev'));
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
                const examples = await window.electronAPI.getRandomWords(15);
                examplesArea.innerHTML = this.createSeparatedExamplesList(examples);
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

        // Reset pagination state for new searches
        this.currentSearchWord = word;
        this.currentDirection = direction;
        this.shownWords = [];

        // Hide pagination controls initially
        const paginationControls = getPaginationControls();
        if (paginationControls) {
            paginationControls.style.display = 'none';
        }

        try {
            // Check language to determine if we need pagination
            const currentLanguage = await window.electronAPI.getLanguage();
            const isEnglish = currentLanguage === 'english';
            
            let result;
            if (isEnglish) {
                // Use paginated search for English
                if (direction === 'next') {
                    result = await window.electronAPI.findNextWordsPaginated(word, 10, []);
                } else {
                    result = await window.electronAPI.findPreviousWordsPaginated(word, 10, []);
                }
                
                if (result.words && result.words.length > 0) {
                    const words = Array.isArray(result.words[0]) || typeof result.words[0] === 'string' 
                        ? result.words.map(w => typeof w === 'string' ? { word: w, isDead: false } : w)
                        : result.words;
                    
                    this.shownWords = words.map(w => w.word || w);
                    this.displayWordResults(direction, word, words, result.hasMore);
                } else {
                    this.displayNoResults(direction, word);
                }
            } else {
                // Use traditional search for Vietnamese
                let words;
                if (direction === 'next') {
                    words = await window.electronAPI.findNextWordsEnhanced(word);
                } else {
                    words = await window.electronAPI.findPreviousWords(word);
                    words = words.map(word => ({ word, isDead: false }));
                }

                if (words.length > 0) {
                    // For Vietnamese, show all results but limit display to 15
                    const displayWords = words.slice(0, 15);
                    this.shownWords = displayWords.map(w => w.word || w);
                    this.displayWordResults(direction, word, displayWords, words.length > 15);
                } else {
                    this.displayNoResults(direction, word);
                }
            }
        } catch (error) {
            const findResult = getFindResult();
            this.showResult(findResult, 'Lỗi khi tìm kiếm từ', 'error');
        }
    }

    async loadMoreWords(direction) {
        if (!this.currentSearchWord || this.currentDirection !== direction) return;

        try {
            const currentLanguage = await window.electronAPI.getLanguage();
            const isEnglish = currentLanguage === 'english';
            
            if (!isEnglish) {
                // Vietnamese doesn't need pagination, this shouldn't be called
                return;
            }

            let result;
            if (direction === 'next') {
                result = await window.electronAPI.findNextWordsPaginated(this.currentSearchWord, 10, this.shownWords);
            } else {
                result = await window.electronAPI.findPreviousWordsPaginated(this.currentSearchWord, 10, this.shownWords);
            }
            
            if (result.words && result.words.length > 0) {
                const words = Array.isArray(result.words[0]) || typeof result.words[0] === 'string' 
                    ? result.words.map(w => typeof w === 'string' ? { word: w, isDead: false } : w)
                    : result.words;
                
                // Add new words to shown list
                const newWords = words.map(w => w.word || w);
                this.shownWords.push(...newWords);
                
                // Append results to existing display
                this.appendWordResults(words, result.hasMore);
            }
        } catch (error) {
            console.error('Error loading more words:', error);
        }
    }

    displayWordResults(direction, searchWord, words, hasMore) {
        const findResult = getFindResult();
        const title = direction === 'next' 
            ? `Các từ có thể theo sau "${searchWord}":` 
            : `Các từ có thể đứng trước "${searchWord}":`;
        
        const wordList = this.createEnhancedWordList(words);
        
        // Show dead words count if any
        const deadCount = words.filter(item => item.isDead).length;
        const deadInfo = deadCount > 0 ? `<p style="margin: 4px 0; font-size: 11px; color: #856404;">💀 ${deadCount} từ "kết thúc" (có thể kết thúc trò chơi)</p>` : '';
        
        this.showResult(findResult, `<p style="margin-bottom: 8px;">${title}</p>${deadInfo}${wordList}`, 'success');
        
        // Show pagination controls if there are more words
        this.updatePaginationControls(hasMore);
    }

    appendWordResults(words, hasMore) {
        const findResult = getFindResult();
        const wordList = this.createEnhancedWordList(words);
        
        // Append new words to existing results
        findResult.innerHTML += wordList;
        
        // Update pagination controls
        this.updatePaginationControls(hasMore);
        
        // Re-attach click handlers
        this.showResult(findResult, findResult.innerHTML, 'success');
    }

    displayNoResults(direction, searchWord) {
        const findResult = getFindResult();
        const message = direction === 'next' 
            ? `Không tìm thấy từ nào có thể theo sau "${searchWord}"`
            : `Không tìm thấy từ nào có thể đứng trước "${searchWord}"`;
        
        this.showResult(findResult, message, 'info');
    }

    updatePaginationControls(hasMore) {
        const paginationControls = getPaginationControls();
        
        // Always hide pagination controls for English as requested
        if (paginationControls) {
            paginationControls.style.display = 'none';
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

    async loadUserWords() {
        try {
            const currentLanguage = await window.electronAPI.getLanguage();
            const userWords = await window.electronAPI.getUserWords();
            const userWordsList = getUserWordsList();
            
            if (userWordsList) {
                if (userWords.length > 0) {
                    const languageLabel = currentLanguage === 'vietnamese' ? 'Tiếng Việt' : 'English';
                    const wordList = this.createWordList(userWords);
                    userWordsList.innerHTML = `
                        <div class="user-words-language-section">
                            <h4 style="margin: 0 0 8px 0; color: #333; font-size: 12px;">${languageLabel}:</h4>
                            ${wordList}
                        </div>
                    `;
                } else {
                    const currentLanguage = await window.electronAPI.getLanguage();
                    const languageLabel = currentLanguage === 'vietnamese' ? 'tiếng Việt' : 'tiếng Anh';
                    userWordsList.innerHTML = `<p style="color: #666; font-size: 11px; margin: 0;">Chưa có từ ${languageLabel} nào được thêm bởi người dùng.</p>`;
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

    createEnhancedWordList(words) {
        return `<div class="word-list">${words.map(item => {
            const word = item.word || item;
            const isDead = item.isDead || false;
            const deadClass = isDead ? ' dead-word' : '';
            const deadIcon = isDead ? '💀 ' : '';
            return `<span class="word-item${deadClass}" title="${isDead ? 'Từ kết thúc - ' : ''}Nhấp để sao chép">${deadIcon}${word}</span>`;
        }).join('')}</div>`;
    }

    createSeparatedExamplesList(examples) {
        if (!examples || (!examples.vietnamese && !examples.english)) {
            return '<div class="examples-error">Không có từ mẫu</div>';
        }

        const vietnameseSection = examples.vietnamese && examples.vietnamese.length > 0 
            ? `<div class="language-examples-section">
                <h4 style="margin: 8px 0; color: #2c3e50; font-size: 14px; display: flex; align-items: center;">
                    🇻🇳 Tiếng Việt (${examples.vietnamese.length} từ):
                </h4>
                ${this.createWordList(examples.vietnamese)}
            </div>` 
            : '';

        const englishSection = examples.english && examples.english.length > 0 
            ? `<div class="language-examples-section">
                <h4 style="margin: 8px 0; color: #2c3e50; font-size: 14px; display: flex; align-items: center;">
                    🇺🇸 English (${examples.english.length} words):
                </h4>
                ${this.createWordList(examples.english)}
            </div>` 
            : '';

        return `<div class="separated-examples">
            ${vietnameseSection}
            ${englishSection}
        </div>`;
    }

    async changeLanguage() {
        const languageSelect = getLanguageSelect();
        if (!languageSelect) return;

        const selectedLanguage = languageSelect.value;
        try {
            await window.electronAPI.setLanguage(selectedLanguage);
            await this.loadStats();
            
            // Clear pagination state
            this.currentSearchWord = '';
            this.currentDirection = null;
            this.shownWords = [];
            
            // Hide pagination controls
            const paginationControls = getPaginationControls();
            if (paginationControls) {
                paginationControls.style.display = 'none';
            }
            
            // Clear all input fields
            const inputs = ['findWord', 'newWords'];
            inputs.forEach(id => {
                const input = document.getElementById(id);
                if (input) input.value = '';
            });

            // Clear all result areas
            const results = ['findResult', 'addResult'];
            results.forEach(id => {
                const result = document.getElementById(id);
                if (result) result.innerHTML = '';
            });

            this.showResult(document.querySelector('.result-area'), 
                `✅ Đã chuyển sang ${selectedLanguage === 'vietnamese' ? 'tiếng Việt' : 'tiếng Anh'}`, 
                'success');
        } catch (error) {
            this.showResult(document.querySelector('.result-area'), 'Lỗi khi chuyển ngôn ngữ', 'error');
        }
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