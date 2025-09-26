# Vua nối từ Beng - Chrome Extension

Chrome Extension version of the Vietnamese and English word chaining helper.

## Features

- 🔍 **Find Words**: Find words that can be chained before/after given words
- ✅ **Word Validation**: Check if words are valid and exist in dictionary  
- ⚙️ **Word Management**: Add/remove custom words to personal dictionary
- 🌐 **Multi-language**: Support for Vietnamese (2-syllable compound words) and English
- 💾 **Persistent Storage**: User-added words are saved in Chrome storage
- 📋 **Copy to Clipboard**: Click any word to copy it

## Installation

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the `chrome-extension` folder
5. The extension should now appear in your Chrome toolbar

## How to Use

1. **Click the extension icon** in your Chrome toolbar to open the popup
2. **Switch languages** using the dropdown (Vietnamese 🇻🇳 or English 🇺🇸)
3. **Find words**: 
   - Enter a word in the search box
   - Click "Tìm từ theo sau" (Find next words) or "Tìm từ đứng trước" (Find previous words)
   - Click any result to copy it to clipboard
4. **Validate words**: Use the "Kiểm tra" tab to check if a word is valid
5. **Manage words**: Use the "Quản lý" tab to add or remove custom words

## Technical Details

### Files Structure
- `manifest.json` - Extension configuration
- `popup.html` - Main UI 
- `popup.css` - Styling
- `popup.js` - UI logic and event handling
- `wordchain-core.js` - Core word chaining functionality
- `dictionary-data.js` - Dictionary words data
- `background.js` - Service worker for background tasks

### Dictionary Data
- **Vietnamese**: ~80 compound words (sample from larger dictionaries)
- **English**: ~80 essential words for word chaining
- **User Words**: Stored in Chrome local storage, persistent across sessions

### Word Chaining Rules
- **Vietnamese**: Syllable-based chaining (last syllable → first syllable)
- **English**: Letter-based chaining (last letter → first letter)

## Development

To test the extension:
1. Open `test.html` in a browser to test core functionality
2. Load the extension in Chrome developer mode
3. Check console logs for any errors

## Differences from Desktop Version

This Chrome extension is a simplified version of the original Electron desktop app:
- Smaller dictionary (for performance in browser)
- No Node.js dependencies
- Uses Chrome storage instead of file system
- Optimized for popup UI size constraints

## Future Enhancements

- [ ] Larger dictionary datasets
- [ ] Export/import user words
- [ ] Word chain game mode
- [ ] Statistics and analytics
- [ ] Dark theme support