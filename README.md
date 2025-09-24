# Trợ giúp Từ Ghép Tiếng Việt

Công cụ Node.js hỗ trợ trò chơi từ ghép tiếng Việt với quy luật: **Âm tiết cuối của từ ghép này phải trùng với âm tiết đầu của từ ghép tiếp theo**.

Sử dụng nguồn từ điển từ **@undertheseanlp/dictionary** với hơn 25,000 từ ghép tiếng Việt.

## Tính năng

- ✅ **Từ điển lớn**: Hơn 25,000 từ ghép tiếng Việt từ @undertheseanlp/dictionary
- ✅ **Kiểm tra nối từ**: Xác định hai từ ghép có thể nối với nhau không
- ✅ **Tìm từ tiếp theo/trước**: Tìm tất cả từ có thể đến trước/sau trong chuỗi
- ✅ **Xác thực chuỗi từ**: Kiểm tra tính hợp lệ của toàn bộ chuỗi từ ghép  
- ✅ **Thống kê từ điển**: Phân tích phân bố âm tiết, từ "chết", v.v.
- ✅ **Giao diện CLI**: Tương tác qua dòng lệnh với các lệnh tiếng Việt
- ✅ **Quản lý từ**: Thêm, xóa, cập nhật từ ghép của người dùng
- ✅ **Lịch sử sử dụng**: Theo dõi tần suất sử dụng các từ
- ✅ **Tối ưu hóa**: Hiệu suất cao với từ điển lớn

## Cài đặt

```bash
git clone https://github.com/nguongthienTieu/word-chain-helper.git
cd word-chain-helper
```

## Cách sử dụng

### Sử dụng trong Code

```javascript
const WordChainHelper = require('./index.js');

const helper = new WordChainHelper();

// Kiểm tra khả năng nối từ
console.log(helper.canChain('bánh mì', 'mì quảng')); // true
console.log(helper.canChain('con voi', 'voi biển')); // true

// Tìm từ có thể theo sau
console.log(helper.findNextWords('bánh mì')); 
// → ['mì chính', 'mì thánh', 'mì ăn liền']

// Thêm từ của người dùng
helper.addWords(['hạnh phúc', 'phúc lợi', 'lợi ích'], true);

// Thống kê từ điển
const stats = helper.getStats();
console.log(`Tổng số từ: ${stats.totalWords}`);
console.log(`Từ do người dùng thêm: ${stats.userAddedWords}`);
```

### Sử dụng CLI

Khởi động giao diện dòng lệnh tương tác:

```bash
npm start
# or
node cli.js
# or if installed globally
word-chain-helper
```

### Lệnh CLI

- `them <từ1> <từ2> ...` - Thêm từ vào cơ sở dữ liệu
- `noi <từ1> <từ2>` - Kiểm tra hai từ có nối được không
- `tieptheo <từ>` - Tìm từ có thể theo sau
- `truoc <từ>` - Tìm từ có thể đứng trước  
- `kiemtra <từ1> <từ2> ...` - Kiểm tra chuỗi từ
- `thongke` - Hiển thị thống kê
- `tatca` - Hiển thị tất cả từ (chỉ 20 từ đầu do quá nhiều từ)
- `tuchết` - Hiển thị từ "chết"
- `xoatu <từ>` - Xóa từ
- `capnhat <từ_cũ> <từ_mới>` - Cập nhật từ  
- `lichsu` - Xem lịch sử sử dụng từ
- `trogiup` - Hiển thị trợ giúp
- `thoat` - Thoát

### Kiểm tra nhanh

Chạy ví dụ với từ ghép tiếng Việt:

```bash
npm test
# or
node index.js
```

Chạy các ví dụ cụ thể tiếng Việt:

```bash
node examples.js
```

Chạy ví dụ tiếng Việt từ file cũ:

```bash
node vietnamese-examples.js
```

## Tài liệu API

### WordChainHelper Class

#### Constructor
- `new WordChainHelper()` - Tạo instance mới (chỉ hỗ trợ tiếng Việt)

#### Phương thức cơ bản
- `addWords(wordList, isUserAdded)` - Thêm mảng từ vào cơ sở dữ liệu
- `canChain(word1, word2)` - Kiểm tra hai từ có nối được không
- `findNextWords(word)` - Tìm tất cả từ có thể theo sau từ đã cho
- `findPreviousWords(word)` - Tìm tất cả từ có thể đứng trước từ đã cho
- `validateChain(chain)` - Xác thực chuỗi từ ghép có hợp lệ không
- `getStats()` - Lấy thống kê về cơ sở dữ liệu từ
- `clear()` - Xóa tất cả từ khỏi cơ sở dữ liệu
- `getAllWords()` - Lấy tất cả từ trong cơ sở dữ liệu

#### Quản lý từ
- `removeWords(wordList)` - Xóa từ khỏi cơ sở dữ liệu
- `updateWord(oldWord, newWord)` - Thay thế từ cũ bằng từ mới  
- `getUserWords()` - Lấy tất cả từ do người dùng thêm

#### Từ "chết"
- `updateDeadWords()` - Cập nhật danh sách từ "chết"
- `getDeadWords()` - Lấy tất cả từ "chết" (từ không thể tiếp tục chuỗi)
- `isDeadWord(word)` - Kiểm tra từ có phải từ "chết" không

#### Hỗ trợ tiếng Việt
- `getLanguage()` - Lấy ngôn ngữ hiện tại (luôn là 'vietnamese')
- `extractSyllables(word)` - Tách âm tiết từ từ ghép tiếng Việt
- `getConnectingElement(word, isLast)` - Lấy âm tiết kết nối (đầu/cuối)
- `isValidCompoundWord(word)` - Xác thực định dạng từ ghép tiếng Việt

#### Lịch sử
- `getWordHistory()` - Lấy lịch sử sử dụng từ

## Ví dụ

### Ví dụ 1: Nối từ cơ bản
```javascript
const helper = new WordChainHelper();

console.log(helper.canChain('bánh mì', 'mì quảng')); // true
console.log(helper.canChain('con voi', 'voi biển')); // true
console.log(helper.canChain('hoa đào', 'tạo nên')); // false
```

### Ví dụ 2: Tìm chuỗi từ
```javascript
const helper = new WordChainHelper();

const nextWords = helper.findNextWords('bánh mì');
console.log(nextWords); // ['mì chính', 'mì thánh', 'mì ăn liền']

const chain = ['bánh mì', 'mì quảng', 'quảng nam'];
console.log(helper.validateChain(chain)); // true
```

### Ví dụ 3: Thống kê từ điển
```javascript
const helper = new WordChainHelper();
const stats = helper.getStats();

console.log(`Tổng số từ: ${stats.totalWords}`); // 25410
console.log(`Từ ghép: ${stats.compoundWords}`);
console.log(`Âm tiết phổ biến:`, Object.keys(stats.syllableStats).slice(0, 5));
```

## Nguồn từ điển

Công cụ sử dụng từ điển từ **@undertheseanlp/dictionary** - một dự án mã nguồn mở cung cấp từ điển tiếng Việt chất lượng cao với hơn 25,000 từ ghép.

## Giấy phép

ISC