// Dictionary data extraction for Chrome extension
// This file contains minimal word lists for browser compatibility

// Vietnamese words - sample from dictionaries (reduced for extension size)
const VIETNAMESE_WORDS = [
    "con voi", "voi con", "bánh mì", "mì quảng", "quảng cáo", "cáo già", 
    "già nua", "nua đời", "đời người", "người ta", "ta đây", "đây kia",
    "hoa đào", "đào tạo", "tạo dựng", "dựng xây", "xây nhà", "nhà cửa",
    "cửa sổ", "sổ tay", "tay chân", "chân tay", "tay áo", "áo dài",
    "dài lâu", "lâu năm", "năm tháng", "tháng ngày", "ngày đêm", "đêm hôm",
    "hôm nay", "nay mai", "mai sau", "sau này", "này nọ", "nọ kia",
    "kia này", "này đó", "đó đây", "đây rồi", "rồi đấy", "đấy nhé",
    "nhé em", "em gái", "gái đẹp", "đẹp trai", "trai trẻ", "trẻ con",
    "con người", "người đời", "đời sống", "sống chết", "chết sống", "sống còn",
    "còn lại", "lại đây", "đây đó", "đó kia", "kia nọ", "nọ này",
    "này kìa", "kìa kia", "kia đó", "đó này", "này đây", "đây mà",
    "mà sao", "sao vậy", "vậy thì", "thì thôi", "thôi được", "được rồi",
    "rồi sao", "sao đó", "đó mà", "mà thôi", "thôi nha", "nha em",
    "máy tính", "tính toán", "toán học", "học hành", "hành khách", "khách sạn",
    "sạn đá", "đá bọt", "bọt nước", "nước mắm", "mắm tôm", "tôm cua",
    "cua biển", "biển cả", "cả ngày", "ngày mai", "mai mốt", "mốt nọ"
];

// English words - essential words for word chaining
const ENGLISH_WORDS = [
    "cat", "top", "pen", "net", "ten", "end", "dog", "got", "tea", "ant",
    "tiger", "rat", "tap", "pig", "gap", "put", "toy", "yes", "sun", "new",
    "win", "now", "web", "buy", "yet", "try", "run", "net", "tin", "nap",
    "pan", "not", "ton", "one", "eat", "toe", "egg", "get", "tip", "pie",
    "ice", "cop", "pot", "owl", "lap", "pan", "net", "tie", "ear", "red",
    "dad", "den", "nut", "tap", "pig", "gun", "net", "ton", "nod", "dig",
    "gap", "pin", "nip", "put", "toy", "yes", "sit", "tap", "pan", "net",
    "apple", "every", "young", "green", "never", "right", "today", "your",
    "real", "low", "way", "year", "red", "day", "yes", "sit", "top", "pig",
    "good", "down", "now", "we", "end", "dig", "get", "too", "our", "run",
    "new", "win", "net", "ten", "not", "tan", "nap", "pet", "tin", "nod",
    "dog", "got", "two", "old", "down", "new", "won", "net", "tin", "nap"
];

// Placeholder for other dictionaries (reduced for performance)
const HONGOCDUC_WORDS = [
    "học sinh", "sinh viên", "viên chức", "chức vụ", "vụ việc", "việc làm",
    "làm bài", "bài tập", "tập thể", "thể dục", "dục đức", "đức hạnh",
    "hạnh phúc", "phúc lợi", "lợi ích", "ích lợi", "lợi nhuận", "nhuận bút"
];

const TUDIENTV_WORDS = [
    "giáo viên", "viên gạch", "gạch đá", "đá hoa", "hoa quả", "quả bóng",
    "bóng đá", "đá banh", "banh chưng", "chưng cất", "cất giữ", "giữ gìn",
    "gìn giữ", "giữ lại", "lại gần", "gần xa", "xa xôi", "xôi nếp"
];

const WIKTIONARY_WORDS = [
    "tình yêu", "yêu thương", "thương mến", "mến thương", "thương tình", "tình cờ",
    "cờ đỏ", "đỏ tươi", "tươi mát", "mát lành", "lành mạnh", "mạnh khỏe",
    "khỏe mạnh", "mạnh mẽ", "mẽ màng", "màng tang", "tang thương", "thương tiếc"
];