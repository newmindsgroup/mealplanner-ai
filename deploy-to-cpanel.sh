#!/bin/bash

# Meal Plan Assistant - cPanel Deployment Package Builder
# This script creates a complete deployment package for cPanel

set -e

echo "🚀 Creating cPanel Deployment Package"
echo "======================================"
echo ""

# Load nvm if needed
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" 2>/dev/null || true

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js first."
    exit 1
fi

# Create deployment directory
DEPLOY_DIR="meal-plan-assistant-cpanel"
echo "📦 Creating deployment package..."

# Clean up old deployment
rm -rf "$DEPLOY_DIR"
rm -f "${DEPLOY_DIR}.zip"
mkdir -p "$DEPLOY_DIR"

# Build production version
echo "🔨 Building production version..."
npm run build

if [ ! -d "dist" ]; then
    echo "❌ Build failed - dist directory not found"
    exit 1
fi

# Copy built files
echo "📋 Copying files..."
cp -r dist/* "$DEPLOY_DIR/"

# Create .htaccess for SPA routing
echo "⚙️  Creating .htaccess for cPanel..."
cat > "$DEPLOY_DIR/.htaccess" << 'EOF'
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# Enable compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Cache static assets
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType application/json "access plus 0 seconds"
</IfModule>

# Security headers
<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "SAMEORIGIN"
  Header set X-XSS-Protection "1; mode=block"
</IfModule>
EOF

# Create config file for API keys (since .env won't work in static hosting)
echo "⚙️  Creating configuration template..."
cat > "$DEPLOY_DIR/config.example.js" << 'EOF'
// API Configuration for Meal Plan Assistant
// 
// INSTRUCTIONS:
// 1. Rename this file to: config.js
// 2. Replace 'your_openai_api_key_here' with your actual API key
// 3. Save the file
// 4. DO NOT share this file or commit it to version control
//
// Get your API keys from:
// - OpenAI: https://platform.openai.com/api-keys
// - Anthropic: https://console.anthropic.com/

window.APP_CONFIG = {
  // Only ONE API key is needed. If both are provided, Anthropic will be used.
  OPENAI_API_KEY: 'your_openai_api_key_here',
  // ANTHROPIC_API_KEY: 'your_anthropic_api_key_here',
};
EOF

# Create installation instructions
echo "📝 Creating installation instructions..."
cat > "$DEPLOY_DIR/INSTALLATION.txt" << 'EOF'
MEAL PLAN ASSISTANT - cPanel Installation Instructions
=====================================================

STEP 1: Upload Files
-------------------
1. Log into your cPanel account
2. Open "File Manager"
3. Navigate to your domain's public_html folder (or subdomain folder)
4. Upload ALL files from this package to public_html
   - You can upload the ZIP file and extract it, or
   - Upload all files individually
5. Make sure .htaccess is uploaded (it may be hidden - enable "Show Hidden Files")

STEP 2: Configure API Keys
-------------------------
1. In File Manager, locate config.example.js
2. Right-click → Rename → Change to: config.js
3. Right-click → Edit
4. Replace 'your_openai_api_key_here' with your actual API key:
   
   Example:
   window.APP_CONFIG = {
     OPENAI_API_KEY: 'sk-proj-abc123...',
   };

5. Click "Save Changes"

Get API keys from:
- OpenAI: https://platform.openai.com/api-keys
- Anthropic: https://console.anthropic.com/

STEP 3: Set Permissions
-----------------------
1. Select the .htaccess file
2. Right-click → Change Permissions
3. Set to 644 (or 644 for files, 755 for directories)
4. Click "Change Permissions"

STEP 4: Test Installation
--------------------------
1. Visit your domain in a browser
2. You should see the Meal Plan Assistant app
3. Complete the onboarding wizard
4. Test the chat feature

TROUBLESHOOTING
---------------
Blank Page:
- Check browser console (F12) for errors
- Verify all files were uploaded
- Ensure index.html exists in root
- Clear browser cache

Routing Not Working (404 on refresh):
- Ensure .htaccess is uploaded
- Check .htaccess permissions (should be 644)
- Contact hosting to enable mod_rewrite

API Not Working:
- Verify config.js exists (not config.example.js)
- Check API key is correct
- Ensure API key has credits/quota
- Check browser console for API errors

SUPPORT
-------
For issues, check:
- Browser console (F12) for errors
- cPanel error logs
- Ensure all files were uploaded correctly
EOF

# Create a README for the deployment package
cat > "$DEPLOY_DIR/README.txt" << 'EOF'
MEAL PLAN ASSISTANT - Deployment Package
========================================

This package contains everything needed to install Meal Plan Assistant
on your cPanel hosting.

QUICK START:
1. Upload all files to public_html
2. Rename config.example.js to config.js
3. Add your API key to config.js
4. Visit your domain

See INSTALLATION.txt for detailed instructions.
EOF

# Create a zip file for easy upload
echo "📦 Creating ZIP archive..."
cd "$DEPLOY_DIR"
zip -r "../meal-plan-assistant-cpanel.zip" . -x "*.DS_Store" "*.git*" > /dev/null 2>&1
cd ..

echo ""
echo -e "${GREEN}✅ Deployment package created successfully!${NC}"
echo ""
echo "📁 Package folder: $DEPLOY_DIR/"
echo "📦 ZIP file: meal-plan-assistant-cpanel.zip"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Upload meal-plan-assistant-cpanel.zip to cPanel File Manager"
echo "2. Extract it in public_html"
echo "3. Follow INSTALLATION.txt instructions"
echo "4. Visit your domain to test"
echo ""
echo "For detailed instructions, see: CPANEL_DEPLOYMENT.md"
echo ""
