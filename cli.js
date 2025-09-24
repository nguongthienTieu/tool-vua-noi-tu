#!/usr/bin/env node

/**
 * Word Chain Helper CLI
 * Command-line interface for the word chain helper
 * Supports both English and Vietnamese (Từ ghép tiếng Việt)
 */

const WordChainHelper = require('./index.js');
const readline = require('readline');

class WordChainCLI {
    constructor() {
        this.helper = new WordChainHelper('vietnamese'); // Default to Vietnamese
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    showHelp() {
        const isVietnamese = this.helper.getLanguage() === 'vietnamese' || this.helper.getLanguage() === 'tiếng việt';
        
        if (isVietnamese) {
            console.log(`
Trợ giúp Từ Ghép Tiếng Việt
===========================

Lệnh có sẵn:
  them <từ1> [từ2] [từ3] ...       - Thêm từ vào cơ sở dữ liệu
  add <word1> [word2] [word3] ...   - Thêm từ vào cơ sở dữ liệu (tiếng Anh)
  noi <từ1> <từ2>                  - Kiểm tra hai từ có nối được không
  chain <word1> <word2>            - Kiểm tra hai từ có nối được không (tiếng Anh)
  tieptheo <từ>                    - Tìm từ có thể theo sau từ đã cho
  next <word>                      - Tìm từ có thể theo sau từ đã cho (tiếng Anh)  
  truoc <từ>                       - Tìm từ có thể đứng trước từ đã cho
  prev <word>                      - Tìm từ có thể đứng trước từ đã cho (tiếng Anh)
  kiemtra <từ1> <từ2> ...          - Kiểm tra chuỗi từ có hợp lệ không
  validate <word1> <word2> ...     - Kiểm tra chuỗi từ có hợp lệ không (tiếng Anh)
  thongke                          - Hiển thị thống kê cơ sở dữ liệu
  stats                           - Hiển thị thống kê cơ sở dữ liệu (tiếng Anh)
  tatca                           - Hiển thị tất cả từ trong cơ sở dữ liệu
  words                           - Hiển thị tất cả từ trong cơ sở dữ liệu (tiếng Anh)
  xoa                             - Xóa tất cả từ khỏi cơ sở dữ liệu
  clear                           - Xóa tất cả từ khỏi cơ sở dữ liệu (tiếng Anh)
  tuchết                          - Hiển thị các từ "chết" (không thể tiếp tục)
  dead                            - Hiển thị các từ "chết" (tiếng Anh)
  xoatu <từ1> [từ2] ...           - Xóa từ khỏi cơ sở dữ liệu
  remove <word1> [word2] ...       - Xóa từ khỏi cơ sở dữ liệu (tiếng Anh)
  capnhat <từ_cũ> <từ_mới>        - Cập nhật từ trong cơ sở dữ liệu
  update <old_word> <new_word>     - Cập nhật từ trong cơ sở dữ liệu (tiếng Anh)
  ngonngu <vietnamese/english>     - Thay đổi ngôn ngữ
  language <vietnamese/english>    - Thay đổi ngôn ngữ (tiếng Anh)
  lichsu                          - Hiển thị lịch sử sử dụng từ
  history                         - Hiển thị lịch sử sử dụng từ (tiếng Anh)
  trogiup                         - Hiển thị thông báo trợ giúp này
  help                            - Hiển thị thông báo trợ giúp này (tiếng Anh)
  thoat/quit/exit                 - Thoát chương trình

Ví dụ:
  them bánh mì mì quảng quảng nam
  noi bánh mì mì quảng
  tieptheo bánh mì
  kiemtra bánh mì mì quảng quảng nam
            `);
        } else {
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
  dead                            - Show dead words (words that cannot continue)
  remove <word1> [word2] ...       - Remove words from the database
  update <old_word> <new_word>     - Update a word in the database
  language <vietnamese/english>    - Change language
  history                         - Show word usage history
  help                            - Show this help message
  quit/exit                       - Exit the program

Example:
  add apple elephant tiger rabbit
  chain apple elephant
  next apple
  validate apple elephant tiger
            `);
        }
    }

    processCommand(input) {
        const parts = input.trim().split(' ');
        const command = parts[0].toLowerCase();
        const args = parts.slice(1);

        switch (command) {
            case 'add':
            case 'them':
                if (args.length === 0) {
                    const isVietnamese = this.helper.getLanguage() === 'vietnamese';
                    console.log(isVietnamese ? 'Cách dùng: them <từ1> [từ2] [từ3] ...' : 'Usage: add <word1> [word2] [word3] ...');
                    break;
                }
                this.helper.addWords(args, true); // Mark as user-added
                const isVietnamese = this.helper.getLanguage() === 'vietnamese';
                console.log(isVietnamese ? 
                    `Đã thêm ${args.length} từ: ${args.join(', ')}` : 
                    `Added ${args.length} word(s): ${args.join(', ')}`);
                break;

            case 'chain':
            case 'noi':
                if (args.length !== 2) {
                    const isVietnamese = this.helper.getLanguage() === 'vietnamese';
                    console.log(isVietnamese ? 'Cách dùng: noi <từ1> <từ2>' : 'Usage: chain <word1> <word2>');
                    break;
                }
                const canChain = this.helper.canChain(args[0], args[1]);
                const isVietnamese1 = this.helper.getLanguage() === 'vietnamese';
                console.log(isVietnamese1 ? 
                    `"${args[0]}" ${canChain ? 'CÓ THỂ' : 'KHÔNG THỂ'} nối với "${args[1]}"` :
                    `"${args[0]}" ${canChain ? 'CAN' : 'CANNOT'} chain to "${args[1]}"`);
                break;

            case 'next':
            case 'tieptheo':
                if (args.length !== 1) {
                    const isVietnamese = this.helper.getLanguage() === 'vietnamese';
                    console.log(isVietnamese ? 'Cách dùng: tieptheo <từ>' : 'Usage: next <word>');
                    break;
                }
                const nextWords = this.helper.findNextWords(args[0]);
                const isVietnamese2 = this.helper.getLanguage() === 'vietnamese';
                if (nextWords.length === 0) {
                    console.log(isVietnamese2 ? 
                        `Không tìm thấy từ nào có thể theo sau "${args[0]}"` :
                        `No words found that can follow "${args[0]}"`);
                } else {
                    console.log(isVietnamese2 ? 
                        `Từ có thể theo sau "${args[0]}": ${nextWords.join(', ')}` :
                        `Words that can follow "${args[0]}": ${nextWords.join(', ')}`);
                }
                break;

            case 'prev':
            case 'truoc':
                if (args.length !== 1) {
                    const isVietnamese = this.helper.getLanguage() === 'vietnamese';
                    console.log(isVietnamese ? 'Cách dùng: truoc <từ>' : 'Usage: prev <word>');
                    break;
                }
                const prevWords = this.helper.findPreviousWords(args[0]);
                const isVietnamese3 = this.helper.getLanguage() === 'vietnamese';
                if (prevWords.length === 0) {
                    console.log(isVietnamese3 ? 
                        `Không tìm thấy từ nào có thể đứng trước "${args[0]}"` :
                        `No words found that can come before "${args[0]}"`);
                } else {
                    console.log(isVietnamese3 ? 
                        `Từ có thể đứng trước "${args[0]}": ${prevWords.join(', ')}` :
                        `Words that can come before "${args[0]}": ${prevWords.join(', ')}`);
                }
                break;

            case 'validate':
            case 'kiemtra':
                if (args.length < 2) {
                    const isVietnamese = this.helper.getLanguage() === 'vietnamese';
                    console.log(isVietnamese ? 'Cách dùng: kiemtra <từ1> <từ2> [từ3] ...' : 'Usage: validate <word1> <word2> [word3] ...');
                    break;
                }
                const isValid = this.helper.validateChain(args);
                const chainStr = args.join(' → ');
                const isVietnamese4 = this.helper.getLanguage() === 'vietnamese';
                console.log(isVietnamese4 ? 
                    `Chuỗi "${chainStr}" ${isValid ? 'HỢP LỆ' : 'KHÔNG HỢP LỆ'}` :
                    `Chain "${chainStr}" is ${isValid ? 'VALID' : 'INVALID'}`);
                break;

            case 'stats':
            case 'thongke':
                const stats = this.helper.getStats();
                const isVietnamese5 = this.helper.getLanguage() === 'vietnamese';
                console.log(isVietnamese5 ? '\nThống kê Cơ sở dữ liệu:' : '\nDatabase Statistics:');
                console.log('='.repeat(isVietnamese5 ? 25 : 20));
                console.log(isVietnamese5 ? 
                    `Tổng số từ: ${stats.totalWords}` :
                    `Total words: ${stats.totalWords}`);
                console.log(isVietnamese5 ? 
                    `Từ do người dùng thêm: ${stats.userAddedWords}` :
                    `User-added words: ${stats.userAddedWords}`);
                console.log(isVietnamese5 ? 
                    `Từ "chết": ${stats.deadWords}` :
                    `Dead words: ${stats.deadWords}`);
                
                if (stats.totalWords > 0) {
                    const elementName = isVietnamese5 ? 'âm tiết' : 'letter';
                    console.log(isVietnamese5 ? `\nPhân bố ${elementName}:` : `\n${elementName} distribution:`);
                    const elementStats = stats.elementStats || stats.letterStats;
                    Object.keys(elementStats).sort().forEach(element => {
                        const stat = elementStats[element];
                        console.log(`  ${element}: ${stat.starting} ${isVietnamese5 ? 'đầu' : 'starting'}, ${stat.ending} ${isVietnamese5 ? 'cuối' : 'ending'}`);
                    });
                }
                break;

            case 'words':
            case 'tatca':
                const allWords = this.helper.getAllWords();
                const isVietnamese6 = this.helper.getLanguage() === 'vietnamese';
                if (allWords.length === 0) {
                    console.log(isVietnamese6 ? 
                        'Không có từ nào trong cơ sở dữ liệu. Dùng lệnh "them" để thêm từ.' :
                        'No words in the database. Use "add" command to add words.');
                } else {
                    console.log(isVietnamese6 ? 
                        `Tất cả từ (${allWords.length}): ${allWords.join(', ')}` :
                        `All words (${allWords.length}): ${allWords.join(', ')}`);
                }
                break;

            case 'clear':
            case 'xoa':
                this.helper.clear();
                const isVietnamese7 = this.helper.getLanguage() === 'vietnamese';
                console.log(isVietnamese7 ? 'Đã xóa cơ sở dữ liệu.' : 'Database cleared.');
                break;

            case 'dead':
            case 'tuchet':
                const deadWords = this.helper.getDeadWords();
                const isVietnamese8 = this.helper.getLanguage() === 'vietnamese';
                if (deadWords.length === 0) {
                    console.log(isVietnamese8 ? 
                        'Không có từ "chết" nào.' :
                        'No dead words found.');
                } else {
                    console.log(isVietnamese8 ? 
                        `Từ "chết" (${deadWords.length}): ${deadWords.join(', ')}` :
                        `Dead words (${deadWords.length}): ${deadWords.join(', ')}`);
                }
                break;

            case 'remove':
            case 'xoatu':
                if (args.length === 0) {
                    const isVietnamese = this.helper.getLanguage() === 'vietnamese';
                    console.log(isVietnamese ? 'Cách dùng: xoatu <từ1> [từ2] ...' : 'Usage: remove <word1> [word2] ...');
                    break;
                }
                this.helper.removeWords(args);
                const isVietnamese9 = this.helper.getLanguage() === 'vietnamese';
                console.log(isVietnamese9 ? 
                    `Đã xóa ${args.length} từ: ${args.join(', ')}` :
                    `Removed ${args.length} word(s): ${args.join(', ')}`);
                break;

            case 'update':
            case 'capnhat':
                if (args.length !== 2) {
                    const isVietnamese = this.helper.getLanguage() === 'vietnamese';
                    console.log(isVietnamese ? 'Cách dùng: capnhat <từ_cũ> <từ_mới>' : 'Usage: update <old_word> <new_word>');
                    break;
                }
                this.helper.updateWord(args[0], args[1]);
                const isVietnamese10 = this.helper.getLanguage() === 'vietnamese';
                console.log(isVietnamese10 ? 
                    `Đã cập nhật "${args[0]}" thành "${args[1]}"` :
                    `Updated "${args[0]}" to "${args[1]}"`);
                break;

            case 'language':
            case 'ngonngu':
                if (args.length !== 1) {
                    const isVietnamese = this.helper.getLanguage() === 'vietnamese';
                    console.log(isVietnamese ? 'Cách dùng: ngonngu <vietnamese/english>' : 'Usage: language <vietnamese/english>');
                    break;
                }
                const newLang = args[0].toLowerCase();
                if (newLang === 'vietnamese' || newLang === 'tiếng việt' || newLang === 'english') {
                    this.helper.setLanguage(newLang);
                    console.log(`Language changed to: ${this.helper.getLanguage()}`);
                } else {
                    console.log('Supported languages: vietnamese, english');
                }
                break;

            case 'history':
            case 'lichsu':
                const history = this.helper.getWordHistory();
                const isVietnamese11 = this.helper.getLanguage() === 'vietnamese';
                console.log(isVietnamese11 ? '\nLịch sử sử dụng từ:' : '\nWord Usage History:');
                console.log('='.repeat(20));
                const entries = Object.entries(history);
                if (entries.length === 0) {
                    console.log(isVietnamese11 ? 'Chưa có lịch sử sử dụng.' : 'No usage history available.');
                } else {
                    entries.sort((a, b) => b[1] - a[1]);
                    entries.slice(0, 10).forEach(([word, count]) => {
                        console.log(`  ${word}: ${count} ${isVietnamese11 ? 'lần' : 'times'}`);
                    });
                }
                break;

            case 'help':
            case 'trogiup':
                this.showHelp();
                break;

            case 'quit':
            case 'exit':
            case 'thoat':
                const isVietnamese12 = this.helper.getLanguage() === 'vietnamese';
                console.log(isVietnamese12 ? 'Tạm biệt!' : 'Goodbye!');
                this.rl.close();
                return false;

            default:
                if (command) {
                    const isVietnamese = this.helper.getLanguage() === 'vietnamese';
                    console.log(isVietnamese ? 
                        `Lệnh không xác định: ${command}` : 
                        `Unknown command: ${command}`);
                    console.log(isVietnamese ? 
                        'Gõ "trogiup" để xem các lệnh có sẵn.' :
                        'Type "help" for available commands.');
                }
                break;
        }
        return true;
    }

    start() {
        const isVietnamese = this.helper.getLanguage() === 'vietnamese' || this.helper.getLanguage() === 'tiếng việt';
        
        if (isVietnamese) {
            console.log('Trợ giúp Từ Ghép Tiếng Việt - CLI');
            console.log('Gõ "trogiup" để xem các lệnh có sẵn hoặc "thoat" để thoát.\n');
            
            const stats = this.helper.getStats();
            console.log(`Đã tải ${stats.totalWords} từ ghép tiếng Việt từ từ điển.\n`);
            console.log('Một số từ mẫu:', this.helper.getAllWords().slice(0, 8).join(', '), '\n');
        } else {
            console.log('Word Chain Helper CLI');
            console.log('Type "help" for available commands or "quit" to exit.\n');
            
            // Add some default words for English
            const defaultWords = ['apple', 'elephant', 'tiger', 'rabbit', 'tree', 'eagle', 'lemon', 'orange'];
            this.helper.addWords(defaultWords);
            console.log(`Loaded ${defaultWords.length} default words: ${defaultWords.join(', ')}\n`);
        }

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