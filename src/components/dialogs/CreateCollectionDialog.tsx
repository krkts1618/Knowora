'use client';

import React, { useState } from 'react';
import { useKnowledge } from '@/context/knowledge-context';
import { Collection } from '@/types';
import { 
  X, 
  FolderPlus, 
  BookOpen, 
  Code, 
  Cpu, 
  Network, 
  Layers, 
  Terminal, 
  Check, 
  AlertCircle 
} from 'lucide-react';

const COLORS: { id: Collection['color']; bgClass: string; label: string }[] = [
  { id: 'forest', bgClass: 'bg-[#1F6B4D]', label: 'Forest' },
  { id: 'emerald', bgClass: 'bg-[#2E7D59]', label: 'Emerald' },
  { id: 'sage', bgClass: 'bg-[#4F7A65]', label: 'Sage' },
  { id: 'amber', bgClass: 'bg-[#946200]', label: 'Amber' },
  { id: 'cyan', bgClass: 'bg-[#20626B]', label: 'Teal' },
  { id: 'rose', bgClass: 'bg-[#9E4D4D]', label: 'Rose' },
  { id: 'sky', bgClass: 'bg-[#407B8C]', label: 'Sky' },
];

const ICONS: { id: Collection['icon']; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'code', label: 'Code', Icon: Code },
  { id: 'cpu', label: 'CPU / ML', Icon: Cpu },
  { id: 'layers', label: 'Layers', Icon: Layers },
  { id: 'network', label: 'Network', Icon: Network },
  { id: 'book', label: 'Book', Icon: BookOpen },
  { id: 'terminal', label: 'Terminal', Icon: Terminal },
];

export function CreateCollectionDialog() {
  const {
    isCreateCollectionOpen,
    setIsCreateCollectionOpen,
    createCollection,
    collections,
  } = useKnowledge();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState<Collection['color']>('forest');
  const [selectedIcon, setSelectedIcon] = useState<Collection['icon']>('code');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isCreateCollectionOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmed = name.trim();
    if (!trimmed) {
      setErrorMessage('Please enter a collection name.');
      return;
    }

    // Duplicate check
    const duplicate = collections.some(
      c => c.name.trim().toLowerCase() === trimmed.toLowerCase()
    );
    if (duplicate) {
      setErrorMessage(`A collection named "${trimmed}" already exists.`);
      return;
    }

    setIsSubmitting(true);
    try {
      await createCollection({
        name: trimmed,
        description: description.trim(),
        color: selectedColor,
        icon: selectedIcon,
      });
      setIsCreateCollectionOpen(false);
      setName('');
      setDescription('');
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to create collection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={() => setIsCreateCollectionOpen(false)}
    >
      <div
        className="w-full max-w-md rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-modal)] overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface)]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-[var(--selection)] text-[var(--accent)]">
              <FolderPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                Create Subject Collection
              </h2>
              <p className="text-[11px] text-[var(--text-secondary)]">
                Organize study notes, cheatsheets, and documents under a discipline
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCreateCollectionOpen(false)}
            className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMessage && (
            <div className="p-2.5 rounded-md bg-rose-500/10 border border-rose-500/20 text-[var(--status-error)] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Collection Name */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[var(--text-secondary)]">
              Collection Name <span className="text-[var(--status-error)]">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => {
                setName(e.target.value);
                setErrorMessage('');
              }}
              placeholder="e.g. Distributed Systems, Cloud Architecture..."
              className="w-full px-3 py-1.5 rounded-md bg-[var(--surface-muted)] border border-[var(--border)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--focus-ring)] focus:bg-[var(--surface)] transition"
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[var(--text-secondary)]">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Brief summary of the topics covered in this collection..."
              rows={2}
              className="w-full px-3 py-1.5 rounded-md bg-[var(--surface-muted)] border border-[var(--border)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--focus-ring)] focus:bg-[var(--surface)] transition resize-none"
            />
          </div>

          {/* Icon Selection */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[var(--text-secondary)]">
              Select Icon
            </label>
            <div className="grid grid-cols-6 gap-1.5">
              {ICONS.map(({ id, label, Icon }) => {
                const isSelected = selectedIcon === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSelectedIcon(id)}
                    className={`p-2 rounded-md border flex flex-col items-center gap-1 transition ${
                      isSelected
                        ? 'bg-[var(--selection)] border-[var(--accent)] text-[var(--accent)] font-medium'
                        : 'bg-[var(--surface-muted)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="text-[10px] truncate max-w-[44px]">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Selection */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[var(--text-secondary)]">
              Accent Color
            </label>
            <div className="flex items-center gap-2">
              {COLORS.map(({ id, bgClass }) => {
                const isSelected = selectedColor === id;

                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSelectedColor(id)}
                    className={`w-5 h-5 rounded-full ${bgClass} flex items-center justify-center transition ${
                      isSelected ? 'ring-2 ring-[var(--focus-ring)] ring-offset-2 ring-offset-[var(--surface)] scale-110' : 'opacity-70 hover:opacity-100'
                    }`}
                    aria-label={`Select ${id} color`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-[var(--border)] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreateCollectionOpen(false)}
              className="px-3 py-1.5 rounded-md border border-[var(--border)] hover:bg-[var(--surface-hover)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-3.5 py-1.5 rounded-md bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-50 text-xs font-medium text-[var(--accent-foreground)] shadow-xs transition"
            >
              {isSubmitting ? 'Creating...' : 'Create Collection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
