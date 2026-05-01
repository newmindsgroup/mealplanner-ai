// AI Service - OpenAI and Anthropic Integration
const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');

const config = require('../config/config');
const { queryOne } = require('../config/database');
const { decrypt } = require('../utils/encryption');

/**
 * Get AI API keys for a user
 * Returns user's keys if available, otherwise system defaults
 */
async function getAIKeys(userId = null) {
  const keys = {
    openai: config.ai.openaiKey,
    anthropic: config.ai.anthropicKey,
  };

  if (userId) {
    // Try to get user's keys
    const userKeys = await queryOne(
      'SELECT provider, encrypted_key, encryption_iv FROM api_keys WHERE user_id = ? AND is_active = TRUE',
      [userId]
    );

    if (userKeys) {
      try {
        const decrypted = decrypt(userKeys.encrypted_key, userKeys.encryption_iv);
        keys[userKeys.provider] = decrypted;
      } catch (error) {
        console.error('Error decrypting user API key:', error);
      }
    }
  }

  return keys;
}

/**
 * Get preferred AI provider
 */
function getPreferredProvider(keys) {
  // Prefer Anthropic if available
  if (keys.anthropic) return 'anthropic';
  if (keys.openai) return 'openai';
  return null;
}

/**
 * Chat completion with automatic provider selection
 */
async function chat(messages, options = {}, userId = null) {
  const keys = await getAIKeys(userId);
  const provider = options.provider || getPreferredProvider(keys);

  if (!provider) {
    throw new Error('No AI API keys configured');
  }

  if (provider === 'anthropic' && keys.anthropic) {
    return chatAnthropic(messages, options, keys.anthropic);
  } else if (provider === 'openai' && keys.openai) {
    return chatOpenAI(messages, options, keys.openai);
  } else {
    throw new Error(`${provider} API key not available`);
  }
}

/**
 * Chat with OpenAI
 */
async function chatOpenAI(messages, options = {}, apiKey) {
  const openai = new OpenAI({ apiKey });

  const response = await openai.chat.completions.create({
    model: options.model || 'gpt-4-turbo-preview',
    messages: messages.map(m => ({
      role: m.role,
      content: m.content,
    })),
    temperature: options.temperature !== undefined ? options.temperature : 0.7,
    max_tokens: options.maxTokens || 2000,
    response_format: options.json ? { type: 'json_object' } : undefined,
  });

  return response.choices[0].message.content;
}

/**
 * Chat with Anthropic Claude
 */
async function chatAnthropic(messages, options = {}, apiKey) {
  const anthropic = new Anthropic({ apiKey });

  // Separate system messages from user/assistant messages
  const systemMessages = messages.filter(m => m.role === 'system');
  const conversationMessages = messages.filter(m => m.role !== 'system');

  const systemPrompt = systemMessages.map(m => m.content).join('\n\n');

  const response = await anthropic.messages.create({
    model: options.model || 'claude-3-5-sonnet-20241022',
    max_tokens: options.maxTokens || 2000,
    temperature: options.temperature !== undefined ? options.temperature : 0.7,
    system: systemPrompt || undefined,
    messages: conversationMessages.map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content,
    })),
  });

  return response.content[0].text;
}

/**
 * Generate structured JSON response
 */
async function generateJSON(prompt, schema, userId = null) {
  const systemPrompt = `You are a helpful assistant that responds with valid JSON. ${schema ? `Follow this schema: ${JSON.stringify(schema)}` : ''}`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: prompt },
  ];

  const response = await chat(messages, { temperature: 0.3, json: true }, userId);

  // Clean JSON response (remove markdown code blocks if present)
  let jsonString = response.trim();
  if (jsonString.startsWith('```json')) {
    jsonString = jsonString.replace(/^```json\n?/, '').replace(/\n?```$/, '');
  } else if (jsonString.startsWith('```')) {
    jsonString = jsonString.replace(/^```\n?/, '').replace(/\n?```$/, '');
  }

  return JSON.parse(jsonString);
}

/**
 * Generate meal plan
 */
async function generateMealPlan(people, preferences, userId = null) {
  const peopleDescriptions = people.map(p =>
    `${p.name} (Blood Type: ${p.bloodType || 'Unknown'}, Age: ${p.age || 'N/A'}, Allergies: ${(p.allergies || []).join(', ') || 'None'})`
  ).join('\n');

  const prompt = `Generate a 7-day meal plan for the following people:

${peopleDescriptions}

Preferences:
${JSON.stringify(preferences, null, 2)}

Requirements:
- Provide breakfast, lunch, dinner, and snack for each day
- Consider blood type compatibility
- Respect all allergies and dietary restrictions
- Include meal names, brief descriptions, and key ingredients
- Provide a rationale for each day's meal choices

Return a JSON object with this structure:
{
  "Monday": {
    "breakfast": {"name": "...", "description": "...", "ingredients": [...]},
    "lunch": {"name": "...", "description": "...", "ingredients": [...]},
    "dinner": {"name": "...", "description": "...", "ingredients": [...]},
    "snack": {"name": "...", "description": "...", "ingredients": [...]},
    "rationale": "..."
  },
  ...repeat for all 7 days...
}`;

  return generateJSON(prompt, null, userId);
}

/**
 * Analyze food label
 */
async function analyzeFoodLabel(ocrText, bloodTypes, userId = null) {
  const prompt = `Analyze this food label text for the following blood types: ${bloodTypes.join(', ')}

Label text:
${ocrText}

Provide:
1. List of ingredients
2. Any blood type conflicts or concerns
3. Additives or preservatives to note
4. Overall safety recommendation

Return JSON with: { ingredients: [], conflicts: [], additives: [], recommendation: "", safetyLevel: "safe|caution|avoid" }`;

  return generateJSON(prompt, null, userId);
}

/**
 * Get conversational chat response
 */
async function getChatResponse(userMessage, context = {}, userId = null) {
  const systemPrompt = `You are a helpful meal planning and nutrition assistant. You help users plan meals, understand nutrition, and make healthy food choices.
  
${context.people ? `Family members: ${context.people.map(p => p.name).join(', ')}` : ''}
${context.currentPlan ? 'User has an active meal plan.' : ''}

Be friendly, helpful, and provide actionable advice.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...(context.chatHistory || []),
    { role: 'user', content: userMessage },
  ];

  return chat(messages, {}, userId);
}

module.exports = {
  chat,
  generateJSON,
  generateMealPlan,
  analyzeFoodLabel,
  getChatResponse,
  getAIKeys,
};

