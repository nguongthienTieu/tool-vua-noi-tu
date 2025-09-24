# word-chain-helper

🔗 Trợ giúp chuỗi từ | Word Chain Helper

A helper tool for word chain games where each word must start with the last letter of the previous word. Supports both Vietnamese and English words.

## Bắt đầu đi! (Let's begin!)

### Installation

```bash
# Clone the repository
git clone https://github.com/nguongthienTieu/word-chain-helper.git
cd word-chain-helper

# Install dependencies (if any)
npm install
```

### Usage

#### Interactive Mode
```bash
npm start
# or
node index.js
```

#### Command Line Usage

**Validate a word chain:**
```bash
node index.js validate apple elephant tiger rabbit
# Output: Chain: apple → elephant → tiger → rabbit
#         Valid: ✅ Yes
```

**Find next possible words:**
```bash
node index.js find apple
# Output: Word: "apple"
#         Next words: elephant, eagle, egg
```

### Features

- ✅ Validate word chains
- ✅ Find possible next words 
- ✅ Interactive CLI mode
- ✅ Vietnamese language support
- ✅ Bilingual interface (Vietnamese/English)

### Examples

**Valid word chain:**
- apple → elephant → tiger → rabbit → turtle

**Invalid word chain:**  
- apple → cat (❌ 'e' ≠ 'c')

### API

```javascript
const WordChainHelper = require('./index.js');
const helper = new WordChainHelper();

// Check if words can form a chain
console.log(helper.validateChain(['apple', 'elephant', 'tiger'])); // true

// Find next possible words
console.log(helper.findNextWords('apple')); // ['elephant', 'eagle', 'egg']

// Check if one word can follow another
console.log(helper.canContinueChain('apple', 'elephant')); // true
```

### Testing

```bash
npm test
```

## Contributing

Feel free to contribute by adding more words to the dictionary or improving the functionality!

## License

ISC