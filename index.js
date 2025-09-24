/**
 * Word Chain Helper
 * A utility to help with word chain games where the last letter of one word
 * must match the first letter of the next word (English) or the last syllable
 * of one compound word must match the first syllable of the next word (Vietnamese).
 */

const vietnameseDict = require('./vietnamese-dictionary');

class WordChainHelper {
    constructor(language = 'english') {
        this.words = new Set();
        this.language = language.toLowerCase();
        this.deadWords = new Set(); // Words that have no valid next words
        this.wordHistory = new Map(); // Track word usage history
        this.userWords = new Set(); // User-added words
        
        // Load Vietnamese dictionary if Vietnamese language is selected
        if (this.language === 'vietnamese' || this.language === 'tiếng việt') {
            this.addWords(vietnameseDict.getAllWords());
        }
    }

    /**
     * Extract syllables from a Vietnamese compound word
     * @param {string} word - Vietnamese compound word
     * @returns {string[]} Array of syllables
     */
    extractSyllables(word) {
        if (!word || typeof word !== 'string') return [];
        
        // For Vietnamese, split by spaces (compound words are space-separated)
        if (this.language === 'vietnamese' || this.language === 'tiếng việt') {
            return word.trim().toLowerCase().split(/\s+/);
        }
        
        // For English, each letter is a "syllable" (maintaining compatibility)
        return word.toLowerCase().split('');
    }

    /**
     * Get the connecting element for chaining (last letter for English, last syllable for Vietnamese)
     * @param {string} word - The word to get connecting element from
     * @param {boolean} isLast - If true, get last element; if false, get first element  
     * @returns {string} The connecting element
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
     * Validate if a word is a proper 2-syllable compound word (for Vietnamese)
     * @param {string} word - Word to validate
     * @returns {boolean} True if valid compound word
     */
    isValidCompoundWord(word) {
        if (this.language !== 'vietnamese' && this.language !== 'tiếng việt') {
            return word && word.length > 0; // For English, any non-empty word is valid
        }
        
        const syllables = this.extractSyllables(word);
        return syllables.length === 2; // Vietnamese compound words should have exactly 2 syllables
    }
    /**
     * Add words to the word database
     * @param {string[]} wordList - Array of words to add
     * @param {boolean} isUserAdded - Whether these are user-added words
     */
    addWords(wordList, isUserAdded = false) {
        wordList.forEach(word => {
            if (typeof word === 'string' && word.length > 0) {
                const normalizedWord = word.toLowerCase().trim();
                
                // For Vietnamese, validate compound words
                if (this.language === 'vietnamese' || this.language === 'tiếng việt') {
                    if (this.isValidCompoundWord(normalizedWord)) {
                        this.words.add(normalizedWord);
                        if (isUserAdded) {
                            this.userWords.add(normalizedWord);
                        }
                    }
                } else {
                    // For English, add any valid word
                    this.words.add(normalizedWord);
                    if (isUserAdded) {
                        this.userWords.add(normalizedWord);
                    }
                }
            }
        });
        
        // Update dead words after adding new words
        this.updateDeadWords();
    }

    /**
     * Remove words from the database
     * @param {string[]} wordList - Array of words to remove
     */
    removeWords(wordList) {
        wordList.forEach(word => {
            if (typeof word === 'string') {
                const normalizedWord = word.toLowerCase().trim();
                this.words.delete(normalizedWord);
                this.userWords.delete(normalizedWord);
                this.deadWords.delete(normalizedWord);
            }
        });
        
        // Update dead words after removing words
        this.updateDeadWords();
    }

    /**
     * Update a word in the database (replace old with new)
     * @param {string} oldWord - Word to replace
     * @param {string} newWord - New word to add
     */
    updateWord(oldWord, newWord) {
        if (this.words.has(oldWord.toLowerCase().trim())) {
            this.removeWords([oldWord]);
            this.addWords([newWord], this.userWords.has(oldWord.toLowerCase().trim()));
        }
    }

    /**
     * Check if two words can be chained 
     * (last letter of first = first letter of second for English)
     * (last syllable of first = first syllable of second for Vietnamese)
     * @param {string} word1 - First word
     * @param {string} word2 - Second word
     * @returns {boolean} True if words can be chained
     */
    canChain(word1, word2) {
        if (!word1 || !word2 || typeof word1 !== 'string' || typeof word2 !== 'string') {
            return false;
        }
        
        const connectingElement1 = this.getConnectingElement(word1, true); // last element
        const connectingElement2 = this.getConnectingElement(word2, false); // first element
        
        return connectingElement1 === connectingElement2 && connectingElement1.length > 0;
    }

    /**
     * Find all possible next words that can follow the given word
     * @param {string} word - The current word
     * @returns {string[]} Array of possible next words
     */
    findNextWords(word) {
        if (!word || typeof word !== 'string') {
            return [];
        }

        const lastElement = this.getConnectingElement(word, true);
        const nextWords = [];

        this.words.forEach(candidateWord => {
            const firstElement = this.getConnectingElement(candidateWord, false);
            if (firstElement === lastElement && candidateWord !== word.toLowerCase().trim()) {
                nextWords.push(candidateWord);
                
                // Track usage history
                if (!this.wordHistory.has(candidateWord)) {
                    this.wordHistory.set(candidateWord, 0);
                }
                this.wordHistory.set(candidateWord, this.wordHistory.get(candidateWord) + 1);
            }
        });

        return nextWords.sort();
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
     */
    updateDeadWords() {
        this.deadWords.clear();
        
        this.words.forEach(word => {
            const nextWords = this.findNextWords(word);
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
     * Get current language
     * @returns {string} Current language
     */
    getLanguage() {
        return this.language;
    }

    /**
     * Set language and reload appropriate dictionary
     * @param {string} language - Language to set ('english', 'vietnamese', 'tiếng việt')
     */
    setLanguage(language) {
        this.clear();
        this.language = language.toLowerCase();
        
        // Load Vietnamese dictionary if Vietnamese language is selected
        if (this.language === 'vietnamese' || this.language === 'tiếng việt') {
            this.addWords(vietnameseDict.getAllWords());
        }
    }

    /**
     * Get all words in the database
     * @returns {string[]} Array of all words
     */
    getAllWords() {
        return Array.from(this.words).sort();
    }
}

// Export the class for use in other modules
module.exports = WordChainHelper;

// If running directly, provide some example usage
if (require.main === module) {
    console.log('Word Chain Helper Example - Vietnamese (Từ ghép tiếng Việt):');
    console.log('====================================================');
    
    // Vietnamese example
    const vietnameseHelper = new WordChainHelper('vietnamese');
    
    console.log('\nTổng số từ trong từ điển:', vietnameseHelper.getAllWords().length);
    console.log('Một số từ mẫu:', vietnameseHelper.getAllWords().slice(0, 10));
    
    console.log('\nKiểm tra từ nối:');
    console.log('Có thể nối "con voi" với "voi con" không?', vietnameseHelper.canChain('con voi', 'voi con'));
    console.log('Có thể nối "bánh mì" với "mì quảng" không?', vietnameseHelper.canChain('bánh mì', 'mì quảng'));
    
    console.log('\nTìm từ có thể theo sau "con voi":', vietnameseHelper.findNextWords('con voi'));
    console.log('Tìm từ có thể đứng trước "mì quảng":', vietnameseHelper.findPreviousWords('mì quảng'));
    
    console.log('\nKiểm tra chuỗi từ:');
    const chain1 = ['bánh mì', 'mì quảng', 'quảng nam'];
    const chain2 = ['con voi', 'voi con', 'con chó'];
    console.log(`Chuỗi "${chain1.join(' → ')}" hợp lệ:`, vietnameseHelper.validateChain(chain1));
    console.log(`Chuỗi "${chain2.join(' → ')}" hợp lệ:`, vietnameseHelper.validateChain(chain2));
    
    // Add some user words
    vietnameseHelper.addWords(['xe hơi', 'hơi nước', 'nước mắm'], true);
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

    // English example for comparison
    console.log('\n\n' + '='.repeat(50));
    console.log('Word Chain Helper Example - English:');
    console.log('=====================================');
    
    const helper = new WordChainHelper('english');
    
    // Add some example words
    const exampleWords = [
        'apple', 'elephant', 'tiger', 'rabbit', 'tree', 'eagle',
        'lemon', 'orange', 'grape', 'banana', 'ant', 'turtle'
    ];
    
    helper.addWords(exampleWords);
    
    console.log('\nAll words:', helper.getAllWords());
    
    console.log('\nTesting word chaining:');
    console.log('Can "apple" chain to "elephant"?', helper.canChain('apple', 'elephant'));
    console.log('Can "elephant" chain to "tiger"?', helper.canChain('elephant', 'tiger'));
    
    console.log('\nWords that can follow "apple":', helper.findNextWords('apple'));
    console.log('Words that can come before "elephant":', helper.findPreviousWords('elephant'));
    
    console.log('\nValidating chains:');
    const englishChain1 = ['apple', 'elephant', 'tiger'];
    const englishChain2 = ['apple', 'tiger', 'rabbit'];
    console.log(`Chain ${englishChain1.join(' -> ')} is valid:`, helper.validateChain(englishChain1));
    console.log(`Chain ${englishChain2.join(' -> ')} is valid:`, helper.validateChain(englishChain2));
    
    console.log('\nDatabase statistics:');
    console.log(helper.getStats());
}