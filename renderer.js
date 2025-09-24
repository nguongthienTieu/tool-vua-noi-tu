// DOM elements
const tabButtons = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');
const togglePinBtn = document.getElementById('togglePinBtn');
const showExamplesBtn = document.getElementById('showExamplesBtn');
const examplesArea = document.getElementById('examplesArea');

// Stats elements
const totalWordsEl = document.getElementById('totalWords');
const userWordsEl = document.getElementById('userWords');

// Check tab elements
const word1Input = document.getElementById('word1');
const word2Input = document.getElementById('word2');
const checkBtn = document.getElementById('checkBtn');
const checkResult = document.getElementById('checkResult');

// Find tab elements
const findWordInput = document.getElementById('findWord');
const findNextBtn = document.getElementById('findNextBtn');
const findPrevBtn = document.getElementById('findPrevBtn');
const findResult = document.getElementById('findResult');

// Chain tab elements
const chainInput = document.getElementById('chainInput');
const validateChainBtn = document.getElementById('validateChainBtn');
const chainResult = document.getElementById('chainResult');

// Add words tab elements
const newWordsInput = document.getElementById('newWords');
const addWordsBtn = document.getElementById('addWordsBtn');
const addResult = document.getElementById('addResult');

class WordChainApp {
    constructor() {
        this.isPinned = true; // Start pinned by default
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadStats();
    }

    setupEventListeners() {
        // Tab switching
        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });

        // Window controls
        togglePinBtn.addEventListener('click', () => this.togglePin());
        
        // Examples toggle
        showExamplesBtn.addEventListener('click', () => this.toggleExamples());

        // Check functionality
        checkBtn.addEventListener('click', () => this.checkWords());
        word1Input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.checkWords();
        });
        word2Input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.checkWords();
        });

        // Find functionality
        findNextBtn.addEventListener('click', () => this.findWords('next'));
        findPrevBtn.addEventListener('click', () => this.findWords('prev'));
        findWordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.findWords('next');
        });

        // Chain validation
        validateChainBtn.addEventListener('click', () => this.validateChain());
        chainInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) this.validateChain();
        });

        // Add words
        addWordsBtn.addEventListener('click', () => this.addWords());
        newWordsInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) this.addWords();
        });
    }

    switchTab(tabName) {
        // Update button states
        tabButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        // Update panel visibility
        tabPanels.forEach(panel => {
            panel.classList.toggle('active', panel.id === `${tabName}-tab`);
        });
    }

    async togglePin() {
        try {
            this.isPinned = await window.electronAPI.toggleAlwaysOnTop();
            togglePinBtn.textContent = this.isPinned ? '📌' : '📍';
            togglePinBtn.title = this.isPinned ? 'Bỏ ghim cửa sổ' : 'Ghim cửa sổ lên trên';
        } catch (error) {
            this.showResult(checkResult, 'Lỗi khi thay đổi trạng thái ghim cửa sổ', 'error');
        }
    }

    async toggleExamples() {
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
            totalWordsEl.textContent = stats.totalWords.toLocaleString();
            userWordsEl.textContent = stats.userAddedWords.toLocaleString();
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }

    async checkWords() {
        const word1 = word1Input.value.trim();
        const word2 = word2Input.value.trim();

        if (!word1 || !word2) {
            this.showResult(checkResult, 'Vui lòng nhập cả hai từ để kiểm tra', 'error');
            return;
        }

        try {
            const canChain = await window.electronAPI.canChain(word1, word2);
            const message = canChain 
                ? `✅ Có thể nối từ "${word1}" với "${word2}"`
                : `❌ Không thể nối từ "${word1}" với "${word2}"`;
            
            this.showResult(checkResult, message, canChain ? 'success' : 'error');
        } catch (error) {
            this.showResult(checkResult, 'Lỗi khi kiểm tra từ', 'error');
        }
    }

    async findWords(direction) {
        const word = findWordInput.value.trim();

        if (!word) {
            this.showResult(findResult, 'Vui lòng nhập từ để tìm kiếm', 'error');
            return;
        }

        try {
            const words = direction === 'next' 
                ? await window.electronAPI.findNextWords(word)
                : await window.electronAPI.findPreviousWords(word);

            if (words.length > 0) {
                const title = direction === 'next' 
                    ? `Các từ có thể theo sau "${word}":` 
                    : `Các từ có thể đứng trước "${word}":`;
                
                const wordList = this.createWordList(words.slice(0, 15)); // Limit to 15 words
                const moreText = words.length > 15 ? `<p style="margin-top: 8px; font-size: 10px; color: #666;">và ${words.length - 15} từ khác...</p>` : '';
                
                this.showResult(findResult, `<p style="margin-bottom: 8px;">${title}</p>${wordList}${moreText}`, 'success');
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

    async validateChain() {
        const chainText = chainInput.value.trim();

        if (!chainText) {
            this.showResult(chainResult, 'Vui lòng nhập chuỗi từ để kiểm tra', 'error');
            return;
        }

        const chain = chainText.split(',').map(word => word.trim()).filter(word => word);

        if (chain.length < 2) {
            this.showResult(chainResult, 'Chuỗi từ phải có ít nhất 2 từ', 'error');
            return;
        }

        try {
            const isValid = await window.electronAPI.validateChain(chain);
            
            let chainDisplay = '<div class="word-chain">';
            for (let i = 0; i < chain.length; i++) {
                const isValidStep = i === 0 || await window.electronAPI.canChain(chain[i-1], chain[i]);
                chainDisplay += `<span class="chain-item ${isValidStep ? 'valid' : 'invalid'}">${chain[i]}</span>`;
                if (i < chain.length - 1) {
                    chainDisplay += ' → ';
                }
            }
            chainDisplay += '</div>';

            const message = isValid 
                ? `✅ Chuỗi từ hợp lệ! (${chain.length} từ)`
                : `❌ Chuỗi từ không hợp lệ`;

            this.showResult(chainResult, `<p style="margin-bottom: 8px;">${message}</p>${chainDisplay}`, isValid ? 'success' : 'error');
        } catch (error) {
            this.showResult(chainResult, 'Lỗi khi kiểm tra chuỗi từ', 'error');
        }
    }

    async addWords() {
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
            await window.electronAPI.addWords(words);
            await this.loadStats(); // Refresh stats
            
            const wordList = this.createWordList(words);
            this.showResult(addResult, `<p style="margin-bottom: 8px;">✅ Đã thêm ${words.length} từ:</p>${wordList}`, 'success');
            
            newWordsInput.value = '';
        } catch (error) {
            this.showResult(addResult, 'Lỗi khi thêm từ', 'error');
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