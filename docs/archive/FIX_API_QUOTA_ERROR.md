# Fix API Quota Exceeded Error

## ❌ Current Issue

Your OpenAI API key has exceeded its quota. The error message indicates:
```
Connection failed: You exceeded your current quota, please check your plan and billing details.
```

## ✅ Quick Solutions (Choose One)

### **Solution 1: Turn Off Custom Key (FASTEST - 30 seconds)**

Your app has a toggle to switch between your custom key and a default key.

**Steps:**
1. In the Settings page (where you see the error)
2. Find the **"Use Custom API Key"** toggle at the top (it's currently ON/green)
3. **Click to toggle it OFF**
4. Click **"Test Connection"** to verify
5. ✅ Done! The app will now use the default key

---

### **Solution 2: Add Credits to Your OpenAI Account**

If you want to continue using your custom key:

**Steps:**
1. Go to: [https://platform.openai.com/account/billing](https://platform.openai.com/account/billing)
2. Sign in with your OpenAI account
3. Click **"Add payment details"** (if not already added)
4. Purchase credits (recommended: $10-$20)
5. Wait 1-2 minutes for credits to activate
6. Return to your app and click **"Test Connection"**
7. ✅ Done!

**Note:** OpenAI requires:
- A valid payment method on file
- Prepaid credits (no longer offers free tier after initial $5)
- Minimum $5 purchase

---

### **Solution 3: Use a New API Key**

If you have another OpenAI account with credits:

**Steps:**
1. Go to: [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Create a new API key (or use an existing one)
3. Copy the key (starts with `sk-`)
4. In your app Settings, paste it in the **"Update API Key"** field
5. Click **"Update Key"**
6. Click **"Test Connection"**
7. ✅ Done!

---

## 🔧 For Developers: Set Up Default API Key

I've created a configuration file for you: **`public/config.js`**

**To set up a default/fallback key:**

1. Open: `/public/config.js`
2. Replace `'your_openai_api_key_here'` with a working API key:
   ```javascript
   window.APP_CONFIG = {
     OPENAI_API_KEY: 'sk-proj-your-actual-key-here',
   };
   ```
3. Save the file
4. Restart your development server (if running)

**Benefits:**
- Users can toggle between their custom key and your default key
- Provides a fallback when users' keys run out
- Better user experience

**Important:** 
- ✅ Added `public/config.js` to `.gitignore` (keeps your key safe)
- ✅ Created `public/config.example.js` as a template
- ❌ Never commit `config.js` to version control

---

## 📊 Check Your API Usage

To see how much you've used:

1. Go to: [https://platform.openai.com/usage](https://platform.openai.com/usage)
2. View your usage by:
   - Day
   - Model (GPT-3.5, GPT-4, etc.)
   - Cost

---

## 🆘 Still Having Issues?

### Check if your key is valid:
```bash
# Test your API key directly
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer YOUR_API_KEY"
```

If you see an error about quota, you need to add credits.
If you see a list of models, your key works!

### Common Issues:
1. **Free trial expired** - OpenAI's $5 free credit expires after 3 months
2. **No payment method** - Add a payment method to continue using the API
3. **Insufficient credits** - Purchase more credits
4. **Rate limits** - Wait a few minutes and try again

---

## ⚡ Recommended Action

**For immediate use:** Choose **Solution 1** (toggle off custom key)

**For long-term:** Either:
- Add credits to your OpenAI account (Solution 2), OR
- Set up a default API key in `public/config.js` (For Developers section)

---

## 📞 Need More Help?

- OpenAI Help: [https://help.openai.com](https://help.openai.com)
- Check API status: [https://status.openai.com](https://status.openai.com)
- Pricing: [https://openai.com/pricing](https://openai.com/pricing)

