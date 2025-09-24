#!/usr/bin/env node

/**
 * Word Chain Helper CLI
 * Command-line interface for the word chain helper
 */

const WordChainHelper = require('./index.js');
const readline = require('readline');

class WordChainCLI {
    constructor() {
        this.helper = new WordChainHelper();
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    showHelp() {
        console.log(`
Word Chain Helper CLI
=====================

Commands:
  add <word1> [word2] [word3] ...  - Add words to the database
  chain <word1> <word2>            - Check if two words can be chained
  next <word>                      - Find words that can follow the given word
  prev <word>                      - Find words that can come before the given word
  validate <word1> <word2> ...     - Validate a chain of words
  stats                            - Show database statistics
  words                            - Show all words in the database
  clear                           - Clear all words from the database
  help                            - Show this help message
  quit/exit                       - Exit the program

Example:
  add apple elephant tiger rabbit
  chain apple elephant
  next apple
  validate apple elephant tiger
        `);
    }

    processCommand(input) {
        const parts = input.trim().split(' ');
        const command = parts[0].toLowerCase();
        const args = parts.slice(1);

        switch (command) {
            case 'add':
                if (args.length === 0) {
                    console.log('Usage: add <word1> [word2] [word3] ...');
                    break;
                }
                this.helper.addWords(args);
                console.log(`Added ${args.length} word(s): ${args.join(', ')}`);
                break;

            case 'chain':
                if (args.length !== 2) {
                    console.log('Usage: chain <word1> <word2>');
                    break;
                }
                const canChain = this.helper.canChain(args[0], args[1]);
                console.log(`"${args[0]}" ${canChain ? 'CAN' : 'CANNOT'} chain to "${args[1]}"`);
                break;

            case 'next':
                if (args.length !== 1) {
                    console.log('Usage: next <word>');
                    break;
                }
                const nextWords = this.helper.findNextWords(args[0]);
                if (nextWords.length === 0) {
                    console.log(`No words found that can follow "${args[0]}"`);
                } else {
                    console.log(`Words that can follow "${args[0]}": ${nextWords.join(', ')}`);
                }
                break;

            case 'prev':
                if (args.length !== 1) {
                    console.log('Usage: prev <word>');
                    break;
                }
                const prevWords = this.helper.findPreviousWords(args[0]);
                if (prevWords.length === 0) {
                    console.log(`No words found that can come before "${args[0]}"`);
                } else {
                    console.log(`Words that can come before "${args[0]}": ${prevWords.join(', ')}`);
                }
                break;

            case 'validate':
                if (args.length < 2) {
                    console.log('Usage: validate <word1> <word2> [word3] ...');
                    break;
                }
                const isValid = this.helper.validateChain(args);
                const chainStr = args.join(' -> ');
                console.log(`Chain "${chainStr}" is ${isValid ? 'VALID' : 'INVALID'}`);
                break;

            case 'stats':
                const stats = this.helper.getStats();
                console.log('\nDatabase Statistics:');
                console.log('===================');
                console.log(`Total words: ${stats.totalWords}`);
                if (stats.totalWords > 0) {
                    console.log('\nLetter distribution:');
                    Object.keys(stats.letterStats).sort().forEach(letter => {
                        const stat = stats.letterStats[letter];
                        console.log(`  ${letter}: ${stat.starting} starting, ${stat.ending} ending`);
                    });
                }
                break;

            case 'words':
                const allWords = this.helper.getAllWords();
                if (allWords.length === 0) {
                    console.log('No words in the database. Use "add" command to add words.');
                } else {
                    console.log(`All words (${allWords.length}): ${allWords.join(', ')}`);
                }
                break;

            case 'clear':
                this.helper.clear();
                console.log('Database cleared.');
                break;

            case 'help':
                this.showHelp();
                break;

            case 'quit':
            case 'exit':
                console.log('Goodbye!');
                this.rl.close();
                return false;

            default:
                if (command) {
                    console.log(`Unknown command: ${command}`);
                    console.log('Type "help" for available commands.');
                }
                break;
        }
        return true;
    }

    start() {
        console.log('Word Chain Helper CLI');
        console.log('Type "help" for available commands or "quit" to exit.\n');

        // Add some default words
        const defaultWords = ['apple', 'elephant', 'tiger', 'rabbit', 'tree', 'eagle', 'lemon', 'orange'];
        this.helper.addWords(defaultWords);
        console.log(`Loaded ${defaultWords.length} default words: ${defaultWords.join(', ')}\n`);

        const askQuestion = () => {
            this.rl.question('> ', (input) => {
                if (this.processCommand(input)) {
                    askQuestion();
                }
            });
        };

        askQuestion();
    }
}

// Start the CLI if this file is run directly
if (require.main === module) {
    const cli = new WordChainCLI();
    cli.start();
}

module.exports = WordChainCLI;