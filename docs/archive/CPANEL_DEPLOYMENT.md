# cPanel Deployment Guide

Complete guide for deploying Meal Plan Assistant to cPanel hosting.

## Quick Deployment

1. **Run the deployment script:**
   ```bash
   ./deploy-to-cpanel.sh
   ```

2. **Upload to cPanel:**
   - Upload `meal-plan-assistant-cpanel.zip` to cPanel File Manager
   - Extract in `public_html` (or your domain folder)

3. **Configure API keys:**
   - Rename `config.example.js` to `config.js`
   - Add your API key
   - Save

4. **Done!** Visit your domain

## Detailed Steps

### Step 1: Create Deployment Package

Run the deployment script on your local machine:

```bash
cd "/Users/newmindsgroup/Documents/Visual Studio Code/MealPlan Assistant Project"
./deploy-to-cpanel.sh
```

This will:
- Build the production version
- Create a deployment folder
- Generate all necessary files
- Create a ZIP file for easy upload

### Step 2: Upload to cPanel

#### Option A: Using cPanel File Manager

1. Log into cPanel
2. Open **File Manager**
3. Navigate to `public_html` (or your domain/subdomain folder)
4. Click **Upload**
5. Upload `meal-plan-assistant-cpanel.zip`
6. Right-click the ZIP file → **Extract**
7. Delete the ZIP file after extraction

#### Option B: Using FTP/SFTP

1. Use an FTP client (FileZilla, Cyberduck, etc.)
2. Connect to your server
3. Navigate to `public_html`
4. Upload all files from the `meal-plan-assistant-cpanel` folder
5. Make sure `.htaccess` is uploaded (enable "Show hidden files")

### Step 3: Configure API Keys

1. In File Manager, locate `config.example.js`
2. Right-click → **Rename** → Change to `config.js`
3. Right-click → **Edit**
4. Replace `your_openai_api_key_here` with your actual API key:

```javascript
window.APP_CONFIG = {
  OPENAI_API_KEY: 'sk-proj-your-actual-key-here',
  // Or use Anthropic:
  // ANTHROPIC_API_KEY: 'sk-ant-your-actual-key-here',
};
```

5. Click **Save Changes**

**Important:** Only one API key is needed. The app will use Anthropic if both are provided.

### Step 4: Set File Permissions

1. Select `.htaccess` file
2. Right-click → **Change Permissions**
3. Set to **644** (read/write for owner, read for others)
4. Click **Change Permissions**

### Step 5: Verify Installation

1. Visit your domain in a browser
2. You should see the Meal Plan Assistant app
3. Complete the onboarding wizard
4. Test features:
   - Chat assistant
   - Meal plan generation
   - Label analyzer

## File Structure in cPanel

After deployment, your `public_html` should contain:

```
public_html/
├── index.html
├── .htaccess
├── config.js (you create this)
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── ...
├── vite.svg
└── other static files
```

## Requirements

- **PHP:** Not required (this is a static site)
- **Node.js:** Not required on server (pre-built)
- **Apache mod_rewrite:** Required for routing (usually enabled by default)
- **SSL Certificate:** Recommended (HTTPS)

## Troubleshooting

### Blank Page / White Screen

**Check:**
1. Browser console (F12) for JavaScript errors
2. All files uploaded correctly
3. `index.html` exists in root
4. `.htaccess` is present and has correct permissions

**Solution:**
- Clear browser cache
- Check cPanel error logs
- Verify file paths are correct

### Routing Not Working (404 on refresh)

**Check:**
1. `.htaccess` file exists
2. Apache mod_rewrite is enabled
3. `.htaccess` has correct permissions (644)

**Solution:**
- Contact hosting support to enable mod_rewrite
- Verify `.htaccess` content is correct

### API Not Working

**Check:**
1. `config.js` exists (not `config.example.js`)
2. API key is correct in `config.js`
3. Browser console for API errors

**Solution:**
- Verify API key is valid
- Check API key has credits/quota
- Ensure `config.js` syntax is correct (no quotes issues)

### Slow Loading

**Optimizations:**
- Enable GZIP compression (already in `.htaccess`)
- Use CDN for assets (optional)
- Enable browser caching (already configured)

## Security Considerations

1. **Protect config.js:**
   - Don't share your API keys
   - Consider using server-side proxy for API calls (advanced)

2. **HTTPS:**
   - Always use HTTPS in production
   - Install SSL certificate in cPanel

3. **File Permissions:**
   - Files: 644
   - Directories: 755
   - `.htaccess`: 644

## Updating the App

When you need to update:

1. Run `./deploy-to-cpanel.sh` again
2. Upload new files to cPanel (overwrite old ones)
3. Keep your `config.js` file (don't overwrite it)
4. Clear browser cache

## Multi-Domain Setup

To install on multiple domains:

1. Create separate folders for each domain:
   - `public_html/domain1/`
   - `public_html/domain2/`

2. Upload package to each folder

3. Create separate `config.js` for each (if using different API keys)

## Support

For issues:
- Check browser console (F12)
- Review cPanel error logs
- Verify all installation steps completed
- Test API keys independently

## Production Checklist

- [ ] All files uploaded
- [ ] `.htaccess` present and has correct permissions
- [ ] `config.js` created with valid API key
- [ ] SSL certificate installed
- [ ] App loads correctly
- [ ] Chat/API features working
- [ ] Tested on multiple browsers
- [ ] Mobile responsive (test on phone)

