/**
 * Word Chain Helper
 * A utility to help with word chain games where the last letter of one word
 * must match the first letter of the next word.
 */

class WordChainHelper {
    constructor() {
        this.words = new Set();
    }

    /**
     * Add words to the word database
     * @param {string[]} wordList - Array of words to add
     */
    addWords(wordList) {
        wordList.forEach(word => {
            if (typeof word === 'string' && word.length > 0) {
                this.words.add(word.toLowerCase());
            }
        });
    }

    /**
     * Check if two words can be chained (last letter of first = first letter of second)
     * @param {string} word1 - First word
     * @param {string} word2 - Second word
     * @returns {boolean} True if words can be chained
     */
    canChain(word1, word2) {
        if (!word1 || !word2 || typeof word1 !== 'string' || typeof word2 !== 'string') {
            return false;
        }
        
        const lastLetter = word1.toLowerCase().slice(-1);
        const firstLetter = word2.toLowerCase().charAt(0);
        
        return lastLetter === firstLetter;
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

        const lastLetter = word.toLowerCase().slice(-1);
        const nextWords = [];

        this.words.forEach(candidateWord => {
            if (candidateWord.charAt(0) === lastLetter && candidateWord !== word.toLowerCase()) {
                nextWords.push(candidateWord);
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

        const firstLetter = word.toLowerCase().charAt(0);
        const previousWords = [];

        this.words.forEach(candidateWord => {
            if (candidateWord.slice(-1) === firstLetter && candidateWord !== word.toLowerCase()) {
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
     * Get statistics about the word database
     * @returns {object} Statistics object
     */
    getStats() {
        const letterStats = {};
        let totalWords = this.words.size;

        this.words.forEach(word => {
            const firstLetter = word.charAt(0);
            const lastLetter = word.slice(-1);

            if (!letterStats[firstLetter]) {
                letterStats[firstLetter] = { starting: 0, ending: 0 };
            }
            if (!letterStats[lastLetter]) {
                letterStats[lastLetter] = { starting: 0, ending: 0 };
            }

            letterStats[firstLetter].starting++;
            letterStats[lastLetter].ending++;
        });

        return {
            totalWords,
            letterStats
        };
    }

    /**
     * Clear all words from the database
     */
    clear() {
        this.words.clear();
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
    const helper = new WordChainHelper();
    
    // Add some example words
    const exampleWords = [
        'apple', 'elephant', 'tiger', 'rabbit', 'tree', 'eagle',
        'lemon', 'orange', 'grape', 'banana', 'ant', 'turtle'
    ];
    
    helper.addWords(exampleWords);
    
    console.log('Word Chain Helper Example:');
    console.log('=========================');
    
    console.log('\nAll words:', helper.getAllWords());
    
    console.log('\nTesting word chaining:');
    console.log('Can "apple" chain to "elephant"?', helper.canChain('apple', 'elephant'));
    console.log('Can "elephant" chain to "tiger"?', helper.canChain('elephant', 'tiger'));
    
    console.log('\nWords that can follow "apple":', helper.findNextWords('apple'));
    console.log('Words that can come before "elephant":', helper.findPreviousWords('elephant'));
    
    console.log('\nValidating chains:');
    const chain1 = ['apple', 'elephant', 'tiger'];
    const chain2 = ['apple', 'tiger', 'rabbit'];
    console.log(`Chain ${chain1.join(' -> ')} is valid:`, helper.validateChain(chain1));
    console.log(`Chain ${chain2.join(' -> ')} is valid:`, helper.validateChain(chain2));
    
    console.log('\nDatabase statistics:');
    console.log(helper.getStats());
}