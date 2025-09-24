# Word Chain Helper

A Node.js utility to help with word chain games where the last letter of one word must match the first letter of the next word.

## Features

- Add and manage word databases
- Check if two words can be chained together
- Find possible next/previous words in a chain
- Validate entire word chains
- Get statistics about your word database
- Interactive CLI interface

## Installation

Clone the repository and navigate to the project directory:

```bash
git clone https://github.com/nguongthienTieu/word-chain-helper.git
cd word-chain-helper
```

## Usage

### Programmatic Usage

```javascript
const WordChainHelper = require('./index.js');

const helper = new WordChainHelper();

// Add words to the database
helper.addWords(['apple', 'elephant', 'tiger', 'rabbit']);

// Check if two words can be chained
console.log(helper.canChain('apple', 'elephant')); // true
console.log(helper.canChain('apple', 'tiger')); // false

// Find possible next words
console.log(helper.findNextWords('apple')); // ['elephant']

// Validate a chain
console.log(helper.validateChain(['apple', 'elephant', 'tiger'])); // true
```

### CLI Usage

Start the interactive CLI:

```bash
node cli.js
```

Available commands in the CLI:
- `add <word1> [word2] ...` - Add words to the database
- `chain <word1> <word2>` - Check if two words can be chained
- `next <word>` - Find words that can follow the given word
- `prev <word>` - Find words that can come before the given word
- `validate <word1> <word2> ...` - Validate a chain of words
- `stats` - Show database statistics
- `words` - Show all words in the database
- `clear` - Clear all words from the database
- `help` - Show help message
- `quit` or `exit` - Exit the program

### Quick Test

Run the example with default words:

```bash
node index.js
```

## API Reference

### WordChainHelper Class

#### Methods

- `addWords(wordList)` - Add an array of words to the database
- `canChain(word1, word2)` - Check if two words can be chained
- `findNextWords(word)` - Find all words that can follow the given word
- `findPreviousWords(word)` - Find all words that can come before the given word
- `validateChain(chain)` - Validate if an entire chain of words is valid
- `getStats()` - Get statistics about the word database
- `clear()` - Clear all words from the database
- `getAllWords()` - Get all words in the database

## Examples

### Example 1: Basic Word Chaining
```javascript
const helper = new WordChainHelper();
helper.addWords(['cat', 'tiger', 'rabbit', 'tree']);

console.log(helper.canChain('cat', 'tiger')); // true (cat -> tiger)
console.log(helper.canChain('tiger', 'rabbit')); // false (tiger -> rabbit)
```

### Example 2: Finding Chains
```javascript
const helper = new WordChainHelper();
helper.addWords(['apple', 'elephant', 'tiger', 'rabbit', 'tree', 'eagle']);

const nextWords = helper.findNextWords('tiger');
console.log(nextWords); // ['rabbit', 'tree']

const chain = ['apple', 'elephant', 'tiger', 'rabbit'];
console.log(helper.validateChain(chain)); // true
```

## License

ISC