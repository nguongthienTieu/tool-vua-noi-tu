/**
 * Chrome Extension Popup Script
 * Handles UI interactions and word chain functionality
 */

class WordChainExtension {
    constructor() {
        this.wordChainHelper = null;
        this.currentSearchWord = '';
        this.currentDirection = null;
        this.shownWords = [];
        this.init();
    }

    async init() {
        // Initialize the word chain helper
        this.wordChainHelper = new WordChainHelper('vietnamese');
        await this.wordChainHelper.initializeDictionaries();
        
        this.setupEventListeners();
        await this.loadStats();
        await this.loadUserWords();
        this.updatePlaceholders(this.wordChainHelper.getLanguage());
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Language selector
        const languageSelect = document.getElementById('languageSelect');
        languageSelect?.addEventListener('change', () => this.changeLanguage());

        // Find words functionality
        const findNextBtn = document.getElementById('findNextBtn');
        const findPrevBtn = document.getElementById('findPrevBtn');
        const searchWordInput = document.getElementById('searchWord');
        
        findNextBtn?.addEventListener('click', () => this.findWords('next'));
        findPrevBtn?.addEventListener('click', () => this.findWords('prev'));
        searchWordInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.findWords('next');
            }
        });

        // Load more functionality
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        loadMoreBtn?.addEventListener('click', () => this.loadMoreWords(this.currentDirection));

        // Word validation
        const validateWordBtn = document.getElementById('validateWordBtn');
        const validateWordInput = document.getElementById('validateWord');
        
        validateWordBtn?.addEventListener('click', () => this.validateWord());
        validateWordInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.validateWord();
            }
        });

        // Word management
        const addWordsBtn = document.getElementById('addWordsBtn');
        const removeWordsBtn = document.getElementById('removeWordsBtn');
        
        addWordsBtn?.addEventListener('click', () => this.addWords());
        removeWordsBtn?.addEventListener('click', () => this.removeWords());

        // Examples
        const showExamplesBtn = document.getElementById('showExamplesBtn');
        showExamplesBtn?.addEventListener('click', () => this.toggleExamples());
    }

    switchTab(tabName) {
        // Hide all panels
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        
        // Hide all tab buttons active state
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Show selected panel and button
        const selectedPanel = document.getElementById(tabName);
        const selectedBtn = document.querySelector(`[data-tab="${tabName}"]`);
        
        if (selectedPanel && selectedBtn) {
            selectedPanel.classList.add('active');
            selectedBtn.classList.add('active');
        }
    }

    async changeLanguage() {
        const languageSelect = document.getElementById('languageSelect');
        if (!languageSelect) return;

        try {
            await this.wordChainHelper.setLanguage(languageSelect.value);
            this.updatePlaceholders(languageSelect.value);
            await this.loadStats();
            await this.loadUserWords();
            
            // Clear previous results
            const searchResult = document.getElementById('searchResult');
            if (searchResult) searchResult.innerHTML = '';
            
            this.showResult(
                document.querySelector('.result-area'),
                `Đã chuyển sang ${languageSelect.value === 'vietnamese' ? 'tiếng Việt' : 'tiếng Anh'}`,
                'success'
            );
        } catch (error) {
            console.error('Error changing language:', error);
            this.showResult(document.querySelector('.result-area'), 'Lỗi khi chuyển ngôn ngữ', 'error');
        }
    }

    updatePlaceholders(language) {
        const placeholderText = language === 'vietnamese' ? 'con voi, bánh mì' : 'apple, cat';
        
        const inputs = [
            document.getElementById('searchWord'),
            document.getElementById('validateWord'),
            document.getElementById('newWords')
        ];
        
        inputs.forEach(input => {
            if (input) {
                if (input.tagName.toLowerCase() === 'textarea') {
                    input.placeholder = placeholderText;
                } else {
                    input.placeholder = placeholderText;
                }
            }
        });
    }

    async loadStats() {
        try {
            const stats = this.wordChainHelper.getStats();
            
            const totalWordsEl = document.getElementById('totalWords');
            const userWordsEl = document.getElementById('userWords');
            
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
        const searchWordInput = document.getElementById('searchWord');
        const searchResult = document.getElementById('searchResult');
        
        if (!searchWordInput || !searchResult) return;
        
        const searchWord = searchWordInput.value.trim();

        if (!searchWord) {
            this.showResult(searchResult, 'Vui lòng nhập từ cần tìm', 'error');
            return;
        }

        this.currentSearchWord = searchWord;
        this.currentDirection = direction;
        this.shownWords = [];

        try {
            const words = direction === 'next' 
                ? this.wordChainHelper.findNextWords(searchWord, 20, [])
                : this.wordChainHelper.findPreviousWords(searchWord, 20, []);

            this.displayWordResults(direction, searchWord, words, words.length === 20);
        } catch (error) {
            console.error('Error finding words:', error);
            this.showResult(searchResult, 'Lỗi khi tìm từ', 'error');
        }
    }

    async loadMoreWords(direction) {
        if (!this.currentSearchWord || !direction) return;

        try {
            const moreWords = direction === 'next'
                ? this.wordChainHelper.findNextWords(this.currentSearchWord, 20, this.shownWords)
                : this.wordChainHelper.findPreviousWords(this.currentSearchWord, 20, this.shownWords);

            this.appendWordResults(moreWords, moreWords.length === 20);
        } catch (error) {
            console.error('Error loading more words:', error);
        }
    }

    displayWordResults(direction, searchWord, words, hasMore) {
        const searchResult = document.getElementById('searchResult');
        if (!searchResult) return;

        if (words.length === 0) {
            this.displayNoResults(direction, searchWord);
            return;
        }

        const directionText = direction === 'next' ? 'theo sau' : 'đứng trước';
        const wordList = this.createWordList(words);
        
        searchResult.innerHTML = `
            <div class="search-results">
                <h4>Từ ${directionText} "${searchWord}" (${words.length} kết quả):</h4>
                ${wordList}
            </div>
        `;
        
        searchResult.className = 'result-area success';
        
        this.shownWords = [...words];
        this.updatePaginationControls(hasMore);
        
        // Add click listeners to word items
        this.addWordClickListeners(searchResult);
    }

    appendWordResults(words, hasMore) {
        if (words.length === 0) return;

        const searchResult = document.getElementById('searchResult');
        if (!searchResult) return;

        const wordList = this.createWordList(words);
        const existingList = searchResult.querySelector('.word-list');
        
        if (existingList) {
            existingList.innerHTML += wordList.match(/<li[^>]*>.*?<\/li>/g)?.join('') || '';
        }

        this.shownWords.push(...words);
        this.updatePaginationControls(hasMore);
        
        // Add click listeners to new word items
        this.addWordClickListeners(searchResult);
    }

    displayNoResults(direction, searchWord) {
        const searchResult = document.getElementById('searchResult');
        if (!searchResult) return;

        const directionText = direction === 'next' ? 'theo sau' : 'đứng trước';
        searchResult.innerHTML = `<p>Không tìm thấy từ nào ${directionText} "${searchWord}"</p>`;
        searchResult.className = 'result-area warning';
        this.updatePaginationControls(false);
    }

    updatePaginationControls(hasMore) {
        const loadMoreContainer = document.getElementById('loadMoreContainer');
        if (!loadMoreContainer) return;

        loadMoreContainer.style.display = hasMore ? 'block' : 'none';
    }

    createWordList(words) {
        const listItems = words.map(word => {
            const isDeadWord = this.wordChainHelper.deadWords.has(word);
            const statusClass = isDeadWord ? 'dead' : 'continuing';
            const statusText = isDeadWord ? '💀' : '✨';
            
            return `
                <li class="word-item" data-word="${word}">
                    <span class="word-text">${word}</span>
                    <span class="word-status ${statusClass}">${statusText}</span>
                </li>
            `;
        }).join('');

        return `<ul class="word-list">${listItems}</ul>`;
    }

    addWordClickListeners(container) {
        const wordItems = container.querySelectorAll('.word-item');
        wordItems.forEach(item => {
            item.addEventListener('click', () => {
                const word = item.dataset.word;
                if (word) {
                    // Copy to clipboard
                    navigator.clipboard.writeText(word).then(() => {
                        // Visual feedback
                        item.style.background = '#28a745';
                        item.style.color = 'white';
                        setTimeout(() => {
                            item.style.background = '';
                            item.style.color = '';
                        }, 200);
                    }).catch(err => {
                        console.error('Could not copy text: ', err);
                    });
                }
            });
        });
    }

    async validateWord() {
        const validateWordInput = document.getElementById('validateWord');
        const validateResult = document.getElementById('validateResult');
        
        if (!validateWordInput || !validateResult) return;
        
        const word = validateWordInput.value.trim();

        if (!word) {
            this.showResult(validateResult, 'Vui lòng nhập từ cần kiểm tra', 'error');
            return;
        }

        try {
            const result = this.wordChainHelper.validateWordComplete(word);
            
            const resultHTML = `
                <div class="validation-result">
                    <h4>Kết quả kiểm tra cho "${result.word}":</h4>
                    <p class="validation-message">${result.message}</p>
                    <div class="validation-details">
                        <div class="validation-item">
                            <span class="validation-label">Định dạng hợp lệ:</span>
                            <span class="validation-status ${result.isValid ? 'valid' : 'invalid'}">
                                ${result.isValid ? '✅ Có' : '❌ Không'}
                            </span>
                        </div>
                        <div class="validation-item">
                            <span class="validation-label">Có trong từ điển:</span>
                            <span class="validation-status ${result.hasInDictionary ? 'valid' : 'invalid'}">
                                ${result.hasInDictionary ? '✅ Có' : '❌ Không'}
                            </span>
                        </div>
                    </div>
                </div>
            `;
            
            const resultType = result.isValid && result.hasInDictionary ? 'success' : 'warning';
            this.showResult(validateResult, resultHTML, resultType);
        } catch (error) {
            console.error('Error validating word:', error);
            this.showResult(validateResult, 'Lỗi khi kiểm tra từ', 'error');
        }
    }

    async addWords() {
        const newWordsInput = document.getElementById('newWords');
        const manageResult = document.getElementById('manageResult');
        
        if (!newWordsInput || !manageResult) return;
        
        const wordsText = newWordsInput.value.trim();
        
        if (!wordsText) {
            this.showResult(manageResult, 'Vui lòng nhập từ cần thêm', 'error');
            return;
        }

        const words = wordsText.split(',').map(word => word.trim()).filter(word => word.length > 0);
        
        if (words.length === 0) {
            this.showResult(manageResult, 'Không có từ hợp lệ để thêm', 'error');
            return;
        }

        try {
            const result = this.wordChainHelper.addWords(words, true);
            
            if (result && (result.added.length > 0 || result.duplicates.length > 0 || result.rejected.length > 0)) {
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
                this.showResult(manageResult, message, hasSuccess ? 'success' : 'warning');
            } else {
                this.showResult(manageResult, `Đã thêm ${words.length} từ thành công`, 'success');
            }
            
            await this.loadStats();
            await this.loadUserWords();
            newWordsInput.value = '';
        } catch (error) {
            console.error('Error adding words:', error);
            this.showResult(manageResult, 'Lỗi khi thêm từ', 'error');
        }
    }

    async removeWords() {
        const newWordsInput = document.getElementById('newWords');
        const manageResult = document.getElementById('manageResult');
        
        if (!newWordsInput || !manageResult) return;
        
        const wordsText = newWordsInput.value.trim();
        
        if (!wordsText) {
            this.showResult(manageResult, 'Vui lòng nhập từ cần xóa', 'error');
            return;
        }

        const words = wordsText.split(',').map(word => word.trim()).filter(word => word.length > 0);
        
        try {
            const result = this.wordChainHelper.removeWords(words);
            
            let message = '';
            if (result.removed.length > 0) {
                message += `✅ Đã xóa ${result.removed.length} từ: ${result.removed.join(', ')}`;
            }
            if (result.notFound.length > 0) {
                if (message) message += '<br>';
                message += `⚠️ ${result.notFound.length} từ không tìm thấy: ${result.notFound.join(', ')}`;
            }
            
            this.showResult(manageResult, message || 'Không có từ nào được xóa', 'info');
            await this.loadStats();
            await this.loadUserWords();
            newWordsInput.value = '';
        } catch (error) {
            console.error('Error removing words:', error);
            this.showResult(manageResult, 'Lỗi khi xóa từ', 'error');
        }
    }

    async loadUserWords() {
        const userWordsList = document.getElementById('userWordsList');
        if (!userWordsList) return;

        try {
            const userWords = this.wordChainHelper.getUserWords();
            const currentLanguage = this.wordChainHelper.getLanguage();
            const languageLabel = currentLanguage === 'vietnamese' ? 'tiếng Việt' : 'tiếng Anh';
            
            if (userWords.length > 0) {
                const wordElements = userWords.map(word => 
                    `<span class="example-word" data-word="${word}">${word}</span>`
                ).join(' ');
                userWordsList.innerHTML = wordElements;
                
                // Add click listeners
                userWordsList.querySelectorAll('.example-word').forEach(span => {
                    span.addEventListener('click', () => {
                        const word = span.dataset.word;
                        if (word) {
                            navigator.clipboard.writeText(word);
                        }
                    });
                });
            } else {
                userWordsList.innerHTML = `<p style="color: #666; font-size: 11px; margin: 0;">Chưa có từ ${languageLabel} nào được thêm bởi người dùng.</p>`;
            }
        } catch (error) {
            console.error('Error loading user words:', error);
        }
    }

    toggleExamples() {
        const examplesArea = document.getElementById('examplesArea');
        const showExamplesBtn = document.getElementById('showExamplesBtn');
        
        if (!examplesArea || !showExamplesBtn) return;
        
        if (examplesArea.style.display === 'none' || !examplesArea.style.display) {
            try {
                const examples = this.wordChainHelper.getRandomWords(15);
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

    createSeparatedExamplesList(examples) {
        let html = '';
        
        if (examples.vietnamese && examples.vietnamese.length > 0) {
            html += `
                <div class="examples-section">
                    <h5>🇻🇳 Tiếng Việt:</h5>
                    <div class="examples-list">
                        ${examples.vietnamese.map(word => 
                            `<span class="example-word" data-word="${word}">${word}</span>`
                        ).join('')}
                    </div>
                </div>
            `;
        }
        
        if (examples.english && examples.english.length > 0) {
            html += `
                <div class="examples-section">
                    <h5>🇺🇸 English:</h5>
                    <div class="examples-list">
                        ${examples.english.map(word => 
                            `<span class="example-word" data-word="${word}">${word}</span>`
                        ).join('')}
                    </div>
                </div>
            `;
        }
        
        // Add click listeners after setting innerHTML
        setTimeout(() => {
            document.querySelectorAll('.example-word').forEach(span => {
                span.addEventListener('click', () => {
                    const word = span.dataset.word;
                    if (word) {
                        navigator.clipboard.writeText(word);
                        // Visual feedback
                        span.style.background = '#667eea';
                        span.style.color = 'white';
                        setTimeout(() => {
                            span.style.background = '';
                            span.style.color = '';
                        }, 200);
                    }
                });
            });
        }, 0);
        
        return html;
    }

    showResult(element, message, type = 'info') {
        if (!element) return;
        
        element.innerHTML = message;
        element.className = `result-area ${type}`;
    }
}

// Initialize the extension when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WordChainExtension();
});