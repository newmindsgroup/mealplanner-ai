#!/bin/bash

# Meal Plan Assistant - Automatic Setup Script

echo "🚀 Setting up Meal Plan Assistant..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed or not in PATH"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from template..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "📝 Please add your API key to .env file"
    fi
else
    echo "✅ .env file exists"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully!"
    echo ""
    echo "🎉 Setup complete! You can now run:"
    echo "   npm run dev"
    echo ""
    echo "Then open http://localhost:5173 in your browser"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

