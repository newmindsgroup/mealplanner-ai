# API Setup Guide

This guide will help you connect the Meal Plan Assistant to either OpenAI or Anthropic APIs for full AI functionality.

## Quick Start

1. **Choose your provider** (OpenAI or Anthropic)
2. **Get an API key** from your chosen provider
3. **Create a `.env` file** in the project root
4. **Add your API key** to the `.env` file
5. **Restart your development server**

## Option 1: OpenAI Setup

### Step 1: Get Your API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to [API Keys](https://platform.openai.com/api-keys)
4. Click "Create new secret key"
5. Copy the key (you won't be able to see it again!)

### Step 2: Configure Your Project

Create a `.env` file in the project root:

```bash
VITE_OPENAI_API_KEY=sk-your-actual-api-key-here
```

### Step 3: Restart Development Server

```bash
npm run dev
```

## Option 2: Anthropic Setup

### Step 1: Get Your API Key

1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Sign up or log in
3. Navigate to API Keys
4. Click "Create Key"
5. Copy the key

### Step 2: Configure Your Project

Create a `.env` file in the project root:

```bash
VITE_ANTHROPIC_API_KEY=sk-ant-your-actual-api-key-here
```

### Step 3: Restart Development Server

```bash
npm run dev
```

## Using Both APIs

If you provide both API keys, **Anthropic will be used by default**. To use OpenAI instead, remove the Anthropic key from your `.env` file.

## API Costs

### OpenAI
- **GPT-4 Turbo**: ~$0.01-0.03 per 1K tokens
- **GPT-3.5 Turbo**: ~$0.0005-0.002 per 1K tokens
- Typical meal plan generation: ~2000-4000 tokens (~$0.02-0.12)

### Anthropic
- **Claude 3.5 Sonnet**: ~$0.003-0.015 per 1K tokens
- Typical meal plan generation: ~2000-4000 tokens (~$0.006-0.06)

**Note**: Costs vary based on usage. Chat messages are typically smaller than full meal plan generations.

## Features Enabled with API

Once configured, you'll have access to:

✅ **Intelligent Chat Assistant**
- Personalized meal planning advice
- Nutrition questions and answers
- Meal modifications and suggestions

✅ **AI-Powered Meal Planning**
- Context-aware meal generation
- Blood type compatibility checking
- Cultural and seasonal adaptations
- Multi-person family planning

✅ **Label Analysis Enhancement**
- Better ingredient recognition
- Improved conflict detection
- More accurate safety flags

## Troubleshooting

### "No API key found" Error

- Make sure your `.env` file is in the project root (same level as `package.json`)
- Restart your development server after adding the key
- Check that the variable name is exactly `VITE_OPENAI_API_KEY` or `VITE_ANTHROPIC_API_KEY`
- Ensure there are no spaces around the `=` sign

### API Rate Limits

Both providers have rate limits:
- **OpenAI**: Varies by tier (free tier: 3 requests/minute)
- **Anthropic**: Varies by tier

If you hit rate limits:
- Wait a few minutes and try again
- Consider upgrading your API tier
- Reduce the frequency of requests

### API Errors

Common errors:
- **401 Unauthorized**: Invalid API key - check your key
- **429 Too Many Requests**: Rate limit exceeded - wait and retry
- **500 Server Error**: Provider issue - try again later

### Testing Your Setup

1. Open the chat panel
2. Type: "Hello, can you help me plan meals?"
3. If you see a helpful response (not the demo message), your API is working!

## Security Notes

⚠️ **Important**: Never commit your `.env` file to version control!

The `.env` file is already in `.gitignore`, but always double-check before pushing code.

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_OPENAI_API_KEY` | OpenAI API key | One of these |
| `VITE_ANTHROPIC_API_KEY` | Anthropic API key | One of these |

## Need Help?

- Check the [OpenAI Documentation](https://platform.openai.com/docs)
- Check the [Anthropic Documentation](https://docs.anthropic.com/)
- Review the console for detailed error messages

