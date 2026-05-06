/**
 * Chat Session Store — Multi-session CRUD with search, history, and context tracking.
 * Separate Zustand slice from the main store to keep concerns isolated.
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ChatSession, EnhancedChatMessage, SessionContext } from '../types/chat';

interface ChatSessionState {
  sessions: ChatSession[];
  activeSessionId: string | null;

  // Session CRUD
  createSession: (title?: string) => string;
  switchSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;
  archiveSession: (sessionId: string) => void;
  pinSession: (sessionId: string) => void;
  renameSession: (sessionId: string, title: string) => void;

  // Message management
  addMessage: (sessionId: string, message: EnhancedChatMessage) => void;
  updateMessage: (sessionId: string, messageId: string, updates: Partial<EnhancedChatMessage>) => void;
  removeMessage: (sessionId: string, messageId: string) => void;

  // Bulk updates (for extraction status, loading removal, etc.)
  updateSessionMessages: (sessionId: string, updater: (msgs: EnhancedChatMessage[]) => EnhancedChatMessage[]) => void;

  // Getters
  getActiveSession: () => ChatSession | null;
  getSessionMessages: (sessionId: string) => EnhancedChatMessage[];
  getRecentSessions: (limit?: number) => ChatSession[];
  searchMessages: (query: string) => Array<{ session: ChatSession; message: EnhancedChatMessage }>;

  // Ensure a session exists (lazy-create)
  ensureActiveSession: () => string;
}

function createEmptyContext(): SessionContext {
  return {
    mentionedMembers: [],
    extractedDataIds: [],
    referencedKBFiles: [],
    topicsDiscussed: [],
  };
}

function generateSessionTitle(message?: string): string {
  if (!message) return `Chat ${new Date().toLocaleDateString()}`;
  // Use first 40 chars of the message as title
  const clean = message.replace(/[\n\r]+/g, ' ').trim();
  return clean.length > 40 ? clean.substring(0, 40) + '…' : clean;
}

export const useChatSessionStore = create<ChatSessionState>()(
  persist(
    (set, get) => ({
      sessions: [],
      activeSessionId: null,

      // ── Session CRUD ────────────────────────────────────────────────────

      createSession: (title?: string) => {
        const id = crypto.randomUUID();
        const now = new Date().toISOString();
        const session: ChatSession = {
          id,
          title: title || `Chat ${new Date().toLocaleDateString()}`,
          createdAt: now,
          updatedAt: now,
          messages: [],
          context: createEmptyContext(),
          tags: [],
          pinned: false,
          archived: false,
        };
        set((state) => ({
          sessions: [session, ...state.sessions],
          activeSessionId: id,
        }));
        return id;
      },

      switchSession: (sessionId) => {
        const session = get().sessions.find((s) => s.id === sessionId);
        if (session) set({ activeSessionId: sessionId });
      },

      deleteSession: (sessionId) => {
        set((state) => {
          const filtered = state.sessions.filter((s) => s.id !== sessionId);
          const newActive = state.activeSessionId === sessionId
            ? filtered.find((s) => !s.archived)?.id || null
            : state.activeSessionId;
          return { sessions: filtered, activeSessionId: newActive };
        });
      },

      archiveSession: (sessionId) => {
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId ? { ...s, archived: !s.archived, updatedAt: new Date().toISOString() } : s
          ),
        }));
      },

      pinSession: (sessionId) => {
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId ? { ...s, pinned: !s.pinned, updatedAt: new Date().toISOString() } : s
          ),
        }));
      },

      renameSession: (sessionId, title) => {
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId ? { ...s, title, updatedAt: new Date().toISOString() } : s
          ),
        }));
      },

      // ── Message Management ──────────────────────────────────────────────

      addMessage: (sessionId, message) => {
        set((state) => ({
          sessions: state.sessions.map((s) => {
            if (s.id !== sessionId) return s;
            // Auto-title from first user message
            const isFirst = s.messages.length === 0 && message.role === 'user';
            return {
              ...s,
              messages: [...s.messages, message],
              updatedAt: new Date().toISOString(),
              ...(isFirst ? { title: generateSessionTitle(message.content) } : {}),
            };
          }),
        }));
      },

      updateMessage: (sessionId, messageId, updates) => {
        set((state) => ({
          sessions: state.sessions.map((s) => {
            if (s.id !== sessionId) return s;
            return {
              ...s,
              messages: s.messages.map((m) =>
                m.id === messageId ? { ...m, ...updates } : m
              ),
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },

      removeMessage: (sessionId, messageId) => {
        set((state) => ({
          sessions: state.sessions.map((s) => {
            if (s.id !== sessionId) return s;
            return {
              ...s,
              messages: s.messages.filter((m) => m.id !== messageId),
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },

      updateSessionMessages: (sessionId, updater) => {
        set((state) => ({
          sessions: state.sessions.map((s) => {
            if (s.id !== sessionId) return s;
            return {
              ...s,
              messages: updater(s.messages),
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },

      // ── Getters ─────────────────────────────────────────────────────────

      getActiveSession: () => {
        const { sessions, activeSessionId } = get();
        return sessions.find((s) => s.id === activeSessionId) || null;
      },

      getSessionMessages: (sessionId) => {
        const session = get().sessions.find((s) => s.id === sessionId);
        return session?.messages || [];
      },

      getRecentSessions: (limit = 20) => {
        return get()
          .sessions
          .filter((s) => !s.archived)
          .sort((a, b) => {
            // Pinned first, then by updatedAt
            if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
          })
          .slice(0, limit);
      },

      searchMessages: (query) => {
        const lower = query.toLowerCase();
        const results: Array<{ session: ChatSession; message: EnhancedChatMessage }> = [];
        for (const session of get().sessions) {
          for (const message of session.messages) {
            if (message.content.toLowerCase().includes(lower)) {
              results.push({ session, message });
            }
          }
        }
        return results.slice(0, 50); // Cap results
      },

      // ── Lazy Session Creator ────────────────────────────────────────────

      ensureActiveSession: () => {
        const { activeSessionId, sessions, createSession } = get();
        if (activeSessionId && sessions.find((s) => s.id === activeSessionId)) {
          return activeSessionId;
        }
        return createSession();
      },
    }),
    {
      name: 'chat-sessions-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        sessions: state.sessions.map((s) => ({
          ...s,
          // Limit persisted messages per session to prevent localStorage bloat
          messages: s.messages.slice(-100),
        })),
        activeSessionId: state.activeSessionId,
      }),
    }
  )
);
