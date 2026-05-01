# Quick Start: Custom API Keys

## 🚀 For Users

### Step 1: Get Your API Key
1. Visit [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key (starts with `sk-`)
5. Save it somewhere safe!

### Step 2: Add to Meal Plan Assistant
1. Open the app
2. Click **Settings** in the sidebar
3. Find **"AI API Configuration"** section
4. Paste your key
5. Click **"Save Key"**
6. Click **"Test Connection"** to verify

### Step 3: Enjoy!
- Look for the green **"Custom Key"** badge in the top-right corner
- All AI features now use your personal key
- Monitor usage in your OpenAI dashboard

## 🛠️ For Developers

### Default Key Setup

**Development (.env file):**
```env
VITE_OPENAI_API_KEY=sk-your-default-key-here
```

**Production (config.js):**
```javascript
window.APP_CONFIG = {
  OPENAI_API_KEY: 'sk-your-default-key-here'
};
```

### Key Priority Order
1. **User's Custom Key** (if enabled)
2. **Your Default Key** (fallback)
3. **Error** (prompts user to add key)

### How It Works
- Custom keys are encrypted in localStorage
- AI Service checks for custom key first
- Falls back to default key automatically
- Status indicator shows which key is active

## 🎯 Key Features

- ✅ Custom API key support
- ✅ Encrypted storage
- ✅ Connection testing
- ✅ Quick toggle (custom ↔ default)
- ✅ Real-time status indicator
- ✅ Automatic fallback
- ✅ Zero server changes needed

## 📱 Where to Find

### Settings Panel
**Sidebar → Settings → AI API Configuration**
- Add/update API key
- Test connection
- Toggle custom key usage
- View current status

### Status Indicator
**Top-right corner (all pages)**
- Green = Custom key active
- Blue = Default key active
- Red = No key configured
- Click for details

## 🔒 Security Notes

- Keys are encrypted before storage
- Stored only in browser localStorage
- Never sent to any server (except OpenAI API)
- Can be removed anytime
- Toggle on/off without losing key

## ⚡ Quick Tips

1. **Test before use**: Always click "Test Connection" after adding a key
2. **Monitor usage**: Check your OpenAI dashboard regularly
3. **Set limits**: Configure spending limits in OpenAI settings
4. **Keep it secret**: Never share your API key
5. **Rotate regularly**: Change your key every few months

## 🐛 Troubleshooting

### "Connection Failed"
- Check if key is valid (starts with `sk-`)
- Verify you have credits in OpenAI account
- Test internet connection

### "No API Key Found"
- Add custom key in Settings
- Or wait for developer to configure default key

### AI Features Not Working
- Check status indicator (should be green or blue)
- Test connection in Settings
- Verify toggle is enabled (if using custom)

## 📚 Documentation

- Full Guide: `CUSTOM_API_KEY_GUIDE.md`
- Summary: `CUSTOM_API_KEY_SUMMARY.md`
- API Setup: `API_SETUP.md`

## ✅ Status

✅ Fully implemented
✅ Tested and working
✅ Production ready
✅ Zero linter errors
✅ Comprehensive documentation

---

**Questions?** Check the full documentation or contact support!

