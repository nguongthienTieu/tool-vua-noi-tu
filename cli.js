#!/usr/bin/env node

/**
 * Trợ giúp Từ Ghép Tiếng Việt - CLI
 * Giao diện dòng lệnh cho công cụ trợ giúp từ ghép tiếng Việt
 * Sử dụng nguồn từ điển từ @undertheseanlp/dictionary
 */

const WordChainHelper = require('./index.js');
const readline = require('readline');

class WordChainCLI {
    constructor() {
        this.helper = new WordChainHelper(); // Chỉ hỗ trợ tiếng Việt
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    showHelp() {
        console.log(`
Trợ giúp Từ Ghép Tiếng Việt (@undertheseanlp/dictionary)
=======================================================

Lệnh có sẵn:
  them <từ1> [từ2] [từ3] ...       - Thêm từ vào cơ sở dữ liệu
  noi <từ1> <từ2>                  - Kiểm tra hai từ có nối được không  
  tieptheo <từ>                    - Tìm từ có thể theo sau từ đã cho
  truoc <từ>                       - Tìm từ có thể đứng trước từ đã cho
  kiemtra <từ1> <từ2> ...          - Kiểm tra chuỗi từ có hợp lệ không
  thongke                          - Hiển thị thống kê cơ sở dữ liệu
  tatca                           - Hiển thị tất cả từ trong cơ sở dữ liệu
  xoa                             - Xóa tất cả từ khỏi cơ sở dữ liệu
  tuchết                          - Hiển thị các từ "chết" (không thể tiếp tục)
  xoatu <từ1> [từ2] ...           - Xóa từ khỏi cơ sở dữ liệu
  capnhat <từ_cũ> <từ_mới>        - Cập nhật từ trong cơ sở dữ liệu
  lichsu                          - Hiển thị lịch sử sử dụng từ
  trogiup                         - Hiển thị trợ giúp
  thoat                           - Thoát chương trình

Ví dụ:
  them "hoa mai"                  - Thêm từ "hoa mai"
  noi "hoa mai" "mai vàng"        - Kiểm tra nối từ
  tieptheo "bánh mì"             - Tìm từ theo sau "bánh mì"
  kiemtra "bánh mì" "mì quảng" "quảng nam" - Kiểm tra chuỗi từ
        `);
    }

    processCommand(input) {
        const parts = input.trim().split(' ');
        const command = parts[0].toLowerCase();
        const args = parts.slice(1);

        switch (command) {
            case 'them':
                if (args.length === 0) {
                    console.log('Cách dùng: them <từ1> [từ2] [từ3] ...');
                    break;
                }
                this.helper.addWords(args, true); // Đánh dấu là từ do người dùng thêm
                console.log(`Đã thêm ${args.length} từ: ${args.join(', ')}`);
                break;

            case 'noi':
                if (args.length !== 2) {
                    console.log('Cách dùng: noi <từ1> <từ2>');
                    break;
                }
                const canChain = this.helper.canChain(args[0], args[1]);
                console.log(`"${args[0]}" ${canChain ? 'CÓ THỂ' : 'KHÔNG THỂ'} nối với "${args[1]}"`);
                break;

            case 'tieptheo':
                if (args.length !== 1) {
                    console.log('Cách dùng: tieptheo <từ>');
                    break;
                }
                const nextWords = this.helper.findNextWords(args[0]);
                if (nextWords.length === 0) {
                    console.log(`Không tìm thấy từ nào có thể theo sau "${args[0]}"`);
                } else {
                    console.log(`Từ có thể theo sau "${args[0]}": ${nextWords.join(', ')}`);
                }
                break;

            case 'truoc':
                if (args.length !== 1) {
                    console.log('Cách dùng: truoc <từ>');
                    break;
                }
                const prevWords = this.helper.findPreviousWords(args[0]);
                if (prevWords.length === 0) {
                    console.log(`Không tìm thấy từ nào có thể đứng trước "${args[0]}"`);
                } else {
                    console.log(`Từ có thể đứng trước "${args[0]}": ${prevWords.join(', ')}`);
                }
                break;

            case 'kiemtra':
                if (args.length < 2) {
                    console.log('Cách dùng: kiemtra <từ1> <từ2> [từ3] ...');
                    break;
                }
                const isValid = this.helper.validateChain(args);
                const chainStr = args.join(' → ');
                console.log(`Chuỗi "${chainStr}" ${isValid ? 'HỢP LỆ' : 'KHÔNG HỢP LỆ'}`);
                break;

            case 'thongke':
                const stats = this.helper.getStats();
                console.log('\nThống kê Cơ sở dữ liệu:');
                console.log('========================');
                console.log(`Tổng số từ: ${stats.totalWords}`);
                console.log(`Từ do người dùng thêm: ${stats.userAddedWords}`);
                console.log(`Từ "chết": ${stats.deadWords}`);
                
                if (stats.totalWords > 0 && stats.syllableStats) {
                    console.log('\nPhân bố âm tiết:');
                    const syllableStats = stats.syllableStats;
                    Object.keys(syllableStats).sort().slice(0, 10).forEach(syllable => {
                        const stat = syllableStats[syllable];
                        console.log(`  ${syllable}: ${stat.starting} đầu, ${stat.ending} cuối`);
                    });
                    if (Object.keys(syllableStats).length > 10) {
                        console.log(`  ... và ${Object.keys(syllableStats).length - 10} âm tiết khác`);
                    }
                }
                break;

            case 'tatca':
                const allWords = this.helper.getAllWords();
                if (allWords.length === 0) {
                    console.log('Không có từ nào trong cơ sở dữ liệu. Dùng lệnh "them" để thêm từ.');
                } else {
                    // Chỉ hiển thị 20 từ đầu do có quá nhiều từ (25k+)
                    if (allWords.length > 20) {
                        console.log(`Tổng số từ: ${allWords.length} từ. Hiển thị 20 từ đầu:`);
                        console.log(allWords.slice(0, 20).join(', '));
                        console.log('... (dùng lệnh "tim" để tìm từ cụ thể)');
                    } else {
                        console.log(`Tất cả từ (${allWords.length}): ${allWords.join(', ')}`);
                    }
                }
                break;

            case 'xoa':
                this.helper.clear();
                console.log('Đã xóa cơ sở dữ liệu.');
                break;

            case 'tuchet':
                const deadWords = this.helper.getDeadWords();
                if (deadWords.length === 0) {
                    console.log('Không có từ "chết" nào (hoặc chưa tính toán do từ điển lớn).');
                } else {
                    console.log(`Từ "chết" (${deadWords.length}): ${deadWords.join(', ')}`);
                }
                break;

            case 'xoatu':
                if (args.length === 0) {
                    console.log('Cách dùng: xoatu <từ1> [từ2] ...');
                    break;
                }
                this.helper.removeWords(args);
                console.log(`Đã xóa ${args.length} từ: ${args.join(', ')}`);
                break;

            case 'capnhat':
                if (args.length !== 2) {
                    console.log('Cách dùng: capnhat <từ_cũ> <từ_mới>');
                    break;
                }
                this.helper.updateWord(args[0], args[1]);
                console.log(`Đã cập nhật "${args[0]}" thành "${args[1]}"`);
                break;

            case 'ngonngu':
                console.log('Tool này chỉ hỗ trợ tiếng Việt với từ điển từ @undertheseanlp/dictionary');
                break;

            case 'lichsu':
                const history = this.helper.getWordHistory();
                console.log('\nLịch sử sử dụng từ:');
                console.log('====================');
                const entries = Object.entries(history);
                if (entries.length === 0) {
                    console.log('Chưa có lịch sử sử dụng.');
                } else {
                    entries.sort((a, b) => b[1] - a[1]);
                    entries.slice(0, 10).forEach(([word, count]) => {
                        console.log(`  ${word}: ${count} lần`);
                    });
                }
                break;

            case 'trogiup':
                this.showHelp();
                break;

            case 'thoat':
                console.log('Tạm biệt!');
                this.rl.close();
                return false;

            default:
                if (command) {
                    console.log(`Lệnh không xác định: ${command}`);
                    console.log('Gõ "trogiup" để xem các lệnh có sẵn.');
                }
                break;
        }
        return true;
    }

    start() {
        console.log('Trợ giúp Từ Ghép Tiếng Việt - CLI (@undertheseanlp/dictionary)');
        console.log('=================================================================');
        console.log('Gõ "trogiup" để xem các lệnh có sẵn hoặc "thoat" để thoát.\n');
        
        const stats = this.helper.getStats();
        console.log(`Đã tải ${stats.totalWords} từ ghép tiếng Việt từ @undertheseanlp/dictionary.\n`);
        console.log('Một số từ mẫu:', this.helper.getAllWords().slice(0, 8).join(', '), '\n');

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