#!/usr/bin/env node

/**
 * Word Chain Helper - Trợ giúp chuỗi từ
 * Helps with word chain games where each word must start with the last letter of the previous word
 */

class WordChainHelper {
    constructor() {
        this.wordList = [
            // Vietnamese words for testing
            'apple', 'elephant', 'tiger', 'rabbit', 'turtle', 'eagle',
            'ant', 'tree', 'egg', 'goat', 'table', 'elephant',
            // Add some Vietnamese words
            'ăn', 'nấu', 'uống', 'gà', 'àm', 'mèo', 'ốc', 'cá'
        ];
    }

    /**
     * Get the last character of a word (handling Vietnamese characters)
     * @param {string} word - The word to get last character from
     * @returns {string} - The last character
     */
    getLastChar(word) {
        if (!word || word.length === 0) return '';
        return word.toLowerCase().trim().slice(-1);
    }

    /**
     * Get the first character of a word (handling Vietnamese characters)
     * @param {string} word - The word to get first character from
     * @returns {string} - The first character
     */
    getFirstChar(word) {
        if (!word || word.length === 0) return '';
        return word.toLowerCase().trim().slice(0, 1);
    }

    /**
     * Check if a word can continue a chain
     * @param {string} previousWord - The previous word in the chain
     * @param {string} nextWord - The word to check
     * @returns {boolean} - True if the word can continue the chain
     */
    canContinueChain(previousWord, nextWord) {
        if (!previousWord || !nextWord) return false;
        
        const lastChar = this.getLastChar(previousWord);
        const firstChar = this.getFirstChar(nextWord);
        
        return lastChar === firstChar;
    }

    /**
     * Validate an entire word chain
     * @param {string[]} words - Array of words to validate
     * @returns {boolean} - True if the chain is valid
     */
    validateChain(words) {
        if (!words || words.length <= 1) return true;
        
        for (let i = 1; i < words.length; i++) {
            if (!this.canContinueChain(words[i-1], words[i])) {
                return false;
            }
        }
        return true;
    }

    /**
     * Find possible next words from the word list
     * @param {string} currentWord - The current word to find continuations for
     * @returns {string[]} - Array of possible next words
     */
    findNextWords(currentWord) {
        if (!currentWord) return [];
        
        const lastChar = this.getLastChar(currentWord);
        return this.wordList.filter(word => 
            this.getFirstChar(word) === lastChar && 
            word.toLowerCase() !== currentWord.toLowerCase()
        );
    }

    /**
     * Add a word to the word list
     * @param {string} word - Word to add
     */
    addWord(word) {
        if (word && !this.wordList.includes(word.toLowerCase().trim())) {
            this.wordList.push(word.toLowerCase().trim());
        }
    }

    /**
     * Start interactive mode
     */
    startInteractive() {
        console.log('🔗 Word Chain Helper - Trợ giúp chuỗi từ');
        console.log('Bắt đầu chơi! (Let\'s start playing!)');
        console.log('Nhập từ để tìm từ tiếp theo, hoặc \'quit\' để thoát\n');
        
        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const askForWord = () => {
            rl.question('Nhập từ (Enter word): ', (word) => {
                if (word.toLowerCase() === 'quit' || word.toLowerCase() === 'thoát') {
                    console.log('Tạm biệt! (Goodbye!)');
                    rl.close();
                    return;
                }

                if (!word.trim()) {
                    console.log('Vui lòng nhập một từ! (Please enter a word!)');
                    askForWord();
                    return;
                }

                const nextWords = this.findNextWords(word);
                
                console.log(`\n📝 Từ của bạn: "${word}"`);
                console.log(`🔍 Ký tự cuối: "${this.getLastChar(word)}"`);
                
                if (nextWords.length > 0) {
                    console.log(`✅ Các từ có thể tiếp theo (${nextWords.length} từ):`);
                    nextWords.forEach(w => console.log(`   → ${w}`));
                } else {
                    console.log('❌ Không tìm thấy từ nào có thể tiếp theo!');
                    console.log('💡 Hãy thử thêm từ vào từ điển bằng cách nhập: add [từ]');
                }
                
                console.log(''); // Empty line
                askForWord();
            });
        };

        askForWord();
    }
}

// CLI handling
if (require.main === module) {
    const helper = new WordChainHelper();
    
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        helper.startInteractive();
    } else if (args[0] === 'validate') {
        const words = args.slice(1);
        const isValid = helper.validateChain(words);
        console.log(`Chain: ${words.join(' → ')}`);
        console.log(`Valid: ${isValid ? '✅ Yes' : '❌ No'}`);
    } else if (args[0] === 'find') {
        const word = args[1];
        if (word) {
            const nextWords = helper.findNextWords(word);
            console.log(`Word: "${word}"`);
            console.log(`Next words: ${nextWords.join(', ') || 'None found'}`);
        } else {
            console.log('Please provide a word to find continuations for');
        }
    } else {
        console.log('Usage:');
        console.log('  node index.js                    # Interactive mode');
        console.log('  node index.js validate word1 word2 word3  # Validate chain');
        console.log('  node index.js find word          # Find next words');
    }
}

module.exports = WordChainHelper;