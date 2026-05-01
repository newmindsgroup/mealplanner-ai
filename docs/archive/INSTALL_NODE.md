# Installing Node.js

Since Node.js is not currently available in your system PATH, you'll need to install it first. Here are the easiest options for macOS:

## Option 1: Homebrew (Recommended)

If you have Homebrew installed:

```bash
brew install node
```

If you don't have Homebrew, install it first:
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Then install Node.js:
```bash
brew install node
```

## Option 2: Official Installer (Easiest)

1. Visit https://nodejs.org/
2. Download the **LTS version** (recommended)
3. Run the installer
4. Follow the installation wizard
5. Restart your terminal

## Option 3: Using nvm (Node Version Manager)

This allows you to manage multiple Node.js versions:

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Restart terminal or run:
source ~/.zshrc

# Install latest LTS Node.js
nvm install --lts
nvm use --lts
```

## Verify Installation

After installing, verify it works:

```bash
node --version
npm --version
```

You should see version numbers like:
- Node.js: v20.x.x or v18.x.x
- npm: 10.x.x or 9.x.x

## After Installing Node.js

Once Node.js is installed, run:

```bash
cd "/Users/newmindsgroup/Documents/Visual Studio Code/MealPlan Assistant Project"
./install.sh
```

Or manually:

```bash
npm install
npm run dev
```

## Need Help?

- Node.js website: https://nodejs.org/
- Homebrew: https://brew.sh/
- nvm: https://github.com/nvm-sh/nvm

