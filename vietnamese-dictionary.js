/**
 * Vietnamese Dictionary for Word Chain Helper
 * Contains common 2-syllable Vietnamese compound words
 */

const vietnameseDictionary = [
    // Animals (Động vật)
    'con voi', 'con mèo', 'con chó', 'con gà', 'con cá', 'con lợn',
    'con bò', 'con ngựa', 'con chim', 'con ong', 'con kiến', 'con rùa',
    'con thỏ', 'con chuột', 'con bướm', 'con sâu', 'con gấu', 'con hổ',
    'con sư tử', 'con khỉ', 'con chim', 'con vịt', 'con ngan', 'con cò',
    
    // Food (Thức ăn)
    'bánh mì', 'cơm tấm', 'phở bò', 'bún chả', 'chả cá', 'nem nướng',
    'bánh chưng', 'bánh tét', 'xôi gấc', 'chè đậu', 'bánh flan',
    'mì quảng', 'bún bò', 'cháo lòng', 'bánh cuốn', 'bánh xèo',
    
    // Nature (Thiên nhiên)  
    'núi cao', 'sông nước', 'biển cả', 'rừng xanh', 'hoa đào', 'lá vàng',
    'trời xanh', 'mây trắng', 'gió mát', 'nắng ấm', 'mưa to', 'tuyết trắng',
    'đá cứng', 'cát vàng', 'đất đỏ', 'cỏ xanh', 'cây to', 'hoa thơm',
    
    // Objects (Đồ vật)
    'bàn ghế', 'tủ lạnh', 'điện thoại', 'máy tính', 'xe hơi', 'áo quần',
    'giày dép', 'mũ nón', 'sách vở', 'bút chì', 'thước kẻ', 'cặp sách',
    'đồng hồ', 'kính mắt', 'túi xách', 'ví tiền', 'chìa khóa', 'đèn pin',
    
    // Emotions/Abstract (Cảm xúc/Trừu tượng)
    'vui vẻ', 'buồn bã', 'giận dữ', 'yêu thương', 'ghét bỏ', 'lo lắng',
    'hạnh phúc', 'đau khổ', 'hy vọng', 'thất vọng', 'tự hào', 'xấu hổ',
    'can đảm', 'sợ hãi', 'tin tưởng', 'nghi ngờ', 'kiên nhẫn', 'nóng nảy',
    
    // Actions (Hành động)
    'đi lại', 'ăn uống', 'ngủ nghỉ', 'làm việc', 'học tập', 'chơi đùa',
    'nói chuyện', 'nghe nhạc', 'xem phim', 'đọc sách', 'viết bài', 'vẽ tranh',
    'hát ca', 'nhảy múa', 'chạy bộ', 'bơi lội', 'leo núi', 'câu cá',
];

// Historical and literary words
const historicalWords = [
    'vua chúa', 'hoàng hậu', 'công chúa', 'hoàng tử', 'quan lại', 'lính tráng',
    'thần dân', 'nông dân', 'thợ thủ công', 'buôn bán', 'kinh thành', 'cung đình',
    'đền chùa', 'lăng tẩm', 'văn học', 'thơ ca', 'sử sách', 'triết học',
    'võ thuật', 'y học', 'thuốc nam', 'phong thủy', 'âm dương', 'ngũ hành',
];

// Modern/Contemporary words  
const modernWords = [
    'internet', 'facebook', 'youtube', 'smartphone', 'laptop', 'wifi',
    'email', 'website', 'online', 'offline', 'update', 'download',
    'shopping', 'marketing', 'startup', 'freelance', 'remote', 'zoom',
    'covid', 'vaccine', 'lockdown', 'social distancing', 'hand sanitizer', 'mask',
];

module.exports = {
    vietnameseDictionary,
    historicalWords,
    modernWords,
    getAllWords: () => [...vietnameseDictionary, ...historicalWords, ...modernWords]
};