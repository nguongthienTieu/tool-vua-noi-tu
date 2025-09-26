/**
 * Ví dụ sử dụng Trợ giúp Từ Ghép Tiếng Việt
 * Minh họa các trường hợp sử dụng khác nhau của công cụ trợ giúp từ ghép tiếng Việt
 * Sử dụng nguồn từ điển từ @undertheseanlp/dictionary
 */

const WordChainHelper = require('./index.js');

console.log('=== Ví dụ sử dụng Trợ giúp Từ Ghép Tiếng Việt ===\n');

// Ví dụ 1: Sử dụng cơ bản
console.log('1. Hoạt động Cơ bản của Từ ghép:');
console.log('================================');
const helper = new WordChainHelper();

console.log('Tổng số từ trong từ điển từ @undertheseanlp/dictionary:', helper.getAllWords().length);
console.log('Một số từ mẫu:', helper.getAllWords().slice(0, 10).join(', '));

console.log('\nKiểm tra khả năng nối từ:');
console.log('Có thể nối "bánh mì" với "mì quảng" không?', helper.canChain('bánh mì', 'mì quảng'));
console.log('Có thể nối "con voi" với "voi biển" không?', helper.canChain('con voi', 'voi biển')); 
console.log('Có thể nối "hoa đào" với "đào tạo" không?', helper.canChain('hoa đào', 'đào tạo'));

console.log('\nTìm từ có thể theo sau:');
console.log('Từ theo sau "bánh mì":', helper.findNextWords('bánh mì', true, true).slice(0, 5).join(', ') || 'Không có');
console.log('Từ theo sau "con voi":', helper.findNextWords('con voi', true, true).slice(0, 5).join(', ') || 'Không có');

console.log('\nTìm từ có thể đứng trước:');
console.log('Từ trước "mì quảng":', helper.findPreviousWords('mì quảng').slice(0, 5).join(', ') || 'Không có');
console.log('Từ trước "voi biển":', helper.findPreviousWords('voi biển').slice(0, 5).join(', ') || 'Không có');

// Ví dụ 2: Xác thực chuỗi từ
console.log('\n2. Xác thực Chuỗi Từ:');
console.log('====================');
const chains = [
    ['bánh mì', 'mì quảng', 'quảng nam'],
    ['con voi', 'voi biển', 'biển xanh'],
    ['hoa đào', 'đào tạo', 'tạo nên', 'nên người'],
    ['máy tính', 'tính toán', 'toán học']
];

chains.forEach(chain => {
    const isValid = helper.validateChain(chain);
    console.log(`${chain.join(' → ')} ${isValid ? 'HỢP LỆ' : 'KHÔNG HỢP LỆ'}`);
});

// Ví dụ 3: Thêm từ của người dùng
console.log('\n3. Thêm Từ của Người dùng:');
console.log('==========================');
const newWords = ['hạnh phúc', 'phúc lợi', 'lợi ích', 'ích lợi'];
helper.addWords(newWords, true);
console.log('Đã thêm từ:', newWords.join(', '));
console.log('Từ do người dùng thêm:', helper.getUserWords().join(', '));

// Kiểm tra chuỗi với từ mới
console.log('\nKiểm tra chuỗi với từ mới:');
const newChain = ['hạnh phúc', 'phúc lợi', 'lợi ích'];
console.log(`Chuỗi "${newChain.join(' → ')}" ${helper.validateChain(newChain) ? 'HỢP LỆ' : 'KHÔNG HỢP LỆ'}`);

// Ví dụ 4: Phân tích và thống kê
console.log('\n4. Phân tích Cơ sở dữ liệu Từ:');
console.log('==============================');
const stats = helper.getStats();
console.log('Tổng số từ trong cơ sở dữ liệu:', stats.totalWords);
console.log('Từ do người dùng thêm:', stats.userAddedWords);
console.log('Từ "chết":', stats.deadWords);

if (stats.syllableStats) {
    const syllableEntries = Object.entries(stats.syllableStats)
        .sort((a, b) => b[1].starting - a[1].starting);
    
    console.log('\nÂm tiết bắt đầu phổ biến nhất:');
    syllableEntries.slice(0, 5).forEach(([syllable, stat]) => {
        console.log(`  ${syllable}: ${stat.starting} từ bắt đầu`);
    });
}

console.log('\n=== Hoàn thành các Ví dụ ===');
