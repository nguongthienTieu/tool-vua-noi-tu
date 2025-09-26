# Chrome Extension Installation Guide

## How to Install the Chrome Extension

### Step 1: Prepare the Extension Files
1. Navigate to the `chrome-extension` folder in this repository
2. Ensure all files are present:
   - `manifest.json`
   - `popup.html`
   - `popup.css`
   - `popup.js`
   - `wordchain-core.js`
   - `dictionary-data.js`
   - `background.js`
   - `icons/` folder with icon files

### Step 2: Load Extension in Chrome
1. Open Google Chrome
2. Go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in the top right corner)
4. Click "Load unpacked"
5. Select the `chrome-extension` folder
6. The extension should now appear in your Chrome toolbar

### Step 3: Using the Extension
1. Click the extension icon in the Chrome toolbar
2. The popup will open with the word chain helper interface
3. Use the language dropdown to switch between Vietnamese 🇻🇳 and English 🇺🇸
4. Use the three tabs:
   - **🔍 Tìm từ**: Find words that can be chained before/after your input
   - **✅ Kiểm tra**: Validate if a word exists in the dictionary
   - **⚙️ Quản lý**: Add/remove custom words

### Features
- ✅ Multi-language support (Vietnamese and English)
- ✅ Word validation and dictionary lookup
- ✅ Word chaining with syllable-based (Vietnamese) and letter-based (English) rules
- ✅ Custom word management with Chrome storage persistence
- ✅ Copy to clipboard by clicking on any word result
- ✅ Responsive popup UI optimized for Chrome extension

### Troubleshooting
- If the extension doesn't load, check the Chrome Developer Console for errors
- Make sure all files are in the correct locations
- Refresh the extension in `chrome://extensions/` if you make changes
- Check that the manifest.json is valid JSON format