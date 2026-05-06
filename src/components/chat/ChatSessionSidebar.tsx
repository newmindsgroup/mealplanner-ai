/**
 * ChatSessionSidebar — Session list with search, create, pin/archive, and delete.
 */
import { useState, useMemo } from 'react';
import {
  Plus, Search, Pin, Archive, Trash2, MessageSquare,
  MoreHorizontal, X, PinOff, ArchiveRestore, Clock,
} from 'lucide-react';
import { useChatSessionStore } from '../../store/useChatSessionStore';
import type { ChatSession } from '../../types/chat';

interface ChatSessionSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSessionSelect?: (sessionId: string) => void;
}

export default function ChatSessionSidebar({ isOpen, onClose, onSessionSelect }: ChatSessionSidebarProps) {
  const {
    sessions, activeSessionId,
    createSession, switchSession, deleteSession,
    archiveSession, pinSession, renameSession,
  } = useChatSessionStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  // Filter and sort sessions
  const filteredSessions = useMemo(() => {
    let result = sessions.filter((s) => (showArchived ? s.archived : !s.archived));
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((s) =>
        s.title.toLowerCase().includes(q) ||
        s.messages.some((m) => m.content.toLowerCase().includes(q))
      );
    }
    return result.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [sessions, searchQuery, showArchived]);

  const handleNewChat = () => {
    const id = createSession();
    onSessionSelect?.(id);
  };

  const handleSelect = (id: string) => {
    switchSession(id);
    onSessionSelect?.(id);
  };

  const handleStartRename = (session: ChatSession) => {
    setEditingId(session.id);
    setEditTitle(session.title);
    setMenuOpenId(null);
  };

  const handleFinishRename = () => {
    if (editingId && editTitle.trim()) {
      renameSession(editingId, editTitle.trim());
    }
    setEditingId(null);
    setEditTitle('');
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this chat session? This cannot be undone.')) {
      deleteSession(id);
    }
    setMenuOpenId(null);
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60_000) return 'Just now';
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
    if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
    if (diff < 604_800_000) return d.toLocaleDateString(undefined, { weekday: 'short' });
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  if (!isOpen) return null;

  return (
    <div className="w-72 h-full flex flex-col bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 animate-slide-in-left">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Chat History</h3>
        <div className="flex items-center gap-1">
          <button onClick={handleNewChat}
            className="p-1.5 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
            aria-label="New chat">
            <Plus className="w-4 h-4" />
          </button>
          <button onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-500 transition-colors"
            aria-label="Close sidebar">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 py-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text" value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search chats..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white placeholder-gray-400"
          />
        </div>
      </div>

      {/* Archive toggle */}
      <div className="px-3 pb-1">
        <button onClick={() => setShowArchived(!showArchived)}
          className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg transition-colors ${
            showArchived
              ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400'
              : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}>
          {showArchived ? <ArchiveRestore className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
          {showArchived ? 'Showing Archived' : 'Show Archived'}
        </button>
      </div>

      {/* Session list */}
      <div className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5 scrollbar-thin">
        {filteredSessions.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-xs">
            {searchQuery ? 'No matching chats' : showArchived ? 'No archived chats' : 'No chats yet. Start one!'}
          </div>
        ) : (
          filteredSessions.map((session) => (
            <div key={session.id}
              className={`group relative rounded-xl transition-all duration-150 ${
                session.id === activeSessionId
                  ? 'bg-primary-50 dark:bg-primary-950/30 border border-primary-200 dark:border-primary-800'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800/50 border border-transparent'
              }`}>
              <button onClick={() => handleSelect(session.id)}
                className="w-full text-left px-3 py-2.5 flex items-start gap-2.5">
                <MessageSquare className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                  session.id === activeSessionId ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'
                }`} />
                <div className="flex-1 min-w-0">
                  {editingId === session.id ? (
                    <input type="text" value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onBlur={handleFinishRename}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleFinishRename(); if (e.key === 'Escape') setEditingId(null); }}
                      autoFocus
                      className="w-full text-xs font-semibold bg-transparent border-b border-primary-500 focus:outline-none text-gray-900 dark:text-white pb-0.5"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <p className={`text-xs font-semibold truncate ${
                      session.id === activeSessionId ? 'text-primary-700 dark:text-primary-300' : 'text-gray-800 dark:text-gray-200'
                    }`}>
                      {session.pinned && <Pin className="w-3 h-3 inline mr-1 text-amber-500" />}
                      {session.title}
                    </p>
                  )}
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-[10px] text-gray-400">{formatDate(session.updatedAt)}</span>
                    <span className="text-[10px] text-gray-400">• {session.messages.length} msg{session.messages.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </button>

              {/* Context menu trigger */}
              <button
                onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === session.id ? null : session.id); }}
                className="absolute right-2 top-2.5 p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 transition-all"
                aria-label="Session options">
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>

              {/* Context menu */}
              {menuOpenId === session.id && (
                <div className="absolute right-2 top-9 z-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl py-1 w-36 animate-fade-in">
                  <button onClick={() => handleStartRename(session)}
                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
                    Rename
                  </button>
                  <button onClick={() => { pinSession(session.id); setMenuOpenId(null); }}
                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    {session.pinned ? <><PinOff className="w-3 h-3" /> Unpin</> : <><Pin className="w-3 h-3" /> Pin</>}
                  </button>
                  <button onClick={() => { archiveSession(session.id); setMenuOpenId(null); }}
                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    {session.archived ? <><ArchiveRestore className="w-3 h-3" /> Unarchive</> : <><Archive className="w-3 h-3" /> Archive</>}
                  </button>
                  <hr className="my-1 border-gray-200 dark:border-gray-700" />
                  <button onClick={() => handleDelete(session.id)}
                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center gap-2">
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer stats */}
      <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-800 text-[10px] text-gray-400">
        {sessions.filter((s) => !s.archived).length} chat{sessions.filter((s) => !s.archived).length !== 1 ? 's' : ''}
        {sessions.filter((s) => s.archived).length > 0 && ` • ${sessions.filter((s) => s.archived).length} archived`}
      </div>
    </div>
  );
}
