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
const englishDict = require('./english-dictionary');
const fs = require('fs');
const path = require('path');

class WordChainHelper {
    constructor(language = 'vietnamese') {
        this.words = new Set();
        this.language = language.toLowerCase(); // Support 'vietnamese' or 'english'
        this.deadWords = new Set(); // Từ "kết thúc" - không thể tiếp tục
        this.wordHistory = new Map(); // Theo dõi lịch sử sử dụng từ
        this.userWords = new Set(); // Từ do người dùng thêm vào
        this.userWordsFile = path.join(__dirname, 'user-words.json');
        
        if (this.language === 'english') {
            // Load English dictionary
            this.addWords(englishDict.getAllWords());
        } else {
            // Default to Vietnamese - Load Vietnamese dictionaries
            this.language = 'vietnamese';
            this.addWords(vietnameseDict.getAllWords());
            this.addWords(hongocducDict.getAllWords());
            this.addWords(tudientvDict.getAllWords());
            this.addWords(wiktionaryDict.getAllWords());
        }
        
        // Tải từ do người dùng thêm vào từ file
        this.loadUserWords();
    }

    /**
     * Tách âm tiết từ một từ ghép tiếng Việt hoặc ký tự từ từ tiếng Anh
     * @param {string} word - Từ ghép tiếng Việt hoặc từ tiếng Anh
     * @returns {string[]} Mảng các âm tiết (Vietnamese) hoặc array với một từ (English)
     */
    extractSyllables(word) {
        if (!word || typeof word !== 'string') return [];
        
        if (this.language === 'english') {
            // For English, return the whole word as a single element
            return [word.trim().toLowerCase()];
        }
        
        // Vietnamese: Tách theo khoảng trắng (từ ghép tiếng Việt được phân tách bằng khoảng trắng)
        return word.trim().toLowerCase().split(/\s+/);
    }

    /**
     * Lấy âm tiết kết nối để tạo chuỗi từ (âm tiết cuối hoặc đầu cho tiếng Việt, ký tự cuối/đầu cho tiếng Anh)
     * @param {string} word - Từ cần lấy âm tiết kết nối
     * @param {boolean} isLast - Nếu true, lấy âm tiết cuối; nếu false, lấy âm tiết đầu  
     * @returns {string} Âm tiết kết nối
     */
    getConnectingElement(word, isLast = true) {
        if (!word || typeof word !== 'string') return '';
        
        if (this.language === 'english') {
            // English - use first/last letter
            const cleanWord = word.toLowerCase().trim();
            return isLast ? cleanWord.slice(-1) : cleanWord.charAt(0);
        }
        
        // Vietnamese - use syllables
        const syllables = this.extractSyllables(word);
        if (syllables.length === 0) return '';
        
        return isLast ? syllables[syllables.length - 1] : syllables[0];
    }

    /**
     * Kiểm tra xem một từ có hợp lệ hay không
     * @param {string} word - Từ cần kiểm tra
     * @returns {boolean} True nếu từ hợp lệ
     */
    isValidCompoundWord(word) {
        if (!word || typeof word !== 'string') return false;
        
        if (this.language === 'english') {
            // English: Check if it's a valid single word with only letters
            const cleanWord = word.trim();
            return /^[a-zA-Z]+$/.test(cleanWord) && cleanWord.length > 1;
        }
        
        // Vietnamese: Accept words with exactly 2 syllables
        const syllables = this.extractSyllables(word);
        return syllables.length === 2 && syllables.every(syllable => syllable.length > 0);
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
                
                // For dictionary loading (not user added), accept all words
                // For user added words, validate format
                if (!isUserAdded || this.isValidCompoundWord(normalizedWord)) {
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
        
        // Chỉ cập nhật từ "kết thúc" khi cần thiết (không phải khi khởi tạo với từ điển lớn)
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
                
                if (this.words.has(normalizedWord)) {
                    this.words.delete(normalizedWord);
                    // Also remove from userWords if it was user-added
                    this.userWords.delete(normalizedWord);
                    this.deadWords.delete(normalizedWord);
                    results.removed.push(normalizedWord);
                } else {
                    // Từ không tồn tại trong từ điển
                    results.notFound.push(normalizedWord);
                }
            }
        });
        
        // Lưu từ người dùng vào file khi có thay đổi
        if (results.removed.length > 0) {
            this.saveUserWords();
            // Cập nhật từ "kết thúc" sau khi xóa từ
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
     * @param {boolean} prioritizeDeadWords - Ưu tiên từ "kết thúc" lên đầu
     * @param {boolean} returnSimpleArray - Trả về mảng đơn giản thay vì objects với metadata
     * @param {number} maxResults - Maximum number of results to return (for performance, especially English)
     * @returns {Array} Mảng các từ có thể theo sau
     */
    findNextWords(word, prioritizeDeadWords = true, returnSimpleArray = false, maxResults = null) {
        if (!word || typeof word !== 'string') {
            return [];
        }

        const lastElement = this.getConnectingElement(word, true);
        const nextWords = [];
        const deadWords = [];
        
        // For English, set a reasonable limit to avoid performance issues
        const isEnglish = this.language === 'english';
        const limit = maxResults || (isEnglish ? 10 : null);
        let count = 0;

        // Convert to array for better performance with large dictionaries
        const wordsArray = Array.from(this.words);
        
        // For English, shuffle the words to get random results
        if (isEnglish && !maxResults) {
            // Fisher-Yates shuffle for truly random results
            for (let i = wordsArray.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [wordsArray[i], wordsArray[j]] = [wordsArray[j], wordsArray[i]];
            }
        }

        for (const candidateWord of wordsArray) {
            if (limit && count >= limit) break;
            
            const firstElement = this.getConnectingElement(candidateWord, false);
            if (firstElement === lastElement && candidateWord !== word.toLowerCase().trim()) {
                // For English, skip dead word checking to improve performance
                let hasNextWords = true;
                let isDead = false;
                
                if (!isEnglish) {
                    // Only check for dead words in Vietnamese (smaller dictionary)
                    hasNextWords = this.hasNextWords(candidateWord);
                    isDead = !hasNextWords;
                }
                
                const wordInfo = {
                    word: candidateWord,
                    isDead: isDead
                };
                
                if (isDead) {
                    deadWords.push(wordInfo);
                } else {
                    nextWords.push(wordInfo);
                }
                
                // Track usage history
                if (!this.wordHistory.has(candidateWord)) {
                    this.wordHistory.set(candidateWord, 0);
                }
                this.wordHistory.set(candidateWord, this.wordHistory.get(candidateWord) + 1);
                
                count++;
            }
        }

        // Sort both arrays alphabetically (except for English random results)
        if (!isEnglish || maxResults) {
            nextWords.sort((a, b) => a.word.localeCompare(b.word));
            deadWords.sort((a, b) => a.word.localeCompare(b.word));
        }

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
     * @param {number} maxResults - Maximum number of results to return (for performance)
     * @returns {string[]} Array of possible previous words
     */
    findPreviousWords(word, maxResults = null) {
        if (!word || typeof word !== 'string') {
            return [];
        }

        const firstElement = this.getConnectingElement(word, false);
        const previousWords = [];
        
        // For English, set a reasonable limit to avoid performance issues
        const isEnglish = this.language === 'english';
        const limit = maxResults || (isEnglish ? 10 : null);
        let count = 0;

        // Convert to array for better performance with large dictionaries
        const wordsArray = Array.from(this.words);
        
        // For English, shuffle the words to get random results
        if (isEnglish && !maxResults) {
            // Fisher-Yates shuffle for truly random results
            for (let i = wordsArray.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [wordsArray[i], wordsArray[j]] = [wordsArray[j], wordsArray[i]];
            }
        }

        for (const candidateWord of wordsArray) {
            if (limit && count >= limit) break;
            
            const lastElement = this.getConnectingElement(candidateWord, true);
            if (lastElement === firstElement && candidateWord !== word.toLowerCase().trim()) {
                previousWords.push(candidateWord);
                count++;
            }
        }

        // Sort alphabetically (except for English random results)
        if (!isEnglish || maxResults) {
            return previousWords.sort();
        }
        
        return previousWords;
    }

    /**
     * Find next words with pagination support to avoid duplicates
     * @param {string} word - The current word
     * @param {number} maxResults - Maximum number of results to return
     * @param {string[]} excludeWords - Words to exclude from results (already shown)
     * @returns {Object} Object containing words array and hasMore boolean
     */
    findNextWordsPaginated(word, maxResults = 10, excludeWords = []) {
        if (!word || typeof word !== 'string') {
            return { words: [], hasMore: false };
        }

        const lastElement = this.getConnectingElement(word, true);
        const nextWords = [];
        const deadWords = [];
        const excludeSet = new Set(excludeWords.map(w => w.toLowerCase()));
        
        // For English, always use random selection
        const isEnglish = this.language === 'english';
        let count = 0;
        let totalAvailable = 0;

        // Convert to array for better performance with large dictionaries
        const wordsArray = Array.from(this.words);
        
        // For English, shuffle the words to get different random results each time
        if (isEnglish) {
            // Fisher-Yates shuffle for truly random results
            for (let i = wordsArray.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [wordsArray[i], wordsArray[j]] = [wordsArray[j], wordsArray[i]];
            }
        }

        for (const candidateWord of wordsArray) {
            const firstElement = this.getConnectingElement(candidateWord, false);
            if (firstElement === lastElement && candidateWord !== word.toLowerCase().trim()) {
                totalAvailable++;
                
                // Skip if this word is in the exclude list
                if (excludeSet.has(candidateWord.toLowerCase())) {
                    continue;
                }
                
                if (count >= maxResults) {
                    // We found enough results, but there are more available
                    break;
                }
                
                // For English, skip dead word checking to improve performance
                let hasNextWords = true;
                let isDead = false;
                
                if (!isEnglish) {
                    // Only check for dead words in Vietnamese (smaller dictionary)
                    hasNextWords = this.hasNextWords(candidateWord);
                    isDead = !hasNextWords;
                }
                
                const wordInfo = {
                    word: candidateWord,
                    isDead: isDead
                };
                
                if (isDead) {
                    deadWords.push(wordInfo);
                } else {
                    nextWords.push(wordInfo);
                }
                
                count++;
            }
        }

        // Sort both arrays alphabetically (except for English random results)
        if (!isEnglish) {
            nextWords.sort((a, b) => a.word.localeCompare(b.word));
            deadWords.sort((a, b) => a.word.localeCompare(b.word));
        }

        // Combine results
        const result = [...deadWords, ...nextWords];
        const hasMore = totalAvailable > (excludeWords.length + result.length);

        return { words: result, hasMore };
    }

    /**
     * Find previous words with pagination support to avoid duplicates
     * @param {string} word - The current word
     * @param {number} maxResults - Maximum number of results to return
     * @param {string[]} excludeWords - Words to exclude from results (already shown)
     * @returns {Object} Object containing words array and hasMore boolean
     */
    findPreviousWordsPaginated(word, maxResults = 10, excludeWords = []) {
        if (!word || typeof word !== 'string') {
            return { words: [], hasMore: false };
        }

        const firstElement = this.getConnectingElement(word, false);
        const previousWords = [];
        const excludeSet = new Set(excludeWords.map(w => w.toLowerCase()));
        
        // For English, always use random selection
        const isEnglish = this.language === 'english';
        let count = 0;
        let totalAvailable = 0;

        // Convert to array for better performance with large dictionaries
        const wordsArray = Array.from(this.words);
        
        // For English, shuffle the words to get different random results each time
        if (isEnglish) {
            // Fisher-Yates shuffle for truly random results
            for (let i = wordsArray.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [wordsArray[i], wordsArray[j]] = [wordsArray[j], wordsArray[i]];
            }
        }

        for (const candidateWord of wordsArray) {
            const lastElement = this.getConnectingElement(candidateWord, true);
            if (lastElement === firstElement && candidateWord !== word.toLowerCase().trim()) {
                totalAvailable++;
                
                // Skip if this word is in the exclude list
                if (excludeSet.has(candidateWord.toLowerCase())) {
                    continue;
                }
                
                if (count >= maxResults) {
                    // We found enough results, but there are more available
                    break;
                }
                
                previousWords.push(candidateWord);
                count++;
            }
        }

        // Sort alphabetically (except for English random results)
        if (!isEnglish) {
            previousWords.sort();
        }
        
        const hasMore = totalAvailable > (excludeWords.length + previousWords.length);
        
        return { words: previousWords, hasMore };
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

        // Validate that the start word exists in the dictionary
        if (!this.hasWord(startWord)) {
            return [];
        }

        // Ensure maxChains is between 1-5 as per updated requirements
        maxChains = Math.max(1, Math.min(5, maxChains));

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
     * Balanced optimization for performance and chain finding capability
     * @private
     */
    _findChainsToDeadWordsIterative(startWord, chains, chainStrings, maxChains, maxLength) {
        const queue = [[startWord]]; // Simple FIFO queue for BFS
        let processedCount = 0;
        const maxProcessed = 1000; // Balanced limit for good performance and results
        const visitedWords = new Set(); // Cache to avoid re-processing same words
        const deadWordCache = new Map(); // Cache dead word status
        
        while (queue.length > 0 && chains.length < maxChains && processedCount < maxProcessed) {
            const currentChain = queue.shift();
            processedCount++;
            
            // Skip if chain is too long
            if (currentChain.length > maxLength) {
                continue;
            }
            
            const currentWord = currentChain[currentChain.length - 1];
            const currentDepth = currentChain.length;
            
            // Avoid revisiting same word at same depth
            const cacheKey = `${currentWord}_${currentDepth}`;
            if (visitedWords.has(cacheKey)) {
                continue;
            }
            visitedWords.add(cacheKey);
            
            // Check if current word is dead (cached lookup)
            let isDeadWord = false;
            if (deadWordCache.has(currentWord)) {
                isDeadWord = deadWordCache.get(currentWord);
            } else {
                const nextWordsData = this.findNextWords(currentWord, false, true);
                isDeadWord = nextWordsData.length === 0;
                deadWordCache.set(currentWord, isDeadWord);
            }
            
            if (isDeadWord && currentChain.length >= 2) {
                // Found a dead word chain
                const chainKey = currentChain.join('|');
                if (!chainStrings.has(chainKey)) {
                    chains.push([...currentChain]);
                    chainStrings.add(chainKey);
                }
            } else if (!isDeadWord && currentChain.length < maxLength) {
                // Continue building chain
                const nextWordsData = this.findNextWords(currentWord, true, true); // Prioritize dead words
                
                // Moderate pruning: take first 2 words to balance performance and results
                const wordsToTry = nextWordsData.slice(0, 2);
                
                for (const nextWord of wordsToTry) {
                    // Avoid cycles
                    if (currentChain.includes(nextWord)) {
                        continue;
                    }
                    
                    const newChain = [...currentChain, nextWord];
                    
                    // Check if this next word is dead - if so, we found a valid chain
                    let nextWordIsDead = false;
                    if (deadWordCache.has(nextWord)) {
                        nextWordIsDead = deadWordCache.get(nextWord);
                    } else {
                        const nextWordNexts = this.findNextWords(nextWord, false, true);
                        nextWordIsDead = nextWordNexts.length === 0;
                        deadWordCache.set(nextWord, nextWordIsDead);
                    }
                    
                    if (nextWordIsDead && newChain.length >= 2) {
                        // Found a chain ending with a dead word
                        const chainKey = newChain.join('|');
                        if (!chainStrings.has(chainKey)) {
                            chains.push([...newChain]);
                            chainStrings.add(chainKey);
                        }
                    } else if (!nextWordIsDead) {
                        // Continue building chain only if next word is not dead
                        const newChainKey = newChain.join('|');
                        if (!chainStrings.has(newChainKey)) {
                            queue.push(newChain);
                        }
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
            console.log('Bỏ qua cập nhật từ "kết thúc" do từ điển lớn (tối ưu hóa hiệu năng)');
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
     * Set language and reload dictionary
     * @param {string} language - 'vietnamese' or 'english'
     */
    setLanguage(language = 'vietnamese') {
        const oldLanguage = this.language;
        this.language = language.toLowerCase();
        
        if (this.language !== 'vietnamese' && this.language !== 'english') {
            this.language = 'vietnamese';
        }
        
        // Only reload if language actually changed
        if (oldLanguage !== this.language) {
            // Clear existing dictionary words (but keep user words)
            this.words.clear();
            this.deadWords.clear();
            
            // Reload appropriate dictionary
            if (this.language === 'english') {
                this.addWords(englishDict.getAllWords());
            } else {
                this.addWords(vietnameseDict.getAllWords());
                this.addWords(hongocducDict.getAllWords());
                this.addWords(tudientvDict.getAllWords());
                this.addWords(wiktionaryDict.getAllWords());
            }
            
            // Re-add user words without language-specific validation
            const userWordsArray = Array.from(this.userWords);
            this.userWords.clear();
            if (userWordsArray.length > 0) {
                // Add user words directly without validation to preserve cross-language words
                userWordsArray.forEach(word => {
                    this.words.add(word);
                    this.userWords.add(word);
                });
            }
            
            console.log(`Language changed to ${this.language}`);
        }
    }

    /**
     * Get current language
     * @returns {string} Current language ('vietnamese' or 'english')
     */
    getLanguage() {
        return this.language;
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

    /**
     * Kiểm tra xem một từ có tồn tại trong từ điển không
     * @param {string} word - Từ cần kiểm tra
     * @returns {boolean} true nếu từ tồn tại trong từ điển
     */
    hasWord(word) {
        if (!word || typeof word !== 'string') {
            return false;
        }
        const normalizedWord = word.toLowerCase().trim();
        return this.words.has(normalizedWord);
    }
}

// Export the class for use in other modules
module.exports = WordChainHelper;

// Nếu chạy trực tiếp, hiển thị ví dụ sử dụng
if (require.main === module) {
    console.log('Word Chain Helper - Multi-language Support Demo');
    console.log('=================================================');
    
    // Vietnamese example
    console.log('\n🇻🇳 VIETNAMESE (Tiếng Việt):');
    const vietnameseHelper = new WordChainHelper('vietnamese');
    
    console.log('Language:', vietnameseHelper.getLanguage());
    console.log('Total words in dictionary:', vietnameseHelper.getAllWords().length);
    console.log('Sample words:', vietnameseHelper.getAllWords().slice(0, 5));
    
    console.log('\nWord chaining tests:');
    console.log('Can chain "con voi" → "voi con":', vietnameseHelper.canChain('con voi', 'voi con'));
    console.log('Can chain "bánh mì" → "mì quảng":', vietnameseHelper.canChain('bánh mì', 'mì quảng'));
    
    console.log('\nNext words:');
    console.log('After "bánh mì":', vietnameseHelper.findNextWords('bánh mì', true, true).slice(0, 3));
    
    // English example
    console.log('\n🇺🇸 ENGLISH:');
    const englishHelper = new WordChainHelper('english');
    
    console.log('Language:', englishHelper.getLanguage());
    console.log('Total words in dictionary:', englishHelper.getAllWords().length);
    console.log('Sample words:', englishHelper.getAllWords().slice(0, 5));
    
    console.log('\nWord chaining tests (letter-based):');
    console.log('Can chain "cat" → "top":', englishHelper.canChain('cat', 'top'));
    console.log('Can chain "dog" → "green":', englishHelper.canChain('dog', 'green'));
    console.log('Can chain "apple" → "egg":', englishHelper.canChain('apple', 'egg'));
    
    console.log('\nNext words:');
    console.log('After "cat":', englishHelper.findNextWords('cat', true, true).slice(0, 5));
    console.log('After "dog":', englishHelper.findNextWords('dog', true, true).slice(0, 5));
    
    // Validation tests
    console.log('\nWord validation:');
    console.log('Vietnamese "bánh mì" exists:', vietnameseHelper.hasWord('bánh mì'));
    console.log('English "apple" exists:', englishHelper.hasWord('apple'));
    console.log('English "cat" exists:', englishHelper.hasWord('cat'));
    
    console.log('\n🎯 Both Vietnamese syllable-based and English letter-based chaining supported!');
    console.log('🔄 Use setLanguage() to switch between languages programmatically.');
}
