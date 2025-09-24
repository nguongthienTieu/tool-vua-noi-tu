/**
 * Vietnamese Word Chain Helper Examples
 * Demonstrating Vietnamese compound word (từ ghép 2 tiếng) chaining
 */

const WordChainHelper = require('./index.js');

console.log('=== Ví dụ Từ Ghép Tiếng Việt ===\n');

// Ví dụ 1: Sử dụng cơ bản
console.log('1. Hoạt động Cơ bản với Từ Ghép:');
console.log('--------------------------------');
const helper = new WordChainHelper('vietnamese');

console.log('Tổng số từ trong từ điển:', helper.getAllWords().length);
console.log('Một số từ mẫu:', helper.getAllWords().slice(0, 15).join(', '));

console.log('\nKiểm tra nối từ:');
console.log('Có thể nối "con voi" với "voi con" không?', helper.canChain('con voi', 'voi con'));
console.log('Có thể nối "bánh mì" với "mì quảng" không?', helper.canChain('bánh mì', 'mì quảng'));
console.log('Có thể nối "hoa đào" với "đào tạo" không?', helper.canChain('hoa đào', 'đào tạo'));
console.log('Có thể nối "con chó" với "chó sói" không?', helper.canChain('con chó', 'chó sói'));

console.log('\nTìm từ tiếp theo:');
console.log('Từ có thể theo sau "bánh mì":', helper.findNextWords('bánh mì'));
console.log('Từ có thể theo sau "con chó":', helper.findNextWords('con chó'));
console.log('Từ có thể đứng trước "nước mắm":', helper.findPreviousWords('nước mắm'));

// Ví dụ 2: Kiểm tra chuỗi từ
console.log('\n2. Kiểm tra Chuỗi Từ:');
console.log('---------------------');
const chains = [
    ['bánh mì', 'mì quảng', 'quảng nam'],
    ['con voi', 'voi con', 'con chó', 'chó sói'],
    ['hoa đào', 'đào tạo', 'tạo nên'],
    ['núi cao', 'cao su', 'su hào', 'hào hứng']
];

chains.forEach(chain => {
    const isValid = helper.validateChain(chain);
    console.log(`${chain.join(' → ')} ${isValid ? 'HỢP LỆ' : 'KHÔNG HỢP LỆ'}`);
});

// Ví dụ 3: Thêm từ của người dùng
console.log('\n3. Quản lý Từ của Người dùng:');
console.log('-----------------------------');
console.log('Thêm từ mới từ người dùng...');
helper.addWords(['xe hơi', 'hơi nước', 'nước mắm', 'mắm tôm', 'tôm cua', 'cua biển'], true);

console.log('Từ do người dùng thêm:', helper.getUserWords());
console.log('Kiểm tra chuỗi mới: xe hơi → hơi nước → nước mắm → mắm tôm');
console.log('Kết quả:', helper.validateChain(['xe hơi', 'hơi nước', 'nước mắm', 'mắm tôm']));

// Ví dụ 4: Tìm chuỗi dài nhất
console.log('\n4. Tìm Chuỗi Dài nhất:');
console.log('----------------------');
function findLongestVietnameseChain(startWord, usedWords = new Set()) {
    usedWords.add(startWord.toLowerCase());
    const nextWords = helper.findNextWords(startWord)
        .filter(word => !usedWords.has(word));
    
    if (nextWords.length === 0) {
        return [startWord];
    }
    
    let longestChain = [startWord];
    
    for (const nextWord of nextWords) {
        const chain = findLongestVietnameseChain(nextWord, new Set(usedWords));
        if (chain.length + 1 > longestChain.length) {
            longestChain = [startWord, ...chain];
        }
    }
    
    return longestChain;
}

const longestChain = findLongestVietnameseChain('bánh mì');
console.log('Chuỗi dài nhất bắt đầu từ "bánh mì":', longestChain.join(' → '));
console.log('Độ dài chuỗi:', longestChain.length);

// Ví dụ 5: Phân tích từ "chết"
console.log('\n5. Phân tích Từ "Chết":');
console.log('-----------------------');
const stats = helper.getStats();
console.log('Tổng số từ trong cơ sở dữ liệu:', stats.totalWords);
console.log('Số từ "chết" (không thể tiếp tục):', stats.deadWords);

const deadWords = helper.getDeadWords();
console.log('\nMột số từ "chết":');
deadWords.slice(0, 10).forEach(word => {
    console.log(`  ${word} (kết thúc bằng: "${helper.getConnectingElement(word, true)}")`);
});

console.log('\nCác âm tiết gây "bế tắc" (nhiều từ kết thúc hơn bắt đầu):');
Object.keys(stats.syllableStats).forEach(syllable => {
    const stat = stats.syllableStats[syllable];
    if (stat.ending > stat.starting) {
        console.log(`  ${syllable}: ${stat.ending} kết thúc, ${stat.starting} bắt đầu`);
    }
});

// Ví dụ 6: Gợi ý chiến lược
console.log('\n6. Hệ thống Gợi ý Chiến lược:');
console.log('-----------------------------');
function suggestVietnameseStrategy(currentWord) {
    const nextWords = helper.findNextWords(currentWord);
    if (nextWords.length === 0) {
        return `Không có nước đi hợp lệ cho "${currentWord}"!`;
    }
    
    // Tìm từ có nhiều lựa chọn tiếp tục nhất
    const wordScores = nextWords.map(word => ({
        word,
        continuations: helper.findNextWords(word).length
    }));
    
    wordScores.sort((a, b) => b.continuations - a.continuations);
    
    return `Nước đi tốt nhất từ "${currentWord}": ${wordScores.slice(0, 3).map(w => 
        `${w.word} (${w.continuations} lựa chọn)`
    ).join(', ')}`;
}

console.log(suggestVietnameseStrategy('bánh mì'));
console.log(suggestVietnameseStrategy('con chó'));
console.log(suggestVietnameseStrategy('xe hơi'));

// Ví dụ 7: Cập nhật và xóa từ
console.log('\n7. Cập nhật và Xóa Từ:');
console.log('----------------------');
console.log('Trước khi cập nhật, từ "xe hơi" có thể nối với:', helper.findNextWords('xe hơi'));

helper.updateWord('hơi nước', 'hơi thở');
console.log('Đã cập nhật "hơi nước" thành "hơi thở"');
console.log('Sau khi cập nhật, từ "xe hơi" có thể nối với:', helper.findNextWords('xe hơi'));

helper.removeWords(['tôm cua', 'cua biển']);
console.log('Đã xóa "tôm cua" và "cua biển"');
console.log('Từ do người dùng thêm còn lại:', helper.getUserWords());

console.log('\n=== Hoàn thành các Ví dụ ===');