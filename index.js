/**
 * Trợ giúp Từ Ghép Tiếng Việt
 * Một tiện ích hỗ trợ trò chơi từ ghép tiếng Việt, 
 * nơi âm tiết cuối của từ ghép này phải trùng với âm tiết đầu của từ ghép tiếp theo.
 * Sử dụng nguồn từ điển từ @undertheseanlp/dictionary
 */

const vietnameseDict = require('./vietnamese-dictionary');
const hongocducDict = require('./hongocduc-dictionary');
const tudientvDict = require('./tudientv-dictionary');
const wiktionaryDict = require('./wiktionary-dictionary');
const fs = require('fs');
const path = require('path');

class WordChainHelper {
    constructor() {
        this.words = new Set();
        this.language = 'vietnamese'; // Chỉ hỗ trợ tiếng Việt
        this.deadWords = new Set(); // Từ "chết" - không thể tiếp tục
        this.wordHistory = new Map(); // Theo dõi lịch sử sử dụng từ
        this.userWords = new Set(); // Từ do người dùng thêm vào
        this.userWordsFile = path.join(__dirname, 'user-words.json');
        
        // Tự động tải từ điển tiếng Việt từ các nguồn @undertheseanlp/dictionary
        this.addWords(vietnameseDict.getAllWords());
        this.addWords(hongocducDict.getAllWords());
        this.addWords(tudientvDict.getAllWords());
        this.addWords(wiktionaryDict.getAllWords());
        
        // Tải từ do người dùng thêm vào từ file
        this.loadUserWords();
    }

    /**
     * Tách âm tiết từ một từ ghép tiếng Việt
     * @param {string} word - Từ ghép tiếng Việt
     * @returns {string[]} Mảng các âm tiết
     */
    extractSyllables(word) {
        if (!word || typeof word !== 'string') return [];
        
        // Tách theo khoảng trắng (từ ghép tiếng Việt được phân tách bằng khoảng trắng)
        return word.trim().toLowerCase().split(/\s+/);
    }

    /**
     * Lấy âm tiết kết nối để tạo chuỗi từ (âm tiết cuối hoặc đầu)
     * @param {string} word - Từ cần lấy âm tiết kết nối
     * @param {boolean} isLast - Nếu true, lấy âm tiết cuối; nếu false, lấy âm tiết đầu  
     * @returns {string} Âm tiết kết nối
     */
    getConnectingElement(word, isLast = true) {
        const syllables = this.extractSyllables(word);
        if (syllables.length === 0) return '';
        
        if (this.language === 'vietnamese' || this.language === 'tiếng việt') {
            return isLast ? syllables[syllables.length - 1] : syllables[0];
        }
        
        // English - use letters
        return isLast ? word.toLowerCase().slice(-1) : word.toLowerCase().charAt(0);
    }

    /**
     * Kiểm tra xem một từ có phải là từ ghép 2 âm tiết hợp lệ hay không
     * @param {string} word - Từ cần kiểm tra
     * @returns {boolean} True nếu là từ ghép hợp lệ
     */
    isValidCompoundWord(word) {
        const syllables = this.extractSyllables(word);
        return syllables.length === 2; // Chỉ chấp nhận từ ghép tiếng Việt có đúng 2 âm tiết
    }
    
    /**
     * Thêm từ vào cơ sở dữ liệu
     * @param {string[]} wordList - Danh sách từ cần thêm
     * @param {boolean} isUserAdded - Có phải từ do người dùng thêm vào không
     * @returns {object} Kết quả với các từ thêm thành công và thất bại
     */
    addWords(wordList, isUserAdded = false) {
        const results = {
            added: [],
            rejected: [],
            duplicates: []
        };
        
        wordList.forEach(word => {
            if (typeof word === 'string' && word.length > 0) {
                const normalizedWord = word.toLowerCase().trim();
                
                // Kiểm tra từ ghép hợp lệ cho tiếng Việt
                if (this.isValidCompoundWord(normalizedWord)) {
                    if (isUserAdded && this.words.has(normalizedWord)) {
                        // Từ đã tồn tại - không hợp lệ khi thêm từ người dùng
                        results.duplicates.push(normalizedWord);
                    } else {
                        this.words.add(normalizedWord);
                        if (isUserAdded) {
                            this.userWords.add(normalizedWord);
                        }
                        results.added.push(normalizedWord);
                    }
                } else if (isUserAdded) {
                    results.rejected.push(normalizedWord);
                }
            }
        });
        
        // Lưu từ người dùng vào file khi có thay đổi
        if (isUserAdded && (results.added.length > 0 || results.duplicates.length > 0)) {
            this.saveUserWords();
        }
        
        // Chỉ cập nhật từ "chết" khi cần thiết (không phải khi khởi tạo với từ điển lớn)
        if (isUserAdded || wordList.length < 1000) {
            this.updateDeadWords();
        }
        
        return isUserAdded ? results : null;
    }

    /**
     * Xóa từ khỏi cơ sở dữ liệu
     * @param {string[]} wordList - Danh sách từ cần xóa
     * @returns {object} Kết quả với các từ xóa thành công và thất bại
     */
    removeWords(wordList) {
        const results = {
            removed: [],
            notFound: []
        };
        
        wordList.forEach(word => {
            if (typeof word === 'string') {
                const normalizedWord = word.toLowerCase().trim();
                
                if (this.userWords.has(normalizedWord)) {
                    this.words.delete(normalizedWord);
                    this.userWords.delete(normalizedWord);
                    this.deadWords.delete(normalizedWord);
                    results.removed.push(normalizedWord);
                } else {
                    // Từ không có trong danh sách từ người dùng - không hợp lệ
                    results.notFound.push(normalizedWord);
                }
            }
        });
        
        // Lưu từ người dùng vào file khi có thay đổi
        if (results.removed.length > 0) {
            this.saveUserWords();
            // Cập nhật từ "chết" sau khi xóa từ
            this.updateDeadWords();
        }
        
        return results;
    }

    /**
     * Cập nhật từ trong cơ sở dữ liệu (thay thế từ cũ bằng từ mới)
     * @param {string} oldWord - Từ cần thay thế
     * @param {string} newWord - Từ mới để thêm vào
     */
    updateWord(oldWord, newWord) {
        if (this.words.has(oldWord.toLowerCase().trim())) {
            this.removeWords([oldWord]);
            this.addWords([newWord], this.userWords.has(oldWord.toLowerCase().trim()));
        }
    }

    /**
     * Kiểm tra xem hai từ có thể nối với nhau không
     * (âm tiết cuối của từ đầu = âm tiết đầu của từ sau)
     * @param {string} word1 - Từ đầu tiên
     * @param {string} word2 - Từ thứ hai
     * @returns {boolean} True nếu hai từ có thể nối với nhau
     */
    canChain(word1, word2) {
        if (!word1 || !word2 || typeof word1 !== 'string' || typeof word2 !== 'string') {
            return false;
        }
        
        const connectingElement1 = this.getConnectingElement(word1, true); // âm tiết cuối
        const connectingElement2 = this.getConnectingElement(word2, false); // âm tiết đầu
        
        return connectingElement1 === connectingElement2 && connectingElement1.length > 0;
    }

    /**
     * Tìm tất cả từ có thể theo sau từ đã cho (backward compatible version)
     * @param {string} word - Từ hiện tại
     * @param {boolean} prioritizeDeadWords - Ưu tiên từ "chết" lên đầu
     * @param {boolean} returnSimpleArray - Trả về mảng đơn giản thay vì objects với metadata
     * @returns {Array} Mảng các từ có thể theo sau
     */
    findNextWords(word, prioritizeDeadWords = true, returnSimpleArray = false) {
        if (!word || typeof word !== 'string') {
            return [];
        }

        const lastElement = this.getConnectingElement(word, true);
        const nextWords = [];
        const deadWords = [];

        this.words.forEach(candidateWord => {
            const firstElement = this.getConnectingElement(candidateWord, false);
            if (firstElement === lastElement && candidateWord !== word.toLowerCase().trim()) {
                // Check if this word is a dead word (has no next words)
                const hasNextWords = this.hasNextWords(candidateWord);
                
                const wordInfo = {
                    word: candidateWord,
                    isDead: !hasNextWords
                };
                
                if (!hasNextWords) {
                    deadWords.push(wordInfo);
                } else {
                    nextWords.push(wordInfo);
                }
                
                // Track usage history
                if (!this.wordHistory.has(candidateWord)) {
                    this.wordHistory.set(candidateWord, 0);
                }
                this.wordHistory.set(candidateWord, this.wordHistory.get(candidateWord) + 1);
            }
        });

        // Sort both arrays alphabetically
        nextWords.sort((a, b) => a.word.localeCompare(b.word));
        deadWords.sort((a, b) => a.word.localeCompare(b.word));

        let result;
        // Return dead words first if prioritizeDeadWords is true
        if (prioritizeDeadWords) {
            result = [...deadWords, ...nextWords];
        } else {
            result = [...nextWords, ...deadWords];
        }

        // Return simple array for backward compatibility if requested
        if (returnSimpleArray) {
            return result.map(item => item.word);
        }
        
        return result;
    }

    /**
     * Check if a word has any next words (not a dead word)
     * @param {string} word - The word to check
     * @returns {boolean} True if the word has next words
     */
    hasNextWords(word) {
        if (!word || typeof word !== 'string') {
            return false;
        }

        const lastElement = this.getConnectingElement(word, true);
        
        // Use for...of to enable early return for better performance
        for (const candidateWord of this.words) {
            const firstElement = this.getConnectingElement(candidateWord, false);
            if (firstElement === lastElement && candidateWord !== word.toLowerCase().trim()) {
                return true; // Found at least one next word
            }
        }
        
        return false; // No next words found - this is a dead word
    }

    /**
     * Find all possible previous words that can come before the given word
     * @param {string} word - The current word
     * @returns {string[]} Array of possible previous words
     */
    findPreviousWords(word) {
        if (!word || typeof word !== 'string') {
            return [];
        }

        const firstElement = this.getConnectingElement(word, false);
        const previousWords = [];

        this.words.forEach(candidateWord => {
            const lastElement = this.getConnectingElement(candidateWord, true);
            if (lastElement === firstElement && candidateWord !== word.toLowerCase().trim()) {
                previousWords.push(candidateWord);
            }
        });

        return previousWords.sort();
    }

    /**
     * Generate multiple word chains from a starting word
     * @param {string} startWord - The starting word for the chains
     * @param {number} maxChains - Maximum number of chains to generate (default: 4)
     * @param {number} maxLength - Maximum length of each chain (default: 10)
     * @returns {Array} Array of chain objects with metadata
     */
    generateWordChains(startWord, maxChains = 4, maxLength = 10) {
        if (!startWord || typeof startWord !== 'string') {
            return [];
        }

        const chains = [];
        const chainStrings = new Set(); // To avoid duplicate chains
        
        // Start with the initial word
        this._generateChainsIterative(startWord, chains, chainStrings, maxChains, maxLength);
        
        // Process chains to add metadata
        const processedChains = chains.map(chain => {
            const lastWord = chain[chain.length - 1];
            const canContinue = this.hasNextWords(lastWord);
            
            return {
                chain: [...chain],
                length: chain.length,
                canContinue: canContinue,
                isGameEnding: !canContinue, // Chain ends the game if last word can't continue
                lastWord: lastWord
            };
        });

        // Sort by length (shortest to longest) as requested
        processedChains.sort((a, b) => a.length - b.length);
        
        return processedChains.slice(0, maxChains);
    }

    /**
     * Find chains that lead to dead words (game-ending chains)
     * @param {string} startWord - The starting word for the chains
     * @param {number} maxChains - Maximum number of chains to find (default: 5, range 3-5)
     * @param {number} maxLength - Maximum length of each chain (default: 10)
     * @returns {Array} Array of chain objects that lead to dead words, sorted by length
     */
    findChainsToDeadWords(startWord, maxChains = 5, maxLength = 10) {
        if (!startWord || typeof startWord !== 'string') {
            return [];
        }

        // Ensure maxChains is between 3-5 as per requirements
        maxChains = Math.max(3, Math.min(5, maxChains));

        const chains = [];
        const chainStrings = new Set(); // To avoid duplicate chains
        
        // Use BFS to find chains that end with dead words
        this._findChainsToDeadWordsIterative(startWord, chains, chainStrings, maxChains, maxLength);
        
        // Process chains to add metadata
        const processedChains = chains.map(chain => {
            const lastWord = chain[chain.length - 1];
            const canContinue = this.hasNextWords(lastWord);
            
            return {
                chain: [...chain],
                length: chain.length,
                canContinue: canContinue,
                isGameEnding: !canContinue, // Should be true for our purpose
                lastWord: lastWord
            };
        });

        // Filter only chains that end with dead words (game ending)
        const gameEndingChains = processedChains.filter(chain => chain.isGameEnding);

        // Sort by length (shortest to longest) as requested
        gameEndingChains.sort((a, b) => a.length - b.length);
        
        return gameEndingChains.slice(0, maxChains);
    }

    /**
     * Helper method for finding chains to dead words iteratively
     * @private
     */
    _findChainsToDeadWordsIterative(startWord, chains, chainStrings, maxChains, maxLength) {
        const queue = [[startWord]]; // Queue of current chains
        let processedCount = 0;
        const maxProcessed = 2000; // Increased limit to find more dead word chains
        
        while (queue.length > 0 && chains.length < maxChains && processedCount < maxProcessed) {
            const currentChain = queue.shift();
            processedCount++;
            
            if (currentChain.length > maxLength) {
                continue;
            }
            
            const currentWord = currentChain[currentChain.length - 1];
            const nextWordsData = this.findNextWords(currentWord, false, true); // Get simple array
            
            if (nextWordsData.length === 0) {
                // This is a dead word - save the chain if it's meaningful
                if (currentChain.length >= 2) {
                    const chainKey = currentChain.join('|');
                    if (!chainStrings.has(chainKey)) {
                        chains.push([...currentChain]);
                        chainStrings.add(chainKey);
                    }
                }
            } else if (currentChain.length < maxLength) {
                // Continue building chains - only explore if we haven't reached max length
                const wordsToTry = nextWordsData.slice(0, Math.min(4, nextWordsData.length));
                for (const nextWord of wordsToTry) {
                    const newChain = [...currentChain, nextWord];
                    const newChainKey = newChain.join('|');
                    
                    if (!chainStrings.has(newChainKey) && newChain.length <= maxLength) {
                        queue.push(newChain);
                    }
                }
            }
        }
    }

    /**
     * Helper method for generating chains iteratively (more efficient than recursion)
     * @private
     */
    _generateChainsIterative(startWord, chains, chainStrings, maxChains, maxLength) {
        const queue = [[startWord]]; // Queue of current chains
        let processedCount = 0;
        const maxProcessed = 1000; // Limit processing to avoid infinite loops
        
        while (queue.length > 0 && chains.length < maxChains && processedCount < maxProcessed) {
            const currentChain = queue.shift();
            processedCount++;
            
            if (currentChain.length >= maxLength) {
                continue;
            }
            
            const currentWord = currentChain[currentChain.length - 1];
            const nextWordsData = this.findNextWords(currentWord, false, true); // Get simple array
            
            if (nextWordsData.length === 0) {
                // This is a dead end, save the chain if it's meaningful
                if (currentChain.length >= 2) {
                    const chainKey = currentChain.join('|');
                    if (!chainStrings.has(chainKey)) {
                        chains.push([...currentChain]);
                        chainStrings.add(chainKey);
                    }
                }
            } else {
                // Save current chain if it's meaningful
                if (currentChain.length >= 2) {
                    const chainKey = currentChain.join('|');
                    if (!chainStrings.has(chainKey) && chains.length < maxChains) {
                        chains.push([...currentChain]);
                        chainStrings.add(chainKey);
                    }
                }
                
                // Add extended chains to queue (limit to first few options for efficiency)
                const wordsToTry = nextWordsData.slice(0, Math.min(3, nextWordsData.length));
                for (const nextWord of wordsToTry) {
                    const newChain = [...currentChain, nextWord];
                    const newChainKey = newChain.join('|');
                    
                    if (!chainStrings.has(newChainKey) && newChain.length <= maxLength) {
                        queue.push(newChain);
                    }
                }
            }
        }
    }

    /**
     * Validate if a chain of words is valid
     * @param {string[]} chain - Array of words in the chain
     * @returns {boolean} True if the entire chain is valid
     */
    validateChain(chain) {
        if (!Array.isArray(chain) || chain.length < 2) {
            return chain.length === 1; // Single word is valid
        }

        for (let i = 0; i < chain.length - 1; i++) {
            if (!this.canChain(chain[i], chain[i + 1])) {
                return false;
            }
        }

        return true;
    }

    /**
     * Update the list of dead words (words that have no valid next words)  
     * This is computationally expensive, so we make it lazy
     */
    updateDeadWords() {
        // Skip for performance when dealing with large dictionaries  
        if (this.words.size > 10000) {
            console.log('Bỏ qua cập nhật từ "chết" do từ điển lớn (tối ưu hóa hiệu năng)');
            return;
        }
        
        this.deadWords.clear();
        
        this.words.forEach(word => {
            const nextWords = this.findNextWords(word, false, true); // Get simple array
            if (nextWords.length === 0) {
                this.deadWords.add(word);
            }
        });
    }

    /**
     * Get all dead words (words that cannot continue a chain)
     * @returns {string[]} Array of dead words
     */
    getDeadWords() {
        return Array.from(this.deadWords).sort();
    }

    /**
     * Check if a word is a dead word
     * @param {string} word - Word to check
     * @returns {boolean} True if the word is a dead word
     */
    isDeadWord(word) {
        return this.deadWords.has(word.toLowerCase().trim());
    }

    /**
     * Get word usage history
     * @returns {Object} Map of words to usage counts
     */
    getWordHistory() {
        return Object.fromEntries(this.wordHistory);
    }

    /**
     * Get user-added words
     * @returns {string[]} Array of user-added words
     */
    getUserWords() {
        return Array.from(this.userWords).sort();
    }
    /**
     * Get statistics about the word database
     * @returns {object} Statistics object
     */
    getStats() {
        const elementStats = {}; // For letters (English) or syllables (Vietnamese)
        let totalWords = this.words.size;
        let compoundWords = 0;
        let userAddedWords = this.userWords.size;
        let deadWords = this.deadWords.size;

        this.words.forEach(word => {
            const firstElement = this.getConnectingElement(word, false);
            const lastElement = this.getConnectingElement(word, true);

            // Count compound words for Vietnamese
            if (this.language === 'vietnamese' || this.language === 'tiếng việt') {
                if (this.isValidCompoundWord(word)) {
                    compoundWords++;
                }
            }

            // Track element statistics
            if (!elementStats[firstElement]) {
                elementStats[firstElement] = { starting: 0, ending: 0 };
            }
            if (!elementStats[lastElement]) {
                elementStats[lastElement] = { starting: 0, ending: 0 };
            }

            elementStats[firstElement].starting++;
            elementStats[lastElement].ending++;
        });

        const stats = {
            totalWords,
            userAddedWords,
            deadWords,
            language: this.language,
            elementStats // letterStats for English, syllableStats for Vietnamese
        };

        if (this.language === 'vietnamese' || this.language === 'tiếng việt') {
            stats.compoundWords = compoundWords;
            stats.syllableStats = elementStats; // Alias for Vietnamese
        } else {
            stats.letterStats = elementStats; // Alias for English
        }

        return stats;
    }

    /**
     * Clear all words from the database
     */
    clear() {
        this.words.clear();
        this.deadWords.clear();
        this.wordHistory.clear();
        this.userWords.clear();
    }

    /**
     * Lấy ngôn ngữ hiện tại
     * @returns {string} Ngôn ngữ hiện tại (luôn là 'vietnamese')
     */
    getLanguage() {
        return this.language;
    }

    /**
     * Làm mới từ điển (chỉ để tương thích, tool chỉ hỗ trợ tiếng Việt)
     */
    setLanguage() {
        // Không làm gì - tool chỉ hỗ trợ tiếng Việt
        console.log('Tool này chỉ hỗ trợ tiếng Việt');
    }

    /**
     * Tải từ do người dùng thêm vào từ file
     */
    loadUserWords() {
        try {
            if (fs.existsSync(this.userWordsFile)) {
                const data = fs.readFileSync(this.userWordsFile, 'utf8');
                const userWordsArray = JSON.parse(data);
                if (Array.isArray(userWordsArray)) {
                    userWordsArray.forEach(word => {
                        if (typeof word === 'string' && this.isValidCompoundWord(word)) {
                            this.words.add(word);
                            this.userWords.add(word);
                        }
                    });
                }
            }
        } catch (error) {
            console.error('Lỗi khi tải từ người dùng:', error.message);
        }
    }

    /**
     * Lưu từ do người dùng thêm vào file
     */
    saveUserWords() {
        try {
            const userWordsArray = Array.from(this.userWords);
            fs.writeFileSync(this.userWordsFile, JSON.stringify(userWordsArray, null, 2), 'utf8');
        } catch (error) {
            console.error('Lỗi khi lưu từ người dùng:', error.message);
        }
    }

    /**
     * Lấy tất cả từ trong cơ sở dữ liệu
     * @returns {string[]} Mảng tất cả từ đã sắp xếp
     */
    getAllWords() {
        return Array.from(this.words).sort();
    }
}

// Export the class for use in other modules
module.exports = WordChainHelper;

// Nếu chạy trực tiếp, hiển thị ví dụ sử dụng
if (require.main === module) {
    console.log('Trợ giúp Từ Ghép Tiếng Việt - Ví dụ sử dụng:');
    console.log('====================================================');
    
    // Ví dụ sử dụng tiếng Việt với từ điển @undertheseanlp/dictionary
    const vietnameseHelper = new WordChainHelper();
    
    console.log('\nTổng số từ trong từ điển từ @undertheseanlp/dictionary:', vietnameseHelper.getAllWords().length);
    console.log('Một số từ mẫu:', vietnameseHelper.getAllWords().slice(0, 10));
    
    console.log('\nKiểm tra từ nối:');
    console.log('Có thể nối "con voi" với "voi con" không?', vietnameseHelper.canChain('con voi', 'voi con'));
    console.log('Có thể nối "bánh mì" với "mì quảng" không?', vietnameseHelper.canChain('bánh mì', 'mì quảng'));
    console.log('Có thể nối "hoa đào" với "đào tạo" không?', vietnameseHelper.canChain('hoa đào', 'đào tạo'));
    
    console.log('\nTìm từ có thể theo sau:');
    console.log('Từ có thể theo sau "con voi":', vietnameseHelper.findNextWords('con voi', true, true).slice(0, 5));
    console.log('Từ có thể theo sau "bánh mì":', vietnameseHelper.findNextWords('bánh mì', true, true).slice(0, 5));
    
    console.log('\nTìm từ có thể đứng trước:');
    console.log('Từ có thể đứng trước "mì quảng":', vietnameseHelper.findPreviousWords('mì quảng').slice(0, 5));
    console.log('Từ có thể đứng trước "voi con":', vietnameseHelper.findPreviousWords('voi con').slice(0, 5));
    
    console.log('\nKiểm tra chuỗi từ:');
    const chain1 = ['bánh mì', 'mì quảng', 'quảng nam'];
    const chain2 = ['con voi', 'voi con', 'con chó'];
    const chain3 = ['hoa đào', 'đào tạo', 'tạo nên'];
    console.log(`Chuỗi "${chain1.join(' → ')}" hợp lệ:`, vietnameseHelper.validateChain(chain1));
    console.log(`Chuỗi "${chain2.join(' → ')}" hợp lệ:`, vietnameseHelper.validateChain(chain2));
    console.log(`Chuỗi "${chain3.join(' → ')}" hợp lệ:`, vietnameseHelper.validateChain(chain3));
    
    // Thêm từ của người dùng
    vietnameseHelper.addWords(['xe hơi', 'hơi nước', 'nước mắm', 'mắm tôm'], true);
    console.log('\nĐã thêm từ của người dùng:', vietnameseHelper.getUserWords());
    
    console.log('\nThống kê cơ sở dữ liệu:');
    const stats = vietnameseHelper.getStats();
    console.log('- Tổng số từ:', stats.totalWords);
    console.log('- Từ ghép hợp lệ:', stats.compoundWords);
    console.log('- Từ do người dùng thêm:', stats.userAddedWords);
    console.log('- Từ "chết" (không thể tiếp tục):', stats.deadWords);
    
    if (stats.deadWords > 0) {
        console.log('\nMột số từ "chết":', vietnameseHelper.getDeadWords().slice(0, 5));
    }
    
    console.log('\n*** Tool này chỉ hỗ trợ từ ghép tiếng Việt từ nguồn @undertheseanlp/dictionary ***');
}
