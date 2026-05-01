/**
 * Knowledge Base Service - Enhanced AI integration
 * Handles chunking, searching, and context retrieval from knowledge base
 */

import type { KnowledgeBaseFile } from '../types';
import { getAIService } from './aiService';

// Chunk size for large documents (tokens)
const CHUNK_SIZE = 2000;
const MAX_CHUNKS_PER_QUERY = 5;

export interface KnowledgeChunk {
  id: string;
  fileId: string;
  fileName: string;
  content: string;
  chunkIndex: number;
  keywords: string[];
}

/**
 * Chunk large documents for better AI processing
 */
export function chunkDocument(content: string, fileName: string, fileId: string): KnowledgeChunk[] {
  const chunks: KnowledgeChunk[] = [];
  
  // Split by paragraphs first
  const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  
  let currentChunk = '';
  let chunkIndex = 0;
  
  for (const paragraph of paragraphs) {
    // If adding this paragraph would exceed chunk size, save current chunk
    if (currentChunk.length + paragraph.length > CHUNK_SIZE && currentChunk.length > 0) {
      chunks.push({
        id: `${fileId}-chunk-${chunkIndex}`,
        fileId,
        fileName,
        content: currentChunk.trim(),
        chunkIndex: chunkIndex++,
        keywords: extractKeywords(currentChunk),
      });
      currentChunk = paragraph;
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
    }
  }
  
  // Add remaining content
  if (currentChunk.trim().length > 0) {
    chunks.push({
      id: `${fileId}-chunk-${chunkIndex}`,
      fileId,
      fileName,
      content: currentChunk.trim(),
      chunkIndex: chunkIndex,
      keywords: extractKeywords(currentChunk),
    });
  }
  
  return chunks;
}

/**
 * Extract keywords from text (simple implementation)
 */
function extractKeywords(text: string): string[] {
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 4); // Only words longer than 4 characters
  
  // Count frequency
  const frequency: Record<string, number> = {};
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1;
  });
  
  // Get top keywords
  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
}

/**
 * Search knowledge base for relevant content
 */
export async function searchKnowledgeBase(
  query: string,
  knowledgeBase: KnowledgeBaseFile[]
): Promise<KnowledgeChunk[]> {
  if (knowledgeBase.length === 0) return [];
  
  // Create chunks from all knowledge base files
  const allChunks: KnowledgeChunk[] = [];
  
  knowledgeBase.forEach(file => {
    if (file.content && file.content.length > 100) {
      const chunks = chunkDocument(file.content, file.name, file.id);
      allChunks.push(...chunks);
    }
  });
  
  if (allChunks.length === 0) return [];
  
  // Simple keyword matching (can be enhanced with semantic search)
  const queryWords = query.toLowerCase().split(/\s+/);
  
  const scoredChunks = allChunks.map(chunk => {
    const content = chunk.content.toLowerCase();
    const keywords = chunk.keywords.map(k => k.toLowerCase());
    
    // Score based on keyword matches
    let score = 0;
    queryWords.forEach(word => {
      if (content.includes(word)) score += 2;
      if (keywords.includes(word)) score += 3;
    });
    
    // Boost score if query words appear in filename
    const fileName = chunk.fileName.toLowerCase();
    queryWords.forEach(word => {
      if (fileName.includes(word)) score += 1;
    });
    
    return { chunk, score };
  });
  
  // Sort by score and return top chunks
  return scoredChunks
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_CHUNKS_PER_QUERY)
    .map(item => item.chunk);
}

/**
 * Get relevant knowledge base context for AI
 */
export async function getKnowledgeContext(
  query: string,
  knowledgeBase: KnowledgeBaseFile[]
): Promise<string> {
  const relevantChunks = await searchKnowledgeBase(query, knowledgeBase);
  
  if (relevantChunks.length === 0) {
    return '';
  }
  
  // Format chunks for AI context
  const contextParts = relevantChunks.map((chunk, index) => {
    return `[Source: ${chunk.fileName}, Section ${chunk.chunkIndex + 1}]\n${chunk.content.substring(0, 1000)}...`;
  });
  
  return `\n\nRelevant Knowledge Base Information:\n${contextParts.join('\n\n---\n\n')}`;
}

/**
 * Enhanced AI chat with knowledge base integration
 */
export async function chatWithKnowledgeBase(
  query: string,
  knowledgeBase: KnowledgeBaseFile[],
  additionalContext?: string
): Promise<string> {
  const aiService = getAIService();
  
  if (!aiService) {
    return 'AI service not available. Please configure your API key.';
  }
  
  // Get relevant knowledge base context
  const kbContext = await getKnowledgeContext(query, knowledgeBase);
  
  const systemPrompt = `You are Meal Plan Assistant, an expert nutritionist specializing in blood type diets, metabolic balance, and personalized nutrition.

You have access to a knowledge base of nutrition books, research, and dietary guidelines. Use this information to provide accurate, evidence-based answers.

When referencing knowledge base content, cite the source when possible.

Always:
- Provide evidence-based recommendations
- Reference specific information from the knowledge base when relevant
- Explain the reasoning behind your suggestions
- Consider blood type compatibility
- Be clear and actionable`;

  const userMessage = query + (kbContext ? kbContext : '') + (additionalContext ? '\n\n' + additionalContext : '');
  
  try {
    const response = await aiService.chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ], {
      temperature: 0.7,
      maxTokens: 2000,
    });
    
    return response;
  } catch (error) {
    console.error('Knowledge base chat error:', error);
    throw error;
  }
}

