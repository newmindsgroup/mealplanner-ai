# 🚀 Deployment Package Ready!

## Quick Start

When you're ready to deploy to cPanel for your clients:

### 1. Create the Deployment Package

Run this command:

```bash
./deploy-to-cpanel.sh
```

This will:
- ✅ Build the production version
- ✅ Create a complete deployment folder
- ✅ Generate all necessary files (.htaccess, config templates)
- ✅ Create a ZIP file for easy upload

### 2. What You'll Get

After running the script, you'll have:

- **`meal-plan-assistant-cpanel/`** - Complete deployment folder
- **`meal-plan-assistant-cpanel.zip`** - Ready-to-upload ZIP file
- **`INSTALLATION.txt`** - Step-by-step installation guide
- **`config.example.js`** - API key configuration template

### 3. For Each Client Installation

1. **Upload** `meal-plan-assistant-cpanel.zip` to their cPanel
2. **Extract** in `public_html`
3. **Configure** API key (rename `config.example.js` to `config.js` and add key)
4. **Done!** The app is live

## Package Contents

The deployment package includes:

```
meal-plan-assistant-cpanel/
├── index.html              # Main app entry point
├── .htaccess              # Apache routing & optimization
├── config.example.js      # API key template
├── INSTALLATION.txt       # Installation instructions
├── README.txt            # Quick reference
├── assets/               # Compiled JavaScript & CSS
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── ...
└── [other static files]
```

## Client Setup Process

For each client, they need to:

1. **Upload files** to cPanel (5 minutes)
2. **Add API key** to config.js (2 minutes)
3. **Test the app** (1 minute)

**Total setup time: ~8 minutes per client**

## API Key Management

### Option 1: Each Client Uses Their Own Key
- Each client creates their own OpenAI/Anthropic account
- They add their own API key to config.js
- They pay for their own usage

### Option 2: You Provide the Key
- You add your API key to config.js before sending
- You manage API costs
- Clients use the app without setup

### Option 3: White Label Service
- You can modify the code to use a backend proxy
- API keys stay on your server
- More secure but requires backend setup

## Testing Before Deployment

Before deploying to clients:

1. **Test locally:**
   ```bash
   npm run build
   npm run preview
   ```

2. **Test the deployment package:**
   - Extract the ZIP
   - Test in a local web server
   - Verify config.js works

3. **Test on a staging domain:**
   - Upload to a test subdomain
   - Verify all features work
   - Check mobile responsiveness

## Updating the App

When you need to update:

1. Make your changes
2. Run `./deploy-to-cpanel.sh` again
3. Send updated files to clients
4. They upload new files (keep their config.js)

## Documentation Files

- **`CPANEL_DEPLOYMENT.md`** - Complete deployment guide
- **`INSTALLATION.txt`** (in package) - Client installation steps
- **`README.txt`** (in package) - Quick reference

## Ready to Deploy!

Everything is set up. When you're ready:

```bash
./deploy-to-cpanel.sh
```

Then upload the ZIP file to cPanel! 🎉

