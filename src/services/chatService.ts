import { getAIService, AIError, AIErrorType } from './aiService';
import { chatWithKnowledgeBase, getKnowledgeContext } from './knowledgeBaseService';
import type { Person, WeeklyPlan, KnowledgeBaseFile } from '../types';

const SYSTEM_PROMPT = `You are Meal Plan Assistant, an expert nutritionist and meal planning AI that specializes in blood type diets, metabolic balance, and personalized nutrition.

Your capabilities include:
- Creating weekly meal plans based on blood type compatibility
- Analyzing supplement and medication labels for blood type conflicts
- Providing nutritional guidance and meal modifications
- Answering questions about food compatibility, recipes, and nutrition
- Offering time-saving meal suggestions
- Cultural and seasonal meal adaptations

Always:
- Provide clear, actionable advice
- Reference blood type compatibility when relevant
- Consider multiple family members' needs when planning
- Suggest alternatives for allergies and dietary restrictions
- Explain the "why" behind recommendations
- Be supportive and encouraging

When asked about meal planning, always consider:
- Blood type compatibility
- Allergies and dietary restrictions
- Cultural preferences
- Time constraints
- Budget considerations
- Family size and composition`;

// Helpful offline tips when API is unavailable
const OFFLINE_TIPS = {
  'meal planning': `Here are some general meal planning tips while I'm offline:

• Plan your meals for the week on Sunday to save time
• Batch cook proteins and grains on weekends
• Keep a well-stocked pantry with basics (rice, pasta, canned beans)
• Use the "plate method": 1/2 vegetables, 1/4 protein, 1/4 whole grains
• Prep vegetables in advance for quick weeknight cooking
• Consider blood type compatibility when selecting proteins

For personalized AI assistance, please configure your API key. Check the settings for more information.`,

  'blood type': `Blood type diet basics (while I'm offline):

Type O: Thrive on lean proteins (meat, fish), vegetables, fruits. Avoid grains and dairy.
Type A: Best with plant-based foods, soy proteins, grains, vegetables. Limit meat.
Type B: Can enjoy a varied diet including meats, dairy, grains, vegetables.
Type AB: Combines A and B characteristics - seafood, dairy, greens work well.

For detailed, personalized recommendations, please configure your API key.`,

  'grocery': `Smart grocery shopping tips:

• Shop the perimeter of the store for fresh foods
• Buy seasonal produce for best prices
• Check unit prices to compare value
• Stock up on sales for non-perishables
• Bring a list and stick to it
• Shop after eating to avoid impulse buys
• Consider frozen vegetables for convenience and cost

For AI-powered grocery list generation, please configure your API key.`,

  'supplement': `General supplement guidance (offline mode):

• Always check labels for allergens and blood type incompatible ingredients
• Take supplements with food unless directed otherwise for better absorption
• Store in cool, dry place away from sunlight to maintain potency
• Check expiration dates regularly as effectiveness diminishes over time
• Consider blood type compatibility - certain supplements work better with specific blood types based on digestive enzyme production and lectin sensitivity
• Fat-soluble vitamins (A, D, E, K) should be taken with healthy fats for optimal absorption
• Water-soluble vitamins (B, C) can be taken anytime and excess amounts are excreted

For detailed label analysis with blood type compatibility, please configure your API key in settings.`,
};

/**
 * Get a helpful response when offline based on query keywords
 */
function getOfflineResponse(query: string): string {
  const lowerQuery = query.toLowerCase();
  
  // Check for keywords
  if (lowerQuery.includes('meal') || lowerQuery.includes('plan') || lowerQuery.includes('recipe')) {
    return OFFLINE_TIPS['meal planning'];
  }
  
  if (lowerQuery.includes('blood') || lowerQuery.includes('type') || lowerQuery.includes('compatibility')) {
    return OFFLINE_TIPS['blood type'];
  }
  
  if (lowerQuery.includes('grocery') || lowerQuery.includes('shopping') || lowerQuery.includes('list')) {
    return OFFLINE_TIPS['grocery'];
  }
  
  if (lowerQuery.includes('supplement') || lowerQuery.includes('label') || lowerQuery.includes('vitamin')) {
    return OFFLINE_TIPS['supplement'];
  }
  
  // Default offline message
  return `I'm currently running in offline mode and can't provide personalized AI assistance right now.

**To enable full AI capabilities:**

1. Get an API key from either:
   - OpenAI: https://platform.openai.com/api-keys
   - Anthropic: https://console.anthropic.com/settings/keys

2. Configure it:
   - **Development:** Create a \`.env\` file in the project root with:
     \`VITE_OPENAI_API_KEY=your_key_here\`
     or
     \`VITE_ANTHROPIC_API_KEY=your_key_here\`
   
   - **Production:** Create a \`config.js\` file (see \`config.example.js\`)

Once configured, I'll be able to provide personalized meal planning assistance, analyze labels, and answer your nutrition questions!

**Quick tips while offline:**
• Check the Weekly Plan tab for meal planning tools
• Use Favorites to save your preferred meals
• Browse the Knowledge Base for nutrition information
• Add family members in Profile Setup for blood type tracking`;
}

/**
 * Format user-friendly error message based on error type
 */
function formatErrorMessage(error: AIError): string {
  switch (error.type) {
    case AIErrorType.QUOTA_EXCEEDED:
      return `⚠️ **API Quota Exceeded**

${error.userMessage}

**What you can do:**
1. Check your billing and add credits to your account
2. Wait for your monthly quota to reset
3. Configure an alternative API provider (OpenAI or Anthropic)

**Current status:** Using ${error.provider || 'unknown'} API`;

    case AIErrorType.AUTH_ERROR:
      return `🔑 **Authentication Issue**

${error.userMessage}

**How to fix:**
1. Verify your API key is correct
2. Check if the key has the necessary permissions
3. Regenerate your API key if needed

**Setup instructions:**
- OpenAI: https://platform.openai.com/api-keys
- Anthropic: https://console.anthropic.com/settings/keys`;

    case AIErrorType.RATE_LIMIT:
      return `⏱️ **Rate Limit Reached**

${error.userMessage}

I'll automatically retry your request. This usually resolves in a few seconds.`;

    case AIErrorType.NETWORK_ERROR:
      return `🌐 **Connection Issue**

${error.userMessage}

**Try these steps:**
1. Check your internet connection
2. Refresh the page
3. Try again in a moment

The issue is usually temporary.`;

    case AIErrorType.INVALID_REQUEST:
      return `❓ **Request Issue**

${error.userMessage}

**Suggestions:**
• Try asking your question differently
• Break complex questions into smaller parts
• Make sure your request is clear and specific`;

    case AIErrorType.UNKNOWN:
    default:
      return `⚠️ **Unexpected Error**

${error.userMessage}

**What to try:**
1. Refresh the page and try again
2. Simplify your request
3. Check the browser console for technical details

If the problem persists, the service may be experiencing temporary issues.`;
  }
}

export async function chatWithAssistant(
  userMessage: string,
  context?: {
    people?: Person[];
    currentPlan?: WeeklyPlan;
    knowledgeBase?: KnowledgeBaseFile[];
  }
): Promise<string> {
  const aiService = getAIService();

  // If no API service available, provide helpful offline response
  if (!aiService) {
    return getOfflineResponse(userMessage);
  }

  // Build context-aware prompt
  let contextInfo = '';
  if (context) {
    if (context.people && context.people.length > 0) {
      contextInfo += `\n\nFamily Members:\n${context.people
        .map(
          (p) =>
            `- ${p.name}: Blood Type ${p.bloodType}, Age ${p.age}, Allergies: ${p.allergies.join(', ') || 'None'}, Goals: ${p.goals.join(', ') || 'None'}, Dietary: ${p.dietaryCodes.join(', ') || 'None'}`
        )
        .join('\n')}`;
    }

    if (context.currentPlan) {
      contextInfo += `\n\nCurrent Weekly Plan: ${context.currentPlan.weekStart}`;
    }

    if (context.knowledgeBase && context.knowledgeBase.length > 0) {
      // Use enhanced knowledge base service for better context
      const kbContext = await getKnowledgeContext(userMessage, context.knowledgeBase);
      if (kbContext) {
        contextInfo += kbContext;
      }
    }
  }

  const fullPrompt = userMessage + contextInfo;

  try {
    // Use enhanced knowledge base chat if knowledge base is available
    if (context?.knowledgeBase && context.knowledgeBase.length > 0) {
      return await chatWithKnowledgeBase(userMessage, context.knowledgeBase, contextInfo);
    }

    // Fallback to regular chat
    const response = await aiService.chat([
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: fullPrompt },
    ]);

    return response;
  } catch (error) {
    console.error('Chat error:', error);
    
    // Handle AIError with user-friendly messages
    if (error instanceof AIError) {
      return formatErrorMessage(error);
    }
    
    // Handle unknown errors
    return `⚠️ **Unexpected Error**

I encountered an unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}

**What to try:**
1. Refresh the page and try again
2. Check your internet connection
3. Verify your API key configuration

If the problem persists, please check the browser console for more details.`;
  }
}
