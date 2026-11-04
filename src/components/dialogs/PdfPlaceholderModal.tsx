'use client';

import React, { useState } from 'react';
import { useKnowledge } from '@/context/knowledge-context';
import { 
  X, 
  FileText, 
  ZoomIn, 
  ZoomOut, 
  ChevronLeft, 
  ChevronRight, 
  AlertCircle 
} from 'lucide-react';

export function PdfPlaceholderModal() {
  const {
    isPdfModalOpen,
    closePdfModal,
    pdfModalTopic,
    selectedDocument,
    showToast,
  } = useKnowledge();

  const [pageNumber, setPageNumber] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);

  if (!isPdfModalOpen || !pdfModalTopic) return null;

  const fileName = selectedDocument?.originalFileName || `${pdfModalTopic.title.replace(/\s+/g, '_')}_Source.pdf`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={closePdfModal}
    >
      <div
        className="w-full max-w-5xl h-[88vh] rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-modal)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-4 py-2.5 bg-[var(--surface)] border-b border-[var(--border)] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 rounded-md bg-[var(--selection)] text-[var(--accent)]">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-semibold text-[var(--text-primary)] truncate">
                  {fileName}
                </h3>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--surface-muted)] border border-[var(--border)] text-[var(--text-secondary)]">
                  Phase 3 Preview
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] truncate">
                Referenced by: <strong className="text-[var(--text-primary)] font-medium">{pdfModalTopic.title}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Viewer Controls */}
            <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-md bg-[var(--surface-muted)] border border-[var(--border)] text-xs text-[var(--text-secondary)] font-mono">
              <button
                onClick={() => setPageNumber(prev => Math.max(1, prev - 1))}
                className="p-0.5 rounded hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                title="Previous page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span>Page {pageNumber} of 42</span>
              <button
                onClick={() => setPageNumber(prev => Math.min(42, prev + 1))}
                className="p-0.5 rounded hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                title="Next page"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-md bg-[var(--surface-muted)] border border-[var(--border)] text-xs text-[var(--text-secondary)]">
              <button
                onClick={() => setZoomLevel(prev => Math.max(75, prev - 10))}
                className="p-0.5 hover:text-[var(--text-primary)]"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[11px]">{zoomLevel}%</span>
              <button
                onClick={() => setZoomLevel(prev => Math.min(150, prev + 10))}
                className="p-0.5 hover:text-[var(--text-primary)]"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={closePdfModal}
              className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition"
              aria-label="Close PDF preview"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Phase 3 Advisory Alert Banner */}
        <div className="px-4 py-2 bg-[var(--surface-muted)] border-b border-[var(--border)] text-xs text-[var(--text-secondary)] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[var(--status-warning)] shrink-0" />
            <span className="text-[11px]">
              <strong className="text-[var(--text-primary)]">PDF Sync Not Connected in Phase 1</strong> — In Phase 3, NoteNest connects to Supabase Storage and renders the exact original PDF with synchronized page scrolling and highlights.
            </span>
          </div>
          <button
            onClick={() => showToast('info', 'Phase 3 Feature', 'Cloud PDF storage and real-time page sync')}
            className="text-[11px] text-[var(--accent)] hover:underline shrink-0 hidden sm:inline font-medium"
          >
            Details &rarr;
          </button>
        </div>

        {/* Mock PDF Canvas Area */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-[var(--canvas)] flex justify-center items-start">
          <div
            style={{ width: `${zoomLevel}%`, maxWidth: '760px' }}
            className="bg-[var(--surface)] text-[var(--text-primary)] rounded-md shadow-[var(--shadow-modal)] p-8 sm:p-12 space-y-6 font-serif leading-relaxed border border-[var(--border)] relative select-none transition-all duration-150"
          >
            {/* Mock PDF header watermark */}
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3 text-xs text-[var(--text-muted)] font-sans">
              <span>NoteNest Ingested Study Document</span>
              <span>Page {pageNumber} &bull; Section 2.4</span>
            </div>

            {/* Document Content Mockup */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold font-sans text-[var(--text-primary)]">
                {pdfModalTopic.title}
              </h2>

              <p className="text-xs text-[var(--text-secondary)] font-sans italic">
                From original source: {selectedDocument?.title || 'Lecture Compendium'} ({pdfModalTopic.pageReference || 'Pages 14-26'})
              </p>

              {/* Highlighted text block simulating semantic chunking */}
              <div className="p-3.5 rounded bg-[var(--selection)] border-l-4 border-[var(--accent)] text-xs text-[var(--text-primary)] space-y-1.5 font-sans">
                <span className="text-[10px] uppercase font-mono font-semibold tracking-wider text-[var(--accent)] block">
                  Synchronized Topic Citation Block
                </span>
                <p className="italic">
                  &quot;{pdfModalTopic.summary}&quot;
                </p>
              </div>

              <div className="space-y-3 text-xs text-[var(--text-secondary)] leading-6 font-sans">
                <p>
                  This view simulates how users in Phase 3 can cross-reference their digital study notes directly against the original professor slides, textbook PDFs, or research papers. Clicking a citation anchor in the topic reader will immediately bring this PDF viewport to the corresponding page and draw a bounding box around the key paragraph.
                </p>
                <p>
                  Because NoteNest stores the full original document in high-fidelity vector PDF format, students never lose context or formatting, even when reviewing condensed flashcards and examination cheatsheets.
                </p>
              </div>

              {/* Mock Diagram / Code representation in PDF */}
              <div className="p-3.5 rounded border border-[var(--border)] bg-[var(--surface-muted)] font-mono text-[11px] text-[var(--text-primary)]">
                <div className="text-[10px] text-[var(--text-muted)] mb-1 font-sans">Figure 2.1: Architectural Flow</div>
                <code>[Client Request] -&gt; [DispatcherServlet] -&gt; [HandlerAdapter] -&gt; [Controller]</code>
              </div>
            </div>

            <div className="pt-6 border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--text-muted)] font-sans">
              <span>NoteNest Technical Reference</span>
              <span>Doc ID: {selectedDocument?.id}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-[var(--surface)] border-t border-[var(--border)] text-xs text-[var(--text-secondary)] flex items-center justify-between">
          <span className="font-mono text-[11px] text-[var(--text-muted)]">
            Phase 1 Mock View &bull; Supabase Storage in Phase 2/3
          </span>
          <button
            onClick={closePdfModal}
            className="px-3 py-1.5 rounded-md bg-[var(--surface-muted)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-medium transition"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}
