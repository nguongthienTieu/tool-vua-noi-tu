# Word Chain Helper / Trợ giúp Từ Ghép Tiếng Việt

A Node.js utility to help with word chain games where:
- **English**: The last letter of one word must match the first letter of the next word
- **Vietnamese**: The last syllable of one compound word (từ ghép) must match the first syllable of the next compound word

**Tiện ích Node.js giúp chơi game nối từ với quy luật:**
- **Tiếng Anh**: Chữ cái cuối của từ này phải trùng với chữ cái đầu của từ tiếp theo  
- **Tiếng Việt**: Âm tiết cuối của từ ghép này phải trùng với âm tiết đầu của từ ghép tiếp theo

## Features / Tính năng

- Add and manage word databases / Thêm và quản lý cơ sở dữ liệu từ
- Check if two words can be chained together / Kiểm tra hai từ có nối được không
- Find possible next/previous words in a chain / Tìm từ có thể đến trước/sau trong chuỗi  
- Validate entire word chains / Kiểm tra tính hợp lệ của chuỗi từ
- Get statistics about your word database / Lấy thống kê về cơ sở dữ liệu từ
- Interactive CLI interface with Vietnamese and English support / Giao diện CLI tương tác hỗ trợ tiếng Việt và tiếng Anh
- **NEW**: Vietnamese compound word (từ ghép 2 tiếng) support / **MỚI**: Hỗ trợ từ ghép 2 tiếng tiếng Việt
- **NEW**: Dead word detection (words that cannot continue) / **MỚI**: Phát hiện từ "chết" (từ không thể tiếp tục)
- **NEW**: User word management (add, remove, update) / **MỚI**: Quản lý từ người dùng (thêm, xóa, cập nhật)
- **NEW**: Word usage history tracking / **MỚI**: Theo dõi lịch sử sử dụng từ

## Installation / Cài đặt

Clone the repository and navigate to the project directory:

```bash
git clone https://github.com/nguongthienTieu/word-chain-helper.git
cd word-chain-helper
```

## Usage / Cách sử dụng

### Programmatic Usage / Sử dụng trong Code

#### English Example / Ví dụ tiếng Anh
```javascript
const WordChainHelper = require('./index.js');

const helper = new WordChainHelper('english');

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

#### Vietnamese Example / Ví dụ tiếng Việt
```javascript
const WordChainHelper = require('./index.js');

const helper = new WordChainHelper('vietnamese');

// Thêm từ vào cơ sở dữ liệu
helper.addWords(['bánh mì', 'mì quảng', 'con voi', 'voi con'], true);

// Kiểm tra nối từ
console.log(helper.canChain('bánh mì', 'mì quảng')); // true
console.log(helper.canChain('con voi', 'voi con')); // true

// Tìm từ tiếp theo
console.log(helper.findNextWords('bánh mì')); // ['mì quảng']

// Kiểm tra chuỗi từ
console.log(helper.validateChain(['bánh mì', 'mì quảng'])); // true
```

### CLI Usage / Sử dụng CLI

Start the interactive CLI:

```bash
npm start
# or
node cli.js
# or if installed globally
word-chain-helper
```

#### Vietnamese Commands / Lệnh tiếng Việt:
- `them <từ1> <từ2> ...` - Thêm từ vào cơ sở dữ liệu
- `noi <từ1> <từ2>` - Kiểm tra hai từ có nối được không
- `tieptheo <từ>` - Tìm từ có thể theo sau
- `truoc <từ>` - Tìm từ có thể đứng trước
- `kiemtra <từ1> <từ2> ...` - Kiểm tra chuỗi từ
- `thongke` - Hiển thị thống kê
- `tatca` - Hiển thị tất cả từ
- `tuchet` - Hiển thị từ "chết"
- `xoatu <từ>` - Xóa từ
- `capnhat <từ_cũ> <từ_mới>` - Cập nhật từ
- `ngonngu <vietnamese/english>` - Thay đổi ngôn ngữ
- `lichsu` - Xem lịch sử sử dụng từ
- `trogiup` - Hiển thị trợ giúp
- `thoat` - Thoát

#### English Commands / Lệnh tiếng Anh:
- `add <word1> <word2> ...` - Add words to database
- `chain <word1> <word2>` - Check if two words can be chained
- `next <word>` - Find next possible words
- `prev <word>` - Find previous possible words  
- `validate <word1> <word2> ...` - Validate word chain
- `stats` - Show statistics
- `words` - Show all words
- `dead` - Show dead words
- `remove <word>` - Remove words
- `update <old_word> <new_word>` - Update word
- `language <vietnamese/english>` - Change language
- `history` - Show usage history
- `help` - Show help
- `quit` - Exit

### Quick Test / Kiểm tra nhanh

Run the example with Vietnamese compound words:

```bash
npm test
# or
node index.js
```

Run Vietnamese-specific examples:

```bash
node vietnamese-examples.js
```

## API Reference / Tài liệu API

### WordChainHelper Class

#### Constructor / Khởi tạo
- `new WordChainHelper(language)` - Create new instance with language ('english' or 'vietnamese')

#### Core Methods / Phương thức cơ bản
- `addWords(wordList, isUserAdded)` - Add an array of words to the database
- `canChain(word1, word2)` - Check if two words can be chained
- `findNextWords(word)` - Find all words that can follow the given word
- `findPreviousWords(word)` - Find all words that can come before the given word
- `validateChain(chain)` - Validate if an entire chain of words is valid
- `getStats()` - Get statistics about the word database
- `clear()` - Clear all words from the database
- `getAllWords()` - Get all words in the database

#### Word Management / Quản lý từ
- `removeWords(wordList)` - Remove words from the database
- `updateWord(oldWord, newWord)` - Replace a word with a new word
- `getUserWords()` - Get all user-added words

#### Dead Words / Từ "chết"
- `updateDeadWords()` - Update the list of dead words
- `getDeadWords()` - Get all dead words (words that cannot continue a chain)
- `isDeadWord(word)` - Check if a word is a dead word

#### Language Support / Hỗ trợ ngôn ngữ
- `getLanguage()` - Get current language
- `setLanguage(language)` - Set language ('english' or 'vietnamese')
- `extractSyllables(word)` - Extract syllables from Vietnamese compound word
- `getConnectingElement(word, isLast)` - Get connecting element (letter/syllable)
- `isValidCompoundWord(word)` - Validate Vietnamese compound word format

#### History / Lịch sử
- `getWordHistory()` - Get word usage history

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