'use client';

import React, { useState, useRef } from 'react';
import { useKnowledge } from '@/context/knowledge-context';
import { 
  X, 
  UploadCloud, 
  FileText, 
  Trash2, 
  Info, 
  Check 
} from 'lucide-react';

interface SelectedFile {
  name: string;
  size: number;
  type: string;
}

export function ImportDocumentDialog() {
  const {
    isImportDialogOpen,
    setIsImportDialogOpen,
    collections,
    selectedCollectionId,
    importMockFiles,
    showToast,
  } = useKnowledge();

  const [files, setFiles] = useState<SelectedFile[]>([]);
  const [collectionId, setCollectionId] = useState(selectedCollectionId || collections[0]?.id || '');
  const [isDragging, setIsDragging] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isImportDialogOpen) return null;

  const handleFiles = (incomingFiles: FileList | null) => {
    if (!incomingFiles) return;
    const accepted: SelectedFile[] = [];

    for (let i = 0; i < incomingFiles.length; i++) {
      const file = incomingFiles[i];
      const isPdf = file.name.toLowerCase().endsWith('.pdf');
      const isTxt = file.name.toLowerCase().endsWith('.txt');

      if (isPdf || isTxt) {
        accepted.push({
          name: file.name,
          size: file.size,
          type: isPdf ? 'application/pdf' : 'text/plain',
        });
      } else {
        showToast('warning', 'Unsupported File Type', `${file.name} is not a PDF or TXT file.`);
      }
    }

    setFiles(prev => [...prev, ...accepted]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleStartImport = async () => {
    if (files.length === 0) {
      showToast('error', 'No files selected', 'Please drop or choose at least one PDF or TXT file.');
      return;
    }
    if (!collectionId) {
      showToast('error', 'Select Collection', 'Please select a destination subject collection.');
      return;
    }

    setIsImporting(true);
    try {
      await importMockFiles(files, collectionId);
      setFiles([]);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={() => setIsImportDialogOpen(false)}
    >
      <div
        className="w-full max-w-lg rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-modal)] overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface)]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-[var(--selection)] text-[var(--accent)]">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                Import Study Documents
              </h2>
              <p className="text-[11px] text-[var(--text-secondary)]">
                Add PDF study guides or TXT notes to your library
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsImportDialogOpen(false)}
            className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Phase 3 Advisory Notice */}
          <div className="p-3 rounded-md bg-[var(--surface-muted)] border border-[var(--border)] text-xs text-[var(--text-secondary)] flex items-start gap-2.5">
            <Info className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5" />
            <div className="leading-relaxed text-[11px]">
              <strong className="text-[var(--text-primary)] block font-medium mb-0.5">
                Phase 3 Integration Notice
              </strong>
              Files selected here are processed locally into your workspace. In Phase 3, NoteNest will automatically extract semantic topics, build citation anchors, and retain original PDF files in Supabase Storage.
            </div>
          </div>

          {/* Destination Collection Selector */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[var(--text-secondary)]">
              Destination Subject Collection
            </label>
            <select
              value={collectionId}
              onChange={e => setCollectionId(e.target.value)}
              className="w-full bg-[var(--surface-muted)] border border-[var(--border)] rounded-md px-3 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--focus-ring)] focus:bg-[var(--surface)] transition"
            >
              {collections.map(col => (
                <option key={col.id} value={col.id}>
                  {col.name}
                </option>
              ))}
            </select>
          </div>

          {/* Drag & Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`p-6 sm:p-8 rounded-md border-2 border-dashed text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 ${
              isDragging
                ? 'border-[var(--accent)] bg-[var(--selection)] text-[var(--text-primary)]'
                : 'border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-secondary)] hover:border-[var(--text-muted)] hover:bg-[var(--surface-hover)]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt"
              multiple
              onChange={e => handleFiles(e.target.files)}
              className="hidden"
            />
            <div className="p-2.5 rounded-full bg-[var(--surface)] border border-[var(--border)] text-[var(--accent)]">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-[var(--text-primary)]">
                Click to browse or drag and drop files here
              </p>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                Supports PDF and TXT files (up to 25 MB each)
              </p>
            </div>
          </div>

          {/* Selected Files List */}
          {files.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                <span>Selected Files ({files.length})</span>
                <button
                  onClick={() => setFiles([])}
                  className="text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition"
                >
                  Clear all
                </button>
              </div>

              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {files.map((file, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-md bg-[var(--surface-muted)] border border-[var(--border)] flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileText className="w-4 h-4 text-[var(--accent)] shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-[var(--text-primary)] truncate text-[11px]">
                          {file.name}
                        </p>
                        <p className="text-[10px] text-[var(--text-muted)] font-mono">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveFile(idx)}
                      className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--status-error)] transition"
                      title="Remove file"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[var(--border)] bg-[var(--surface)] flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setIsImportDialogOpen(false)}
            className="px-3.5 py-1.5 rounded-md border border-[var(--border)] hover:bg-[var(--surface-hover)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleStartImport}
            disabled={files.length === 0 || isImporting}
            className="px-4 py-1.5 rounded-md bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-50 text-xs font-medium text-[var(--accent-foreground)] shadow-xs transition flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{isImporting ? 'Processing...' : `Import ${files.length > 0 ? `(${files.length})` : ''}`}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
