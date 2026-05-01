#!/bin/bash

# Meal Plan Assistant - Complete Installation Script

set -e  # Exit on error

echo "🚀 Meal Plan Assistant - Installation Script"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check for Node.js
echo "📋 Checking prerequisites..."
if ! command_exists node; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo ""
    echo "Please install Node.js first:"
    echo ""
    echo "Option 1: Using Homebrew (recommended for macOS)"
    echo "  brew install node"
    echo ""
    echo "Option 2: Download from website"
    echo "  Visit: https://nodejs.org/"
    echo "  Download and install the LTS version"
    echo ""
    echo "Option 3: Using nvm (Node Version Manager)"
    echo "  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
    echo "  nvm install --lts"
    echo "  nvm use --lts"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ Node.js found: $(node --version)${NC}"
echo -e "${GREEN}✅ npm found: $(npm --version)${NC}"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found${NC}"
    if [ -f .env.example ]; then
        echo "Creating .env from .env.example..."
        cp .env.example .env
        echo -e "${YELLOW}⚠️  Please add your API key to .env file${NC}"
    else
        echo "Creating .env file..."
        echo "# OpenAI API Configuration" > .env
        echo "VITE_OPENAI_API_KEY=your_key_here" >> .env
        echo -e "${YELLOW}⚠️  Please add your API key to .env file${NC}"
    fi
else
    echo -e "${GREEN}✅ .env file exists${NC}"
    # Check if API key is set (not the placeholder)
    if grep -q "your_key_here\|your_openai_api_key_here\|your_anthropic_api_key_here" .env 2>/dev/null; then
        echo -e "${YELLOW}⚠️  API key appears to be a placeholder. Please update .env with your actual key${NC}"
    else
        echo -e "${GREEN}✅ API key appears to be configured${NC}"
    fi
fi
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
echo "This may take a few minutes..."
echo ""

npm install

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Dependencies installed successfully!${NC}"
    echo ""
    echo "=============================================="
    echo -e "${GREEN}🎉 Installation Complete!${NC}"
    echo "=============================================="
    echo ""
    echo "Next steps:"
    echo ""
    echo "1. Start the development server:"
    echo -e "   ${YELLOW}npm run dev${NC}"
    echo ""
    echo "2. Open your browser to:"
    echo -e "   ${YELLOW}http://localhost:5173${NC}"
    echo ""
    echo "3. Complete the onboarding wizard"
    echo ""
    echo "4. Start planning meals!"
    echo ""
else
    echo ""
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    echo "Please check the error messages above"
    exit 1
fi

