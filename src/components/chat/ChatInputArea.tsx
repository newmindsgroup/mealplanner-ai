/**
 * ChatInputArea — Multi-line textarea with paste detection, drag-drop,
 * attachment chips, and voice input integration.
 */
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Send, X } from 'lucide-react';
import type { ChatAttachment } from '../../types/chat';
import { getAttachmentType, validateChatFile } from '../../types/chat';
import ChatAttachmentPicker, { AttachmentChips } from './ChatAttachmentPicker';
import VoiceInput from '../VoiceInput';

interface ChatInputAreaProps {
  onSend: (text: string, attachments: ChatAttachment[]) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function ChatInputArea({ onSend, disabled = false, placeholder }: ChatInputAreaProps) {
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + 'px';
    }
  }, [input]);

  const handleSend = useCallback(() => {
    if (!input.trim() && attachments.length === 0) return;
    onSend(input.trim(), attachments);
    setInput('');
    setAttachments([]);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  }, [input, attachments, onSend]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  // Clipboard paste — detect images
  const handlePaste = useCallback(async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (!file) continue;

        const validation = validateChatFile(file);
        if (!validation.valid) continue;

        const url = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });

        const thumbnail = await generateThumbnail(url, 120);

        setAttachments((prev) => [...prev, {
          id: crypto.randomUUID(),
          type: 'image',
          name: `Pasted Image ${new Date().toLocaleTimeString()}`,
          url, mimeType: file.type, size: file.size, thumbnail, status: 'ready',
        }]);
      }
    }
  }, []);

  // Drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer?.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validation = validateChatFile(file);
      if (!validation.valid) continue;

      const type = getAttachmentType(file.type);
      const url = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      let thumbnail: string | undefined;
      if (type === 'image') thumbnail = await generateThumbnail(url, 120);

      setAttachments((prev) => [...prev, {
        id: crypto.randomUUID(), type, name: file.name, url,
        mimeType: file.type, size: file.size, thumbnail, status: 'ready',
      }]);
    }
  }, []);

  const addAttachment = useCallback((attachment: ChatAttachment) => {
    setAttachments((prev) => [...prev, attachment]);
  }, []);

  const removeAttachment = useCallback((id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const canSend = (input.trim().length > 0 || attachments.length > 0) && !disabled;

  return (
    <div
      className={`border-t border-gray-200/50 dark:border-gray-800/50 bg-gray-50/50 dark:bg-gray-900/50 transition-all duration-200 ${
        isDragOver ? 'ring-2 ring-primary-400 ring-inset bg-primary-50/30 dark:bg-primary-950/20' : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag overlay */}
      {isDragOver && (
        <div className="px-4 py-3 text-center">
          <p className="text-sm font-semibold text-primary-600 dark:text-primary-400 animate-pulse">
            Drop files here to attach
          </p>
        </div>
      )}

      {/* Attachment chips */}
      <AttachmentChips attachments={attachments} onRemove={removeAttachment} />

      {/* Input row */}
      <div className="p-4 pt-2">
        <div className="flex items-end gap-3">
          {/* Attachment picker */}
          <ChatAttachmentPicker
            attachments={attachments}
            onAddAttachment={addAttachment}
            onRemoveAttachment={removeAttachment}
            disabled={disabled}
          />

          {/* Voice input */}
          <VoiceInput
            onTranscript={(text) => { setInput((prev) => prev + (prev ? ' ' : '') + text); setIsListening(false); }}
            isListening={isListening}
            onToggle={() => setIsListening(!isListening)}
          />

          {/* Textarea */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              placeholder={placeholder || 'Ask about meal planning, nutrition, or send an image...'}
              rows={1}
              disabled={disabled}
              className="w-full resize-none rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-50"
              style={{ maxHeight: '160px', minHeight: '44px' }}
            />
            {input.trim() && (
              <button onClick={() => setInput('')}
                className="absolute right-3 top-3 p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                aria-label="Clear input">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={!canSend}
            className="btn btn-primary p-3 disabled:opacity-50 disabled:cursor-not-allowed group flex-shrink-0"
            aria-label="Send message"
          >
            <Send className={`w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform`} />
          </button>
        </div>

        {/* Input format indicators */}
        <div className="flex items-center justify-between mt-1.5">
          <p className="text-[10px] text-gray-400">
            {attachments.length > 0 ? `${attachments.length} attachment${attachments.length > 1 ? 's' : ''} • ` : ''}
            Enter to send · Shift+Enter for new line · Ctrl+V to paste images
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Thumbnail helper ───────────────────────────────────────────────────────

async function generateThumbnail(dataUrl: string, maxDim: number): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width: w, height: h } = img;
      if (w > h) { if (w > maxDim) { h = Math.round((h * maxDim) / w); w = maxDim; } }
      else { if (h > maxDim) { w = Math.round((w * maxDim) / h); h = maxDim; } }
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (ctx) { ctx.drawImage(img, 0, 0, w, h); resolve(canvas.toDataURL('image/webp', 0.7)); }
      else resolve(dataUrl);
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}
