/**
 * Word Chain Helper Examples
 * Demonstrating various use cases of the word chain helper
 */

const WordChainHelper = require('./index.js');

console.log('=== Word Chain Helper Examples ===\n');

// Example 1: Basic usage
console.log('1. Basic Word Chain Operations:');
console.log('--------------------------------');
const helper = new WordChainHelper();
const words = ['cat', 'tiger', 'rabbit', 'tree', 'elephant', 'turtle', 'eagle', 'lemon'];
helper.addWords(words);

console.log('Added words:', words.join(', '));
console.log('Can "cat" chain to "tiger"?', helper.canChain('cat', 'tiger'));
console.log('Can "tiger" chain to "rabbit"?', helper.canChain('tiger', 'rabbit'));
console.log('Words that follow "tiger":', helper.findNextWords('tiger').join(', ') || 'None');
console.log('Words before "elephant":', helper.findPreviousWords('elephant').join(', ') || 'None');

// Example 2: Chain validation
console.log('\n2. Chain Validation:');
console.log('-------------------');
const chains = [
    ['cat', 'tiger', 'rabbit'],
    ['elephant', 'tiger', 'rabbit', 'tree'],
    ['cat', 'turtle', 'eagle'],
    ['lemon', 'tiger', 'eagle', 'elephant']
];

chains.forEach(chain => {
    const isValid = helper.validateChain(chain);
    console.log(`${chain.join(' → ')} is ${isValid ? 'VALID' : 'INVALID'}`);
});

// Example 3: Building a word chain game
console.log('\n3. Word Chain Game Simulation:');
console.log('------------------------------');
const gameHelper = new WordChainHelper();
const gameWords = [
    'apple', 'elephant', 'tiger', 'rabbit', 'tree', 'eagle', 'lemon', 'orange',
    'grape', 'elephant', 'turkey', 'yak', 'kangaroo', 'owl', 'lion', 'newt'
];
gameHelper.addWords(gameWords);

function findLongestChain(startWord, usedWords = new Set()) {
    usedWords.add(startWord.toLowerCase());
    const nextWords = gameHelper.findNextWords(startWord)
        .filter(word => !usedWords.has(word));
    
    if (nextWords.length === 0) {
        return [startWord];
    }
    
    let longestChain = [startWord];
    
    for (const nextWord of nextWords) {
        const chain = findLongestChain(nextWord, new Set(usedWords));
        if (chain.length + 1 > longestChain.length) {
            longestChain = [startWord, ...chain];
        }
    }
    
    return longestChain;
}

const longestChain = findLongestChain('apple');
console.log('Longest chain starting with "apple":', longestChain.join(' → '));
console.log('Chain length:', longestChain.length);

// Example 4: Statistics and analysis
console.log('\n4. Word Database Analysis:');
console.log('-------------------------');
const stats = gameHelper.getStats();
console.log('Total words in database:', stats.totalWords);

const sortedLetters = Object.keys(stats.letterStats)
    .sort((a, b) => stats.letterStats[b].starting - stats.letterStats[a].starting);

console.log('\nMost common starting letters:');
sortedLetters.slice(0, 5).forEach(letter => {
    const count = stats.letterStats[letter].starting;
    console.log(`  ${letter.toUpperCase()}: ${count} word(s)`);
});

console.log('\nLetters that could cause dead ends (more ending than starting):');
Object.keys(stats.letterStats).forEach(letter => {
    const stat = stats.letterStats[letter];
    if (stat.ending > stat.starting) {
        console.log(`  ${letter.toUpperCase()}: ${stat.ending} ending, ${stat.starting} starting`);
    }
});

// Example 5: Interactive word suggestions
console.log('\n5. Word Suggestion System:');
console.log('-------------------------');
function suggestStrategy(currentWord) {
    const nextWords = gameHelper.findNextWords(currentWord);
    if (nextWords.length === 0) {
        return 'No valid moves available!';
    }
    
    // Find words that have the most continuation options
    const wordScores = nextWords.map(word => ({
        word,
        continuations: gameHelper.findNextWords(word).length
    }));
    
    wordScores.sort((a, b) => b.continuations - a.continuations);
    
    return `Best moves from "${currentWord}": ${wordScores.slice(0, 3).map(w => 
        `${w.word} (${w.continuations} options)`
    ).join(', ')}`;
}

console.log(suggestStrategy('elephant'));
console.log(suggestStrategy('tiger'));
console.log(suggestStrategy('lemon'));

console.log('\n=== Examples Complete ===');