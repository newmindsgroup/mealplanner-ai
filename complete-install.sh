#!/bin/bash

# Complete Installation Script - Waits for Node.js and completes setup

set -e

echo "🚀 Meal Plan Assistant - Complete Installation"
echo "=============================================="
echo ""

# Load nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Wait for Node.js installation to complete
echo "⏳ Checking Node.js installation..."
MAX_WAIT=300  # 5 minutes max wait
WAITED=0

while ! command -v node &> /dev/null; do
    if [ $WAITED -ge $MAX_WAIT ]; then
        echo "❌ Timeout waiting for Node.js installation"
        echo "Please run manually: nvm install --lts"
        exit 1
    fi
    
    # Check if nvm is installing
    if [ -d "$NVM_DIR/versions/node" ]; then
        echo "⏳ Node.js installation in progress... (waited ${WAITED}s)"
        sleep 5
        WAITED=$((WAITED + 5))
        
        # Try to use any installed version
        INSTALLED=$(ls -1 "$NVM_DIR/versions/node" 2>/dev/null | head -1)
        if [ -n "$INSTALLED" ]; then
            nvm use "$INSTALLED" 2>/dev/null || true
        fi
    else
        echo "📥 Installing Node.js via nvm..."
        nvm install --lts
        sleep 10
        WAITED=$((WAITED + 10))
    fi
done

echo "✅ Node.js found: $(node --version)"
echo "✅ npm found: $(npm --version)"
echo ""

# Now run the main installation
echo "📦 Installing project dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo ""
    echo "=============================================="
    echo "🎉 Installation Complete!"
    echo "=============================================="
    echo ""
    echo "To start the development server, run:"
    echo "  npm run dev"
    echo ""
    echo "Then open: http://localhost:5173"
    echo ""
else
    echo "❌ Installation failed"
    exit 1
fi

