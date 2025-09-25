/**
 * English Dictionary Module
 * Provides English words for word chaining game
 * Uses an-array-of-english-words package
 */

const englishWords = require('an-array-of-english-words');

class EnglishDictionary {
    constructor() {
        // Filter to only include single words without special characters
        // and words longer than 1 character for better game experience
        this.words = englishWords.filter(word => 
            word.length > 1 && 
            !word.includes('-') && 
            !word.includes("'") && 
            !word.includes('.') &&
            /^[a-zA-Z]+$/.test(word)
        ).map(word => word.toLowerCase());
    }

    /**
     * Get all English words
     * @returns {string[]} Array of English words
     */
    getAllWords() {
        return [...this.words];
    }

    /**
     * Check if a word exists in the English dictionary
     * @param {string} word - Word to check
     * @returns {boolean} True if word exists
     */
    hasWord(word) {
        return this.words.includes(word.toLowerCase().trim());
    }

    /**
     * Get words count
     * @returns {number} Number of words in dictionary
     */
    getWordCount() {
        return this.words.length;
    }
}

// Create and export a singleton instance
const englishDict = new EnglishDictionary();
module.exports = englishDict;