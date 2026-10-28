import React, { useState, useRef } from 'react';
import {
  FileText,
  Upload,
  Download,
  BookOpen,
  Search,
  Eye,
  Trash2,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  FileCode,
  Sparkles,
  Check,
  Clock,
  User,
  Layers,
  ArrowRight
} from 'lucide-react';
import { DashboardState, PdfDocument } from '../types';

interface PdfLibraryViewProps {
  state: DashboardState;
  dispatchAction: (action: string, payload: any) => Promise<any>;
}

export const PdfLibraryView: React.FC<PdfLibraryViewProps> = ({
  state,
  dispatchAction
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDoc, setActiveDoc] = useState<PdfDocument | null>(null);
  const [activePage, setActivePage] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [docSearch, setDocSearch] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const documents: PdfDocument[] = state.documents || [];

  // Filter documents
  const filteredDocs = documents.filter((doc) => {
    const matchesCategory =
      selectedCategory === 'all'
        ? true
        : selectedCategory === 'custom'
        ? doc.isCustom
        : doc.category.toLowerCase() === selectedCategory.toLowerCase();

    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.author.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      return;
    }

    setIsUploading(true);
    setUploadProgress(20);

    const reader = new FileReader();
    reader.onload = async (event) => {
      setUploadProgress(80);
      const base64Data = event.target?.result as string;

      const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
      const estPages = Math.max(1, Math.round(file.size / 65000));

      const newDoc: Partial<PdfDocument> = {
        title: file.name.replace(/\.pdf$/i, ''),
        category: 'Personal',
        fileSize: `${sizeInMb} MB`,
        pages: estPages,
        author: state.user?.name || 'Kitso Motlashuping',
        readingTime: `${Math.max(2, Math.round(estPages * 1.5))} min`,
        description: `Imported PDF document: ${file.name}. Stored in local applet cache with zero latency.`,
        isCustom: true,
        fileData: base64Data,
        contentSections: [
          {
            heading: '1. Executive Briefing & Synopsis',
            text: `This PDF document was uploaded by ${state.user?.name || 'Kitso Motlashuping'} on ${new Date().toLocaleDateString()}. The native binary stream has been processed and indexed for immediate in-app viewing and synchronized reference across connected devices.`
          },
          {
            heading: '2. Document Telemetry & Index',
            text: `Total file size: ${sizeInMb} MB. Estimated layout pages: ${estPages}. Embedded vector previewer is active.`
          }
        ]
      };

      await dispatchAction('ADD_DOCUMENT', newDoc);
      setIsUploading(false);
      setUploadProgress(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };

    reader.readAsDataURL(file);
  };

  const handleDeleteDoc = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeDoc?.id === id) {
      setActiveDoc(null);
    }
    await dispatchAction('DELETE_DOCUMENT', { id });
  };

  const handleOpenDoc = (doc: PdfDocument) => {
    setActiveDoc(doc);
    setActivePage(1);
    setZoomLevel(100);
    setDocSearch('');
  };

  const downloadDocument = (doc: PdfDocument) => {
    if (doc.fileData) {
      const link = document.createElement('a');
      link.href = doc.fileData;
      link.download = `${doc.title}.pdf`;
      link.click();
    } else {
      // Create synthetic PDF / Markdown text download
      const textContent = `${doc.title}\nAuthor: ${doc.author}\nDate: ${doc.uploadedAt}\n\n${doc.contentSections.map(s => `${s.heading}\n\n${s.text}`).join('\n\n---\n\n')}`;
      const blob = new Blob([textContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${doc.title.replace(/\s+/g, '_')}.txt`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 select-none animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 uppercase tracking-wider mb-1">
            <span>Library</span>
            <span>·</span>
            <span className="text-rose-400">PDF Document Hub</span>
            <span>·</span>
            <span>Offline Ready</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif text-white font-normal tracking-tight">
            Executive Document Library & Reader
          </h1>
          <p className="text-xs text-neutral-400 mt-1 max-w-xl">
            Browse architecture specs, operations manuals, and import your own PDFs.
            Integrated with full in-app reader, pagination, and cross-device sync.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="application/pdf,.pdf"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500 hover:bg-rose-600 text-xs font-semibold text-white shadow-sm transition active:scale-95 disabled:opacity-50"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{isUploading ? `Uploading ${uploadProgress || 0}%...` : 'Upload PDF'}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-[#12151b] border border-white/[0.06] rounded-full self-start">
          {[
            { id: 'all', label: 'All Documents' },
            { id: 'Architecture', label: 'Architecture' },
            { id: 'Manual', label: 'Manuals' },
            { id: 'Strategy', label: 'Strategy' },
            { id: 'Report', label: 'Reports' },
            { id: 'custom', label: 'Uploaded PDFs' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                selectedCategory === cat.id
                  ? 'bg-white/[0.12] text-white shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.03]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search documents by keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#12151b] border border-white/[0.07] rounded-full pl-9 pr-4 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-hidden focus:border-rose-500/60"
          />
        </div>
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            onClick={() => handleOpenDoc(doc)}
            className="bg-[#101318] border border-white/[0.07] hover:border-white/[0.16] rounded-2xl p-5 cursor-pointer transition-all flex flex-col justify-between group hover:shadow-xl hover:shadow-black/40"
          >
            <div>
              {/* Header Badges */}
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-neutral-300">
                  <FileText className="w-3 h-3 text-rose-400" />
                  <span>{doc.category}</span>
                </span>
                <span className="text-[10px] font-mono text-neutral-400">
                  {doc.fileSize} · {doc.pages} {doc.pages === 1 ? 'page' : 'pages'}
                </span>
              </div>

              {/* Title & Description */}
              <h3 className="text-base font-medium text-white tracking-tight mt-3 group-hover:text-rose-300 transition-colors line-clamp-2">
                {doc.title}
              </h3>
              <p className="text-xs text-neutral-400 mt-2 line-clamp-3 leading-relaxed">
                {doc.description}
              </p>
            </div>

            {/* Footer Metadata & Actions */}
            <div className="pt-4 border-t border-white/[0.05] mt-4 flex items-center justify-between text-[11px] text-neutral-400 font-mono">
              <div className="flex items-center gap-2">
                <span className="text-neutral-300 truncate max-w-[120px]">{doc.author}</span>
                <span>·</span>
                <span>{doc.readingTime}</span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadDocument(doc);
                  }}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.05] transition"
                  title="Download file"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
                {doc.isCustom && (
                  <button
                    onClick={(e) => handleDeleteDoc(doc.id, e)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-white/[0.05] transition"
                    title="Delete custom document"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <div className="w-7 h-7 rounded-full bg-white/[0.04] group-hover:bg-rose-500/20 text-neutral-400 group-hover:text-rose-300 flex items-center justify-center transition">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredDocs.length === 0 && (
          <div className="col-span-full bg-[#101318] border border-white/[0.06] rounded-2xl p-12 text-center">
            <FileText className="w-8 h-8 text-neutral-400 mx-auto mb-3 opacity-40" />
            <h3 className="text-base font-medium text-white">No documents found</h3>
            <p className="text-xs text-neutral-400 mt-1">
              {searchQuery ? `No documents matched "${searchQuery}".` : 'No documents in this category yet.'}
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 px-4 py-1.5 rounded-full bg-rose-500 hover:bg-rose-600 text-xs font-semibold text-white transition"
            >
              Upload PDF Now
            </button>
          </div>
        )}
      </div>

      {/* Full-Screen PDF Document Reader Modal */}
      {activeDoc && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col animate-in fade-in">
          {/* Reader Top Bar */}
          <div className="h-14 bg-[#0e1116] border-b border-white/[0.08] px-6 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setActiveDoc(null)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.06] transition"
                title="Back to library"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-white truncate max-w-md">
                    {activeDoc.title}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.05] text-neutral-400">
                    PDF · {activeDoc.fileSize}
                  </span>
                </div>
                <div className="text-[10px] text-neutral-400 font-mono">
                  By {activeDoc.author} · {activeDoc.readingTime} read
                </div>
              </div>
            </div>

            {/* Viewer Controls */}
            <div className="flex items-center gap-3">
              {/* Zoom Controls */}
              <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.06] rounded-full p-0.5 text-xs text-neutral-300 font-mono">
                <button
                  onClick={() => setZoomLevel((prev) => Math.max(70, prev - 10))}
                  className="p-1 rounded-full hover:bg-white/[0.08] transition"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="px-2">{zoomLevel}%</span>
                <button
                  onClick={() => setZoomLevel((prev) => Math.min(150, prev + 10))}
                  className="p-1 rounded-full hover:bg-white/[0.08] transition"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Download Button */}
              <button
                onClick={() => downloadDocument(activeDoc)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-xs font-mono text-neutral-200 transition"
                title="Download document"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Download</span>
              </button>

              {/* Close Button */}
              <button
                onClick={() => setActiveDoc(null)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.06] transition"
                title="Close viewer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Reader Canvas Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center bg-[#07080a]">
            {activeDoc.fileData ? (
              // Embedded Base64 PDF Preview
              <div
                className="w-full max-w-4xl bg-[#12151b] border border-white/[0.1] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
              >
                <iframe
                  src={activeDoc.fileData}
                  title={activeDoc.title}
                  className="w-full h-[750px] border-none"
                />
              </div>
            ) : (
              // Structured High-Fidelity Executive PDF Layout
              <div
                className="w-full max-w-3xl bg-[#0f1217] border border-white/[0.1] rounded-2xl p-8 sm:p-12 shadow-2xl space-y-8 transition-transform duration-150"
                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
              >
                {/* PDF Header Sheet */}
                <div className="border-b border-white/[0.08] pb-6">
                  <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 uppercase tracking-widest">
                    <span>Mission Control Technical Spec</span>
                    <span>Classified: Internal Strategy</span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-serif text-white mt-3 font-normal tracking-tight">
                    {activeDoc.title}
                  </h1>
                  <div className="flex items-center gap-4 mt-3 text-xs text-neutral-400 font-mono">
                    <span>Lead Author: <strong className="text-white">{activeDoc.author}</strong></span>
                    <span>·</span>
                    <span>Updated: {activeDoc.uploadedAt}</span>
                    <span>·</span>
                    <span>Target Reading: {activeDoc.readingTime}</span>
                  </div>
                </div>

                {/* Abstract Callout */}
                <div className="p-4 rounded-xl bg-white/[0.02] border-l-2 border-rose-500 text-xs text-neutral-300 leading-relaxed italic">
                  "{activeDoc.description}"
                </div>

                {/* Content Sections */}
                <div className="space-y-6">
                  {activeDoc.contentSections.map((sec, idx) => (
                    <div key={idx} className="space-y-2">
                      <h2 className="text-base font-semibold text-white tracking-tight">
                        {sec.heading}
                      </h2>
                      <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-sans">
                        {sec.text}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Document Footer Signature */}
                <div className="pt-8 border-t border-white/[0.08] flex items-center justify-between text-[11px] text-neutral-400 font-mono">
                  <span>OmniSync PDF Hub · Node Verified</span>
                  <span>End of Document</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
