/**
 * Word Chain Helper for Chrome Extension
 * Browser-compatible version without Node.js dependencies
 */

class WordChainHelper {
    constructor(language = 'vietnamese') {
        this.words = new Set();
        this.language = language.toLowerCase();
        this.deadWords = new Set();
        this.wordHistory = new Map();
        this.userWords = {
            vietnamese: new Set(),
            english: new Set()
        };
        
        // Initialize dictionaries
        this.initializeDictionaries();
        
        // Load user words from Chrome storage
        this.loadUserWords();
    }

    async initializeDictionaries() {
        // Wait for dictionary data to be available
        if (typeof VIETNAMESE_WORDS === 'undefined') {
            await this.waitForDictionaries();
        }
        
        if (this.language === 'english') {
            // Load English dictionary
            this.addWords(ENGLISH_WORDS);
        } else {
            // Load Vietnamese dictionaries
            this.language = 'vietnamese';
            this.addWords(this.filterTwoSyllableWords(VIETNAMESE_WORDS));
            this.addWords(this.filterTwoSyllableWords(HONGOCDUC_WORDS));
            this.addWords(this.filterTwoSyllableWords(TUDIENTV_WORDS));
            this.addWords(this.filterTwoSyllableWords(WIKTIONARY_WORDS));
        }
        this.updateDeadWords();
    }

    async waitForDictionaries() {
        // Simple wait for dictionary data to be loaded
        return new Promise((resolve) => {
            const check = () => {
                if (typeof VIETNAMESE_WORDS !== 'undefined') {
                    resolve();
                } else {
                    setTimeout(check, 100);
                }
            };
            check();
        });
    }

    extractSyllables(word) {
        if (!word || typeof word !== 'string') return [];
        
        if (this.language === 'english') {
            return [word.trim().toLowerCase()];
        }
        
        return word.trim().toLowerCase().split(/\s+/);
    }

    getConnectingElement(word, isLast = true) {
        if (!word || typeof word !== 'string') return '';
        
        if (this.language === 'english') {
            const cleanWord = word.toLowerCase().trim();
            return isLast ? cleanWord.slice(-1) : cleanWord.charAt(0);
        }
        
        const syllables = this.extractSyllables(word);
        if (syllables.length === 0) return '';
        
        return isLast ? syllables[syllables.length - 1] : syllables[0];
    }

    isValidCompoundWord(word) {
        if (!word || typeof word !== 'string') return false;
        
        if (this.language === 'english') {
            const cleanWord = word.trim();
            return /^[a-zA-Z]+$/.test(cleanWord) && cleanWord.length > 1;
        }
        
        const syllables = this.extractSyllables(word);
        return syllables.length === 2 && syllables.every(syllable => syllable.length > 0);
    }
    
    filterTwoSyllableWords(wordList) {
        if (this.language !== 'vietnamese') {
            return wordList;
        }
        
        return wordList.filter(word => {
            if (!word || typeof word !== 'string') return false;
            const syllables = this.extractSyllables(word);
            return syllables.length === 2 && syllables.every(syllable => syllable.length > 0);
        });
    }
    
    addWords(wordList, isUserAdded = false) {
        const results = {
            added: [],
            rejected: [],
            duplicates: []
        };
        
        wordList.forEach(word => {
            if (typeof word === 'string' && word.length > 0) {
                const normalizedWord = word.toLowerCase().trim();
                
                if (!isUserAdded || this.isValidCompoundWord(normalizedWord)) {
                    if (isUserAdded && this.words.has(normalizedWord)) {
                        results.duplicates.push(normalizedWord);
                    } else {
                        this.words.add(normalizedWord);
                        if (isUserAdded) {
                            this.userWords[this.language].add(normalizedWord);
                        }
                        results.added.push(normalizedWord);
                    }
                } else if (isUserAdded) {
                    results.rejected.push(normalizedWord);
                }
            }
        });
        
        if (isUserAdded && (results.added.length > 0 || results.duplicates.length > 0)) {
            this.saveUserWords();
        }
        
        if (isUserAdded || wordList.length < 1000) {
            this.updateDeadWords();
        }
        
        return isUserAdded ? results : null;
    }

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
                    this.userWords.vietnamese.delete(normalizedWord);
                    this.userWords.english.delete(normalizedWord);
                    this.deadWords.delete(normalizedWord);
                    results.removed.push(normalizedWord);
                } else {
                    results.notFound.push(normalizedWord);
                }
            }
        });
        
        if (results.removed.length > 0) {
            this.saveUserWords();
            this.updateDeadWords();
        }
        
        return results;
    }

    canChain(word1, word2) {
        if (!word1 || !word2) return false;
        
        const lastElement1 = this.getConnectingElement(word1, true);
        const firstElement2 = this.getConnectingElement(word2, false);
        
        return lastElement1 === firstElement2;
    }

    findNextWords(word, maxResults = 50, excludeWords = []) {
        const lastElement = this.getConnectingElement(word, true);
        const results = [];
        const excludeSet = new Set(excludeWords.map(w => w.toLowerCase().trim()));
        
        for (const candidateWord of this.words) {
            if (excludeSet.has(candidateWord)) continue;
            
            const firstElement = this.getConnectingElement(candidateWord, false);
            if (firstElement === lastElement) {
                results.push(candidateWord);
                if (results.length >= maxResults) break;
            }
        }
        
        return results;
    }

    findPreviousWords(word, maxResults = 50, excludeWords = []) {
        const firstElement = this.getConnectingElement(word, false);
        const results = [];
        const excludeSet = new Set(excludeWords.map(w => w.toLowerCase().trim()));
        
        for (const candidateWord of this.words) {
            if (excludeSet.has(candidateWord)) continue;
            
            const lastElement = this.getConnectingElement(candidateWord, true);
            if (lastElement === firstElement) {
                results.push(candidateWord);
                if (results.length >= maxResults) break;
            }
        }
        
        return results;
    }

    hasWord(word) {
        if (!word) return false;
        return this.words.has(word.toLowerCase().trim());
    }

    validateChain(chain) {
        if (!Array.isArray(chain) || chain.length < 2) return false;
        
        for (let i = 0; i < chain.length - 1; i++) {
            if (!this.canChain(chain[i], chain[i + 1])) {
                return false;
            }
        }
        
        return chain.every(word => this.hasWord(word));
    }

    updateDeadWords() {
        this.deadWords.clear();
        
        for (const word of this.words) {
            const nextWords = this.findNextWords(word, 1);
            if (nextWords.length === 0) {
                this.deadWords.add(word);
            }
        }
    }

    getStats() {
        const totalUserWords = this.userWords.vietnamese.size + this.userWords.english.size;
        
        return {
            totalWords: this.words.size,
            userAddedWords: totalUserWords,
            deadWords: this.deadWords.size,
            currentLanguage: this.language
        };
    }

    getAllWords() {
        return Array.from(this.words);
    }

    getUserWords() {
        return Array.from(this.userWords[this.language]);
    }

    getLanguage() {
        return this.language;
    }

    async setLanguage(language) {
        if (language !== this.language) {
            this.language = language.toLowerCase();
            this.words.clear();
            this.deadWords.clear();
            await this.initializeDictionaries();
        }
    }

    getRandomWords(count = 10) {
        const vietnameseWords = VIETNAMESE_WORDS.sort(() => 0.5 - Math.random()).slice(0, count);
        const englishWords = ENGLISH_WORDS.sort(() => 0.5 - Math.random()).slice(0, count);
        
        return {
            vietnamese: vietnameseWords,
            english: englishWords,
            currentLanguage: this.language
        };
    }

    validateWordComplete(word) {
        if (!word) {
            return {
                word: word,
                isValid: false,
                hasInDictionary: false,
                message: 'Vui lòng nhập từ cần kiểm tra'
            };
        }

        const normalizedWord = word.toLowerCase().trim();
        const isValidFormat = this.isValidCompoundWord(normalizedWord);
        const hasInDict = this.hasWord(normalizedWord);

        let message = '';
        if (!isValidFormat) {
            if (this.language === 'vietnamese') {
                message = 'Từ không hợp lệ. Vui lòng nhập từ ghép có đúng 2 âm tiết (VD: "con voi", "bánh mì")';
            } else {
                message = 'Từ không hợp lệ. Vui lòng nhập từ chỉ chứa chữ cái (VD: "apple", "cat")';
            }
        } else if (!hasInDict) {
            message = `Từ "${normalizedWord}" có định dạng hợp lệ nhưng không có trong từ điển ${this.language === 'vietnamese' ? 'tiếng Việt' : 'tiếng Anh'}`;
        } else {
            message = `Từ "${normalizedWord}" hợp lệ và có trong từ điển ${this.language === 'vietnamese' ? 'tiếng Việt' : 'tiếng Anh'}`;
        }

        return {
            word: normalizedWord,
            isValid: isValidFormat,
            hasInDictionary: hasInDict,
            message: message
        };
    }

    async saveUserWords() {
        const userData = {
            vietnamese: Array.from(this.userWords.vietnamese),
            english: Array.from(this.userWords.english)
        };
        
        if (typeof chrome !== 'undefined' && chrome.storage) {
            await chrome.storage.local.set({ userWords: userData });
        } else {
            // Fallback to localStorage for testing
            localStorage.setItem('userWords', JSON.stringify(userData));
        }
    }

    async loadUserWords() {
        try {
            let userData;
            
            if (typeof chrome !== 'undefined' && chrome.storage) {
                const result = await chrome.storage.local.get(['userWords']);
                userData = result.userWords;
            } else {
                // Fallback to localStorage
                const stored = localStorage.getItem('userWords');
                userData = stored ? JSON.parse(stored) : null;
            }
            
            if (userData) {
                this.userWords.vietnamese = new Set(userData.vietnamese || []);
                this.userWords.english = new Set(userData.english || []);
                
                // Add user words to main dictionary
                this.addWords(Array.from(this.userWords.vietnamese));
                this.addWords(Array.from(this.userWords.english));
            }
        } catch (error) {
            console.error('Error loading user words:', error);
        }
    }
}