/**
 * Simple test file for word-chain-helper
 * Run with: node test.js
 */

const WordChainHelper = require('./index.js');

function runTests() {
    console.log('🧪 Running Word Chain Helper Tests...\n');
    
    const helper = new WordChainHelper();
    let passed = 0;
    let total = 0;
    
    function test(description, testFunction) {
        total++;
        try {
            const result = testFunction();
            if (result) {
                console.log(`✅ ${description}`);
                passed++;
            } else {
                console.log(`❌ ${description}`);
            }
        } catch (error) {
            console.log(`❌ ${description} - Error: ${error.message}`);
        }
    }
    
    // Test chain validation
    test('Valid chain: apple → elephant → tiger', () => {
        return helper.validateChain(['apple', 'elephant', 'tiger']) === true;
    });
    
    test('Invalid chain: hello → world', () => {
        return helper.validateChain(['hello', 'world']) === false;
    });
    
    test('Single word chain is valid', () => {
        return helper.validateChain(['hello']) === true;
    });
    
    test('Empty chain is valid', () => {
        return helper.validateChain([]) === true;
    });
    
    // Test character extraction
    test('Get last char of "apple"', () => {
        return helper.getLastChar('apple') === 'e';
    });
    
    test('Get first char of "elephant"', () => {
        return helper.getFirstChar('elephant') === 'e';
    });
    
    // Test chain continuation
    test('Can continue: apple → elephant', () => {
        return helper.canContinueChain('apple', 'elephant') === true;
    });
    
    test('Cannot continue: apple → cat', () => {
        return helper.canContinueChain('apple', 'cat') === false;
    });
    
    // Test finding next words
    test('Find next words for "apple"', () => {
        const nextWords = helper.findNextWords('apple');
        return nextWords.length > 0 && nextWords.includes('elephant');
    });
    
    test('Find next words for "zzz" (should be empty)', () => {
        const nextWords = helper.findNextWords('zzz');
        return nextWords.length === 0;
    });
    
    // Test Vietnamese support
    test('Vietnamese chain: ăn → nấu', () => {
        return helper.canContinueChain('ăn', 'nấu') === true;
    });
    
    // Summary
    console.log(`\n📊 Test Results: ${passed}/${total} passed`);
    
    if (passed === total) {
        console.log('🎉 All tests passed!');
        process.exit(0);
    } else {
        console.log('❌ Some tests failed');
        process.exit(1);
    }
}

if (require.main === module) {
    runTests();
}

module.exports = runTests;