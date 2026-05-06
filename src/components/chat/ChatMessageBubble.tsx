/**
 * ChatMessageBubble — Rich message renderer supporting text, images, tables,
 * data extraction cards, and interactive action buttons.
 */
import React from 'react';
import {
  Bot, User, Volume2, VolumeX, Pause, Play, RefreshCw, Settings,
  FileText, Link2, CheckCircle, XCircle,
  ChevronDown, ChevronUp, ExternalLink,
} from 'lucide-react';
import type { EnhancedChatMessage, ChatAttachment, ExtractedDataPayload, ChatAction } from '../../types/chat';
import { formatFileSize } from '../../types/chat';
import LoadingSpinner from '../LoadingSpinner';

// ─── Markdown formatter (migrated from ChatPanel) ────────────────────────────

function formatMarkdown(text: string): JSX.Element {
  const lines = text.split('\n');
  const elements: JSX.Element[] = [];
  let currentList: string[] = [];
  let key = 0;

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`list-${key++}`} className="list-disc list-inside space-y-1 my-2 ml-2">
          {currentList.map((item, i) => (<li key={i} className="text-sm">{item}</li>))}
        </ul>
      );
      currentList = [];
    }
  };

  lines.forEach((line) => {
    if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
      currentList.push(line.trim().substring(1).trim());
      return;
    }
    flushList();
    if (line.startsWith('###')) {
      elements.push(<h4 key={`h4-${key++}`} className="font-semibold text-sm mt-3 mb-1">{line.substring(3).trim()}</h4>);
    } else if (line.startsWith('##')) {
      elements.push(<h3 key={`h3-${key++}`} className="font-bold text-base mt-3 mb-2">{line.substring(2).trim()}</h3>);
    } else if (line.startsWith('**') && line.endsWith('**')) {
      elements.push(<p key={`bold-${key++}`} className="font-bold text-sm my-1">{line.substring(2, line.length - 2)}</p>);
    } else if (line.trim() === '') {
      elements.push(<div key={`space-${key++}`} className="h-2" />);
    } else {
      const formatted = line
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/`(.*?)`/g, '<code class="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-xs">$1</code>');
      elements.push(<p key={`p-${key++}`} className="text-sm my-1" dangerouslySetInnerHTML={{ __html: formatted }} />);
    }
  });
  flushList();
  return <div className="space-y-1">{elements}</div>;
}

// ─── Component ──────────────────────────────────────────────────────────────────

interface ChatMessageBubbleProps {
  message: EnhancedChatMessage;
  isErrorMessage?: boolean;
  isConfigMessage?: boolean;
  // Voice controls
  voiceEnabled?: boolean;
  isReading?: boolean;
  isPaused?: boolean;
  onSpeak?: (text: string) => void;
  onStopSpeaking?: () => void;
  // Actions
  onRetry?: (messageId: string, originalInput: string) => void;
  retryingMessageId?: string | null;
  onActionClick?: (action: ChatAction) => void;
  onConfirmExtraction?: (messageId: string, extractionId: string) => void;
  onDismissExtraction?: (messageId: string, extractionId: string) => void;
}

export default function ChatMessageBubble({
  message, isErrorMessage, isConfigMessage,
  voiceEnabled, isReading, isPaused, onSpeak, onStopSpeaking,
  onRetry, retryingMessageId,
  onActionClick, onConfirmExtraction, onDismissExtraction,
}: ChatMessageBubbleProps) {
  const isUser = message.role === 'user';
  const isLoading = message.status === 'sending' || message.status === 'streaming' || message.content === 'Thinking...';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}>
      <div className={`flex items-start gap-3 max-w-[85%] ${isUser ? 'flex-row-reverse' : ''}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser
            ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white'
            : 'bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-300'
        }`}>
          {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
        </div>

        {/* Message Bubble */}
        <div className={`rounded-2xl p-4 transition-all duration-200 shadow-sm ${
          isUser
            ? 'bg-gradient-to-br from-primary-600 to-primary-500 text-white'
            : isErrorMessage
            ? 'bg-red-50 dark:bg-red-900/20 text-gray-900 dark:text-gray-100 border border-red-200 dark:border-red-800'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700'
        }`}>
          {isLoading ? (
            <div className="flex items-center gap-3">
              <LoadingSpinner size="sm" />
              <span className="text-sm font-medium">
                {message.status === 'streaming' ? 'Responding...' : 'Thinking...'}
              </span>
            </div>
          ) : (
            <>
              {/* User attachments */}
              {isUser && message.attachments && message.attachments.length > 0 && (
                <MessageAttachments attachments={message.attachments} />
              )}

              {/* Text content */}
              {formatMarkdown(message.content)}

              {/* Extracted data cards */}
              {!isUser && message.extractedData && message.extractedData.length > 0 && (
                <div className="mt-3 space-y-2">
                  {message.extractedData.map((data) => (
                    <DataExtractionMiniCard
                      key={data.id}
                      data={data}
                      onConfirm={() => onConfirmExtraction?.(message.id, data.id)}
                      onDismiss={() => onDismissExtraction?.(message.id, data.id)}
                    />
                  ))}
                </div>
              )}

              {/* Action buttons for assistant messages */}
              {!isUser && (
                <MessageActions
                  message={message}
                  isErrorMessage={isErrorMessage}
                  isConfigMessage={isConfigMessage}
                  voiceEnabled={voiceEnabled}
                  isReading={isReading}
                  isPaused={isPaused}
                  onSpeak={onSpeak}
                  onStopSpeaking={onStopSpeaking}
                  onRetry={onRetry}
                  retryingMessageId={retryingMessageId}
                  onActionClick={onActionClick}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Message Attachments (inline display) ────────────────────────────────────

function MessageAttachments({ attachments }: { attachments: ChatAttachment[] }) {
  return (
    <div className="flex flex-wrap gap-2 mb-3">
      {attachments.map((a) => (
        <div key={a.id}>
          {a.type === 'image' ? (
            <img src={a.thumbnail || a.url} alt={a.name}
              className="w-24 h-24 rounded-xl object-cover border-2 border-white/20 shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => window.open(a.url, '_blank')} />
          ) : a.type === 'url' ? (
            <a href={a.url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2 text-xs hover:bg-white/20 transition-colors">
              <Link2 className="w-3.5 h-3.5" />
              <span className="truncate max-w-[150px]">{a.name}</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
          ) : (
            <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2 text-xs">
              <FileText className="w-3.5 h-3.5" />
              <span className="truncate max-w-[150px]">{a.name}</span>
              {a.size > 0 && <span className="opacity-60">{formatFileSize(a.size)}</span>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Data Extraction Mini Card ──────────────────────────────────────────────

function DataExtractionMiniCard({
  data, onConfirm, onDismiss,
}: { data: ExtractedDataPayload; onConfirm: () => void; onDismiss: () => void }) {
  const [expanded, setExpanded] = React.useState(false);

  if (data.status === 'confirmed') {
    return (
      <div className="flex items-center gap-2 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-xl px-3 py-2 text-xs">
        <CheckCircle className="w-4 h-4 text-green-500" />
        <span className="text-green-700 dark:text-green-300 font-medium">Saved to {data.destinationLabel}</span>
      </div>
    );
  }
  if (data.status === 'dismissed') return null;

  return (
    <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-blue-800 dark:text-blue-200">{data.summary}</p>
          <p className="text-[10px] text-blue-600 dark:text-blue-400 mt-0.5">
            → {data.destinationLabel} • {data.confidence}% confidence
          </p>
        </div>
        <button onClick={() => setExpanded(!expanded)} className="text-blue-500 p-1 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg">
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>
      {expanded && (
        <pre className="mt-2 text-[10px] text-blue-700 dark:text-blue-300 bg-blue-100/50 dark:bg-blue-900/30 rounded-lg p-2 overflow-x-auto max-h-32">
          {JSON.stringify(data.data, null, 2)}
        </pre>
      )}
      <div className="flex gap-2 mt-2">
        <button onClick={onConfirm}
          className="flex items-center gap-1 text-xs font-semibold bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors">
          <CheckCircle className="w-3.5 h-3.5" /> Save
        </button>
        <button onClick={onDismiss}
          className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 px-3 py-1.5 rounded-lg transition-colors">
          <XCircle className="w-3.5 h-3.5" /> Dismiss
        </button>
      </div>
    </div>
  );
}

// ─── Message Actions Bar ────────────────────────────────────────────────────

function MessageActions({
  message, isErrorMessage, isConfigMessage,
  voiceEnabled, isReading, isPaused, onSpeak, onStopSpeaking,
  onRetry, retryingMessageId, onActionClick,
}: Omit<ChatMessageBubbleProps, 'onConfirmExtraction' | 'onDismissExtraction'>) {
  const hasActions = voiceEnabled || isErrorMessage || isConfigMessage || (message.actions && message.actions.length > 0);
  if (!hasActions) return null;

  return (
    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2 flex-wrap">
      {/* Voice controls */}
      {voiceEnabled && !isErrorMessage && (
        <>
          <button onClick={() => onSpeak?.(message.content)}
            className={`text-xs font-semibold hover:opacity-80 transition-opacity flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg ${
              isReading && !isPaused ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
            {isReading ? (isPaused ? <><Play className="w-3.5 h-3.5" /> Resume</> : <><Pause className="w-3.5 h-3.5" /> Pause</>) 
              : <><Volume2 className="w-3.5 h-3.5" /> Read</>}
          </button>
          {isReading && (
            <button onClick={onStopSpeaking}
              className="text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5">
              <VolumeX className="w-3.5 h-3.5" /> Stop
            </button>
          )}
        </>
      )}

      {/* Retry button */}
      {(isErrorMessage || isConfigMessage) && message.originalInput && (
        <button onClick={() => onRetry?.(message.id, message.originalInput!)}
          disabled={retryingMessageId === message.id}
          className="text-xs font-semibold bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 hover:bg-primary-200 dark:hover:bg-primary-900/50 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50">
          <RefreshCw className={`w-3.5 h-3.5 ${retryingMessageId === message.id ? 'animate-spin' : ''}`} />
          {retryingMessageId === message.id ? 'Retrying...' : 'Retry'}
        </button>
      )}

      {/* Config button */}
      {isConfigMessage && (
        <button className="text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5">
          <Settings className="w-3.5 h-3.5" /> Setup Guide
        </button>
      )}

      {/* Custom actions from AI */}
      {message.actions?.map((action) => (
        <button key={action.id} onClick={() => onActionClick?.(action)}
          disabled={action.disabled}
          className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50 ${
            action.variant === 'primary' ? 'bg-primary-600 text-white hover:bg-primary-700'
            : action.variant === 'danger' ? 'bg-red-100 text-red-700 hover:bg-red-200'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
          }`}>
          {action.label}
        </button>
      ))}
    </div>
  );
}
