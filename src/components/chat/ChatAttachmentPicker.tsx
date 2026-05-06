/**
 * ChatAttachmentPicker — Unified attachment button with file/image/URL picking
 */
import React, { useState, useRef, useCallback } from 'react';
import {
  Paperclip, Camera, FileText, Image as ImageIcon, Link2,
  X, Upload, AlertCircle, Loader2,
} from 'lucide-react';
import type { ChatAttachment } from '../../types/chat';
import { validateChatFile, getAttachmentType, formatFileSize } from '../../types/chat';

interface ChatAttachmentPickerProps {
  attachments: ChatAttachment[];
  onAddAttachment: (attachment: ChatAttachment) => void;
  onRemoveAttachment: (id: string) => void;
  maxAttachments?: number;
  disabled?: boolean;
}

export default function ChatAttachmentPicker({
  attachments, onAddAttachment,
  maxAttachments = 5, disabled = false,
}: ChatAttachmentPickerProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlValue, setUrlValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const canAddMore = attachments.length < maxAttachments;

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false);
    };
    if (showMenu) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  const processFile = useCallback(async (file: File) => {
    setError(null);
    const validation = validateChatFile(file);
    if (!validation.valid) { setError(validation.error || 'Invalid file'); return; }

    const type = getAttachmentType(file.type);
    const url = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });

    let thumbnail: string | undefined;
    if (type === 'image') thumbnail = await generateThumbnail(url, 120);

    onAddAttachment({
      id: crypto.randomUUID(), type, name: file.name, url,
      mimeType: file.type, size: file.size, thumbnail, status: 'ready',
    });
    setShowMenu(false);
  }, [onAddAttachment]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    Array.from(e.target.files).forEach(processFile);
    e.target.value = '';
  }, [processFile]);

  const handleUrlSubmit = useCallback(() => {
    if (!urlValue.trim()) return;
    onAddAttachment({
      id: crypto.randomUUID(), type: 'url',
      name: urlValue.length > 40 ? urlValue.substring(0, 40) + '…' : urlValue,
      url: urlValue.trim(), mimeType: 'text/uri-list', size: 0, status: 'ready',
    });
    setUrlValue(''); setShowUrlInput(false); setShowMenu(false);
  }, [urlValue, onAddAttachment]);

  const menuItems = [
    { icon: Camera, label: 'Take Photo', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/30', action: () => cameraInputRef.current?.click() },
    { icon: ImageIcon, label: 'Photo/Image', color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/30', action: () => { if (fileInputRef.current) { fileInputRef.current.accept = 'image/*'; fileInputRef.current.click(); } } },
    { icon: FileText, label: 'Document', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/30', action: () => { if (fileInputRef.current) { fileInputRef.current.accept = '.pdf,.txt,.md,.csv'; fileInputRef.current.click(); } } },
    { icon: Link2, label: 'URL / Link', color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-950/30', action: () => setShowUrlInput(true) },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} multiple />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileSelect} />

      <button
        onClick={() => { if (canAddMore && !disabled) { setShowMenu(!showMenu); setShowUrlInput(false); setError(null); } }}
        disabled={!canAddMore || disabled}
        className={`p-2.5 rounded-xl transition-all duration-200 ${
          showMenu ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rotate-45'
          : canAddMore && !disabled ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-105'
          : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed opacity-50'
        }`}
        aria-label="Add attachment"
      >
        <Paperclip className="w-5 h-5" />
      </button>

      {showMenu && (
        <div className="absolute bottom-full left-0 mb-2 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-fade-in z-50">
          {showUrlInput ? (
            <div className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <Link2 className="w-4 h-4 text-green-500" />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Paste URL</span>
              </div>
              <div className="flex gap-2">
                <input type="url" value={urlValue} onChange={(e) => setUrlValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()} placeholder="https://..."
                  className="flex-1 text-sm px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  autoFocus />
                <button onClick={handleUrlSubmit} disabled={!urlValue.trim()}
                  className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors">
                  <Upload className="w-4 h-4" />
                </button>
              </div>
              <button onClick={() => setShowUrlInput(false)} className="text-xs text-gray-400 mt-2 hover:text-gray-600">← Back</button>
            </div>
          ) : (
            <>
              <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Attach</span>
              </div>
              <div className="p-1.5">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button key={item.label} onClick={item.action}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                      <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <Icon className={`w-4 h-4 ${item.color}`} />
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.label}</span>
                    </button>
                  );
                })}
              </div>
              <div className="px-3 py-2 border-t border-gray-100 dark:border-gray-700">
                <p className="text-[10px] text-gray-400 text-center">Or paste an image with Ctrl+V</p>
              </div>
            </>
          )}
        </div>
      )}

      {error && (
        <div className="absolute bottom-full left-0 mb-2 w-64 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-3 animate-fade-in z-50">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-red-700 dark:text-red-300">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Attachment Preview Chips ────────────────────────────────────────────────

export function AttachmentChips({ attachments, onRemove }: { attachments: ChatAttachment[]; onRemove: (id: string) => void }) {
  if (attachments.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2 px-4 py-2">
      {attachments.map((a) => (
        <div key={a.id} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-1.5 border border-gray-200/50 dark:border-gray-700/50 group animate-fade-in">
          {a.thumbnail ? (
            <img src={a.thumbnail} alt={a.name} className="w-6 h-6 rounded object-cover" />
          ) : (
            <FileText className="w-4 h-4 text-gray-500" />
          )}
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate max-w-[120px]">{a.name}</span>
            {a.size > 0 && <span className="text-[10px] text-gray-400">{formatFileSize(a.size)}</span>}
          </div>
          {a.status === 'processing' && <Loader2 className="w-3.5 h-3.5 text-primary-500 animate-spin" />}
          <button onClick={() => onRemove(a.id)} className="p-0.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-400 hover:text-gray-600 transition-colors opacity-0 group-hover:opacity-100" aria-label="Remove">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Thumbnail Generator ────────────────────────────────────────────────────

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
