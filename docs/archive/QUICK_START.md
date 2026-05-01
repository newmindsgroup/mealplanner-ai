# Quick Start Guide

## ✅ What's Already Done

1. ✅ Project structure created
2. ✅ All source files written
3. ✅ OpenAI API key configured in `.env`
4. ✅ `.gitignore` updated to protect your API key

## 🚀 Next Steps (Run These Commands)

### Option 1: Use the Setup Script (Recommended)

```bash
./setup.sh
```

This will:
- Check Node.js installation
- Install all dependencies
- Verify your setup

Then start the dev server:
```bash
npm run dev
```

### Option 2: Manual Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Open in browser:**
   Navigate to `http://localhost:5173`

## 🎯 First Time Using the App

1. **Complete Onboarding:**
   - Add at least one family member
   - Set your preferences
   - Complete the wizard

2. **Test AI Integration:**
   - Go to Chat panel
   - Type: "Hello, can you help me plan meals?"
   - You should get an AI response!

3. **Generate a Meal Plan:**
   - Go to Weekly Plan
   - Click "Generate Weekly Plan"
   - AI will create a personalized plan

## 🔧 Troubleshooting

### "npm: command not found"
- Install Node.js from https://nodejs.org/
- Or use a Node version manager (nvm, fnm)

### "Port 5173 already in use"
- Stop the other process using that port
- Or change the port in `vite.config.ts`

### API not working
- Verify `.env` file exists in project root
- Check API key is correct
- Restart dev server after adding/changing `.env`

## 📚 More Information

- See `API_SETUP.md` for detailed API configuration
- See `README.md` for full documentation
- See `INTEGRATION_SUMMARY.md` for technical details

## 🎉 You're All Set!

Everything is configured and ready to go. Just run `npm install` and `npm run dev` to start!

