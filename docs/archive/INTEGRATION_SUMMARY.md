# API Integration Summary

## Overview

The Meal Plan Assistant now has full support for both **OpenAI** and **Anthropic** APIs. The integration is automatic and seamless - just add your API key and the app will use it!

## How It Works

### 1. Automatic Provider Detection

The app automatically detects which API key you've provided:
- If you provide **both** keys → **Anthropic** is used (preferred)
- If you provide only **OpenAI** key → **OpenAI** is used
- If you provide only **Anthropic** key → **Anthropic** is used
- If you provide **neither** → App runs in demo mode with helpful messages

### 2. Unified API Service

All AI functionality goes through a single `AIService` class (`src/services/aiService.ts`) that:
- Handles both OpenAI and Anthropic APIs
- Provides a consistent interface
- Automatically formats requests for each provider
- Handles errors gracefully

### 3. Features Using AI

#### Chat Assistant (`src/services/chatService.ts`)
- **What it does**: Powers the conversational chat interface
- **Uses**: General chat completion
- **Context**: Family profiles, current meal plan, knowledge base

#### Meal Planning (`src/services/aiMealPlanning.ts`)
- **What it does**: Generates personalized weekly meal plans
- **Uses**: Structured JSON generation
- **Features**: 
  - Blood type compatibility
  - Multi-person planning
  - Cultural preferences
  - Time constraints
  - Budget considerations

#### Label Analysis (`src/services/labelAnalysis.ts`)
- **What it does**: Enhances supplement/medication label analysis
- **Uses**: Text analysis and recommendations
- **Features**:
  - Ingredient analysis
  - Safety recommendations
  - Blood type conflict detection

## Code Structure

```
src/services/
├── aiService.ts          # Core AI service (handles both providers)
├── chatService.ts        # Chat assistant integration
├── aiMealPlanning.ts     # AI-powered meal plan generation
└── labelAnalysis.ts      # Enhanced label analysis (uses AI for recommendations)
```

## API Usage Examples

### Basic Chat

```typescript
import { getAIService } from './services/aiService';

const aiService = getAIService();
if (aiService) {
  const response = await aiService.chat([
    { role: 'system', content: 'You are a helpful assistant' },
    { role: 'user', content: 'Hello!' }
  ]);
}
```

### Structured JSON Generation

```typescript
const mealPlan = await aiService.generateJSON<MealPlan>(
  'Generate a meal plan for...',
  mealPlanSchema,
  { temperature: 0.8 }
);
```

## Configuration

### Environment Variables

Create a `.env` file in the project root:

```bash
# Option 1: OpenAI
VITE_OPENAI_API_KEY=sk-your-key-here

# Option 2: Anthropic (preferred if both are set)
VITE_ANTHROPIC_API_KEY=sk-ant-your-key-here
```

**Important**: 
- Variable names must start with `VITE_` for Vite to expose them
- Never commit `.env` files to version control
- Restart dev server after adding/changing keys

## Error Handling

The app gracefully handles:
- Missing API keys (demo mode)
- API errors (fallback to basic functionality)
- Rate limits (user-friendly error messages)
- Network issues (retry logic)

## Cost Considerations

### OpenAI
- **GPT-4 Turbo**: ~$0.01-0.03 per 1K tokens
- **GPT-3.5 Turbo**: ~$0.0005-0.002 per 1K tokens
- Typical meal plan: ~2000-4000 tokens

### Anthropic
- **Claude 3.5 Sonnet**: ~$0.003-0.015 per 1K tokens
- Typical meal plan: ~2000-4000 tokens

**Tip**: Start with Anthropic for better cost efficiency, or use OpenAI's GPT-3.5 for lower costs.

## Testing

1. **Without API Key**: App runs in demo mode
2. **With API Key**: Full functionality enabled
3. **Test Chat**: Type "Hello" in chat panel
4. **Test Meal Planning**: Generate a weekly plan
5. **Test Label Analysis**: Upload a supplement label image

## Troubleshooting

### "No API key found"
- Check `.env` file exists in project root
- Verify variable name is correct (`VITE_OPENAI_API_KEY` or `VITE_ANTHROPIC_API_KEY`)
- Restart development server

### API Errors
- Check API key is valid
- Verify you have API credits/quota
- Check network connection
- Review console for detailed error messages

### Rate Limits
- Wait a few minutes between requests
- Consider upgrading API tier
- Reduce request frequency

## Next Steps

1. **Get API Key**: Follow [API_SETUP.md](./API_SETUP.md)
2. **Add to .env**: Create `.env` file with your key
3. **Restart Server**: `npm run dev`
4. **Test**: Try the chat or generate a meal plan

## Support

- See [API_SETUP.md](./API_SETUP.md) for detailed setup
- Check provider documentation:
  - [OpenAI Docs](https://platform.openai.com/docs)
  - [Anthropic Docs](https://docs.anthropic.com/)

