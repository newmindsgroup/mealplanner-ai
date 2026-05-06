/**
 * Chat Type System — Multi-format, session-aware, data-routing chat types
 * Supports attachments, structured data extraction, interactive actions, and session management.
 */

import type { AITaskType } from '../services/aiService';

// ─── Attachment Types ───────────────────────────────────────────────────────────

export type AttachmentType = 'image' | 'pdf' | 'csv' | 'audio' | 'video' | 'url' | 'text' | 'document';

export interface ChatAttachment {
  id: string;
  type: AttachmentType;
  name: string;
  url: string;           // data URL, blob URL, or remote URL
  mimeType: string;
  size: number;           // bytes
  thumbnail?: string;     // base64 preview for images/PDFs
  status: 'pending' | 'uploading' | 'processing' | 'ready' | 'error';
  progress?: number;      // 0-100 upload/processing progress
  error?: string;
  extractedText?: string; // OCR or parsed text content
  metadata?: Record<string, unknown>;
}

// ─── Input Format Tracking ──────────────────────────────────────────────────────

export type InputFormat = 'text' | 'voice' | 'image' | 'file' | 'url' | 'clipboard' | 'drag-drop';

// ─── Data Extraction Types ──────────────────────────────────────────────────────

export type ExtractedDataType =
  | 'lab_result'
  | 'food_label'
  | 'supplement_label'
  | 'recipe'
  | 'profile_info'
  | 'allergy'
  | 'body_measurement'
  | 'grocery_receipt'
  | 'meal_photo'
  | 'blood_work'
  | 'doctor_notes'
  | 'fitness_goal'
  | 'article_summary'
  | 'pantry_item';

export type DataDestination =
  | 'labReports'
  | 'labelAnalyses'
  | 'pantryItems'
  | 'favoriteMeals'
  | 'people'
  | 'knowledgeBase'
  | 'groceryLists'
  | 'fitness';

export interface ExtractedDataPayload {
  id: string;
  type: ExtractedDataType;
  destination: DataDestination;
  destinationLabel: string;       // Human-readable: "Labs Dashboard", "Pantry"
  data: Record<string, unknown>;  // The actual extracted structured data
  confidence: number;             // 0-100
  summary: string;                // One-line human summary: "Found 12 lab results from Quest"
  status: 'pending' | 'confirmed' | 'edited' | 'dismissed';
  createdAt: string;
  confirmedAt?: string;
}

// ─── Interactive Actions ────────────────────────────────────────────────────────

export type ChatActionType =
  | 'confirm_extraction'    // Confirm extracted data to be saved
  | 'edit_extraction'       // Edit before saving
  | 'dismiss_extraction'    // Reject extracted data
  | 'navigate'              // Navigate to a page/section
  | 'quick_reply'           // Pre-filled reply button
  | 'retry'                 // Retry a failed request
  | 'view_details'          // Expand to see more
  | 'add_to_plan'           // Add a meal to plan
  | 'add_to_grocery'        // Add items to grocery list
  | 'scan_label'            // Open label scanner
  | 'scan_lab'              // Open lab scanner
  | 'fill_profile';         // Autofill profile fields

export interface ChatAction {
  id: string;
  type: ChatActionType;
  label: string;
  icon?: string;              // Lucide icon name
  variant: 'primary' | 'secondary' | 'danger' | 'ghost';
  payload?: Record<string, unknown>;
  disabled?: boolean;
}

// ─── Enhanced Chat Message ──────────────────────────────────────────────────────

export interface EnhancedChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  sessionId: string;

  // Multi-format support
  attachments?: ChatAttachment[];
  inputFormat?: InputFormat;

  // AI-extracted structured data
  extractedData?: ExtractedDataPayload[];

  // Interactive action buttons
  actions?: ChatAction[];

  // Processing metadata
  metadata?: {
    model?: string;
    provider?: string;
    taskType?: AITaskType;
    processingTimeMs?: number;
    tokensUsed?: number;
    isStreaming?: boolean;
    retryCount?: number;
  };

  // For retry functionality
  originalInput?: string;

  // Status
  status?: 'sending' | 'streaming' | 'complete' | 'error';
  error?: string;
}

// ─── Chat Session ───────────────────────────────────────────────────────────────

export interface SessionContext {
  mentionedMembers: string[];     // Person IDs discussed in this session
  extractedDataIds: string[];     // IDs of data items created from this session
  referencedKBFiles: string[];    // Knowledge base files referenced
  topicsDiscussed: string[];      // AI-classified topics: "labs", "meal-plan", "fitness"
}

export interface ChatSession {
  id: string;
  title: string;                  // AI-generated from first message
  createdAt: string;
  updatedAt: string;
  messages: EnhancedChatMessage[];
  context: SessionContext;
  tags: string[];                 // Auto-tagged topics
  pinned: boolean;
  archived: boolean;
}

// ─── Chat State ─────────────────────────────────────────────────────────────────

export interface ChatState {
  sessions: ChatSession[];
  activeSessionId: string | null;

  // Session management
  createSession: (title?: string) => string; // Returns session ID
  switchSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;
  archiveSession: (sessionId: string) => void;
  pinSession: (sessionId: string) => void;
  renameSession: (sessionId: string, title: string) => void;

  // Message management
  addMessage: (sessionId: string, message: EnhancedChatMessage) => void;
  updateMessage: (sessionId: string, messageId: string, updates: Partial<EnhancedChatMessage>) => void;
  removeMessage: (sessionId: string, messageId: string) => void;

  // Data extraction actions
  confirmExtraction: (sessionId: string, messageId: string, extractionId: string) => void;
  dismissExtraction: (sessionId: string, messageId: string, extractionId: string) => void;

  // Search
  searchMessages: (query: string) => EnhancedChatMessage[];

  // Getters
  getActiveSession: () => ChatSession | null;
  getSessionMessages: (sessionId: string) => EnhancedChatMessage[];
  getRecentSessions: (limit?: number) => ChatSession[];
}

// ─── Utility Types ──────────────────────────────────────────────────────────────

/** Accepted file types for chat uploads */
export const ACCEPTED_FILE_TYPES: Record<string, string[]> = {
  'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.heif'],
  'application/pdf': ['.pdf'],
  'text/plain': ['.txt'],
  'text/markdown': ['.md'],
  'text/csv': ['.csv'],
  'audio/*': ['.mp3', '.wav', '.m4a', '.ogg', '.webm'],
};

/** Maximum file sizes by type (in bytes) */
export const MAX_FILE_SIZES: Record<AttachmentType, number> = {
  image: 10 * 1024 * 1024,     // 10MB
  pdf: 25 * 1024 * 1024,       // 25MB
  csv: 10 * 1024 * 1024,       // 10MB
  audio: 25 * 1024 * 1024,     // 25MB
  video: 50 * 1024 * 1024,     // 50MB
  url: 0,                       // N/A
  text: 5 * 1024 * 1024,       // 5MB
  document: 25 * 1024 * 1024,  // 25MB
};

/** Map MIME types to our AttachmentType */
export function getAttachmentType(mimeType: string): AttachmentType {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType === 'text/csv') return 'csv';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('text/')) return 'text';
  return 'document';
}

/** Format file size for display */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/** Validate a file for chat upload */
export function validateChatFile(file: File): { valid: boolean; error?: string } {
  const type = getAttachmentType(file.type);
  const maxSize = MAX_FILE_SIZES[type];

  if (maxSize > 0 && file.size > maxSize) {
    return {
      valid: false,
      error: `File too large. Maximum size for ${type} files is ${formatFileSize(maxSize)}.`,
    };
  }

  // Check if file type is in accepted types
  const acceptedExtensions = Object.values(ACCEPTED_FILE_TYPES).flat();
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
  
  if (!acceptedExtensions.includes(fileExtension) && !file.type.match(/^(image|audio|video|text)\//)) {
    return {
      valid: false,
      error: `Unsupported file type. Accepted: images, PDFs, text files, CSVs, and audio files.`,
    };
  }

  return { valid: true };
}
