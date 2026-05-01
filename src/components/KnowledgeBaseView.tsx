import { useCallback } from 'react';
import { Upload, FileText, Trash2, File, Search, BookOpen, Sparkles } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useStore } from '../store/useStore';
import type { KnowledgeBaseFile } from '../types';
import { useState } from 'react';

export default function KnowledgeBaseView() {
  const { knowledgeBase, addKnowledgeFile, removeKnowledgeFile } = useStore();
  const [searchQuery, setSearchQuery] = useState('');

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      for (const file of acceptedFiles) {
        const fileType = getFileType(file.name);
        
        if (file.name.endsWith('.pdf')) {
          // Try to extract text from PDF
          const pdfReader = new FileReader();
          pdfReader.readAsArrayBuffer(file);
          pdfReader.onload = async (e) => {
            try {
              const arrayBuffer = e.target?.result as ArrayBuffer;
              const uint8Array = new Uint8Array(arrayBuffer);
              const text = new TextDecoder('utf-8').decode(uint8Array);
              
              // Extract readable text (simplified PDF parsing)
              const textMatch = text.match(/\/FlateDecode.*?stream[\s\S]*?endstream/g);
              let extractedText = '';
              
              if (textMatch) {
                extractedText = textMatch
                  .map(chunk => chunk.replace(/[^\x20-\x7E\n]/g, ' ').substring(0, 5000))
                  .join('\n\n');
              }
              
              if (!extractedText || extractedText.trim().length < 50) {
                extractedText = `PDF Document: ${file.name}\n\nSize: ${(file.size / 1024).toFixed(2)} KB\n\nNote: Full text extraction requires PDF.js library. Upload as TXT or MD for better results.`;
              }
              
              const kbFile: KnowledgeBaseFile = {
                id: crypto.randomUUID(),
                name: file.name,
                type: 'pdf',
                content: extractedText.substring(0, 50000),
                uploadedAt: new Date().toISOString(),
              };
              addKnowledgeFile(kbFile);
            } catch (error) {
              console.error('PDF processing error:', error);
              const kbFile: KnowledgeBaseFile = {
                id: crypto.randomUUID(),
                name: file.name,
                type: 'pdf',
                content: `PDF file: ${file.name} (${(file.size / 1024).toFixed(2)} KB)\n\nNote: For better PDF text extraction, convert to TXT or MD format.`,
                uploadedAt: new Date().toISOString(),
              };
              addKnowledgeFile(kbFile);
            }
          };
        } else {
          // Text-based files
          const reader = new FileReader();
          reader.onload = async () => {
            const content = reader.result as string;
            
            const kbFile: KnowledgeBaseFile = {
              id: crypto.randomUUID(),
              name: file.name,
              type: fileType,
              content,
              uploadedAt: new Date().toISOString(),
            };
            
            addKnowledgeFile(kbFile);
          };
          
          if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
            reader.readAsText(file);
          } else if (file.name.endsWith('.md')) {
            reader.readAsText(file);
          } else if (file.name.endsWith('.csv')) {
            reader.readAsText(file);
          } else {
            reader.readAsText(file);
          }
        }
      }
    },
    [addKnowledgeFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
      'text/csv': ['.csv'],
      'application/pdf': ['.pdf'],
    },
  });

  const getFileType = (filename: string): KnowledgeBaseFile['type'] => {
    if (filename.endsWith('.pdf')) return 'pdf';
    if (filename.endsWith('.txt')) return 'txt';
    if (filename.endsWith('.md')) return 'md';
    if (filename.endsWith('.csv')) return 'csv';
    return 'notes';
  };

  const getFileIcon = (type: KnowledgeBaseFile['type']) => {
    switch (type) {
      case 'pdf':
      case 'txt':
      case 'md':
      case 'csv':
        return FileText;
      default:
        return File;
    }
  };

  const filteredFiles = knowledgeBase.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    file.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="card-elevated p-6 bg-gradient-to-r from-primary-50 via-white to-primary-50 dark:from-primary-950/20 dark:via-gray-900 dark:to-primary-950/20">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Knowledge Base
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Upload documents for the AI to reference when answering questions
            </p>
          </div>
        </div>
      </div>

      <div
        {...getRootProps()}
        className={`card p-12 text-center cursor-pointer transition-all duration-200 hover-lift ${
          isDragActive
            ? 'border-2 border-primary-500 bg-primary-50 dark:bg-primary-900/20'
            : 'border-2 border-dashed border-gray-300 dark:border-gray-700'
        }`}
      >
        <input {...getInputProps()} />
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-primary-400/20 blur-3xl rounded-full"></div>
          <Upload className="w-16 h-16 text-primary-500 dark:text-primary-400 relative z-10 mx-auto" />
        </div>
        <p className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
          {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
          or click to select files (PDF, TXT, MD, CSV)
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
          Upload nutrition books, research papers, recipes, and dietary guidelines
        </p>
      </div>

      {knowledgeBase.length > 0 && (
        <>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search knowledge base..."
              className="input pl-12 pr-4"
            />
          </div>

          <div className="card">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  Uploaded Files
                </h2>
                <span className="badge badge-primary">
                  {filteredFiles.length} {filteredFiles.length === 1 ? 'file' : 'files'}
                </span>
              </div>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredFiles.map((file, index) => {
                const Icon = getFileIcon(file.type);
                return (
                  <div
                    key={file.id}
                    className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors animate-fade-in"
                    style={{ animationDelay: `${index * 0.03}s` }}
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">{file.name}</h3>
                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
                          <span className="badge text-xs">{file.type.toUpperCase()}</span>
                          <span>•</span>
                          <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{file.content.length > 0 ? `${Math.round(file.content.length / 1000)}K chars` : 'Empty'}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeKnowledgeFile(file.id)}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors ml-4 flex-shrink-0"
                      aria-label="Delete file"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {knowledgeBase.length === 0 && (
        <div className="card p-12 text-center animate-fade-in">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-primary-400/20 blur-3xl rounded-full"></div>
            <FileText className="w-20 h-20 text-primary-500 dark:text-primary-400 relative z-10 mx-auto" />
          </div>
          <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">No files uploaded yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-1">Upload your first document to get started!</p>
          <p className="text-sm text-gray-500 dark:text-gray-500">The AI will use uploaded documents to provide more accurate answers.</p>
        </div>
      )}
    </div>
  );
}
