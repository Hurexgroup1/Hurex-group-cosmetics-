import React, { useState, useRef, useEffect } from 'react';
import { SavedDocument } from '../types';
import { 
  FileText, 
  Image as ImageIcon, 
  Plus, 
  Search, 
  Trash2, 
  Download, 
  Eye, 
  Calendar, 
  Clock, 
  Filter, 
  ArrowUpDown, 
  UploadCloud, 
  FileCode, 
  X,
  FileSpreadsheet
} from 'lucide-react';

interface GalleryProps {
  documents: SavedDocument[];
  onAddDocument: (doc: Omit<SavedDocument, 'id'>) => void;
  onDeleteDocument: (id: string) => void;
}

export default function Gallery({ documents, onAddDocument, onDeleteDocument }: GalleryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc'); // default: newest first
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<SavedDocument | null>(null);

  // Form states for new document
  const [docName, setDocName] = useState('');
  const [docCategory, setDocCategory] = useState('Risiti/Malipo');
  const [docDescription, setDocDescription] = useState('');
  const [fileBase64, setFileBase64] = useState<string>('');
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState('pdf');
  const [fileSize, setFileSize] = useState('0 KB');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Available Categories
  const categories = ['all', 'Risiti/Malipo', 'Invoisi', 'Mikataba', 'Leseni/Kodi', 'Mengineyo'];

  // Convert File to Base64
  const handleFileChange = (file: File) => {
    setFileName(file.name);
    // Get file extension
    const ext = file.name.split('.').pop()?.toLowerCase() || 'pdf';
    setFileType(ext);
    
    // Format size
    const sizeInMB = file.size / (1024 * 1024);
    if (sizeInMB >= 1) {
      setFileSize(`${sizeInMB.toFixed(1)} MB`);
    } else {
      setFileSize(`${(file.size / 1024).toFixed(0)} KB`);
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setFileBase64(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);

    // Auto fill name if empty
    if (!docName) {
      // remove extension from name
      const cleanName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      setDocName(cleanName);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileChange(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName) {
      alert('Tafadhali weka jina la hati (document name)');
      return;
    }

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0]; // HH:MM:SS

    onAddDocument({
      name: docName,
      category: docCategory,
      fileType: fileType,
      fileSize: fileSize || 'Kiasi Kidogo',
      date: dateStr,
      time: timeStr,
      description: docDescription,
      fileData: fileBase64 || undefined
    });

    // Reset fields
    setDocName('');
    setDocCategory('Risiti/Malipo');
    setDocDescription('');
    setFileBase64('');
    setFileName('');
    setFileType('pdf');
    setFileSize('0 KB');
    setIsAddModalOpen(false);
  };

  // Filter and sort documents
  const filteredDocs = documents
    .filter(doc => {
      const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (doc.description && doc.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      // Sort primarily by date + time combination
      const dateTimeA = new Date(`${a.date}T${a.time}`).getTime();
      const dateTimeB = new Date(`${b.date}T${b.time}`).getTime();
      
      if (sortOrder === 'desc') {
        return dateTimeB - dateTimeA; // Newest first
      } else {
        return dateTimeA - dateTimeB; // Oldest first
      }
    });

  // Icon chooser helper
  const getFileIcon = (type: string) => {
    const t = type.toLowerCase();
    if (['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(t)) {
      return <ImageIcon className="w-8 h-8 text-emerald-500" />;
    }
    if (['xls', 'xlsx', 'csv'].includes(t)) {
      return <FileSpreadsheet className="w-8 h-8 text-blue-500" />;
    }
    if (['doc', 'docx', 'txt', 'pdf'].includes(t)) {
      return <FileText className="w-8 h-8 text-rose-500" />;
    }
    return <FileCode className="w-8 h-8 text-amber-500" />;
  };

  // Human readable date formatting in Swahili
  const formatSwahiliDate = (dateStr: string, timeStr: string) => {
    try {
      const dt = new Date(`${dateStr}T${timeStr}`);
      return dt.toLocaleDateString('sw-TZ', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      }) + ` Saa ${timeStr.substring(0, 5)}`;
    } catch (e) {
      return `${dateStr} ${timeStr}`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header section with spacious padding and clean fonts */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-zinc-150 dark:border-zinc-800">
        <div>
          <h2 className="text-xl font-black text-zinc-800 dark:text-white uppercase tracking-tight">Nyumba ya Nyaraka (Documents Gallery)</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Maktaba safi ya kuhifadhia risiti, mikataba na leseni za duka kwa mpangilio wa saa na tarehe.</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Hifadhi Hati Mpya
        </button>
      </div>

      {/* Spacious, uncrowded filters and search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 border border-zinc-100 dark:border-zinc-800 rounded-2xl">
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
            <Search className="w-4 h-4 text-zinc-400" />
          </span>
          <input
            type="text"
            placeholder="Tafuta nyaraka kwa jina au maelezo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-700 dark:text-zinc-300 focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Sort order toggle button with Swahili text */}
          <button
            onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
            className="flex items-center gap-1.5 px-3 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-bold transition cursor-pointer"
            title={sortOrder === 'desc' ? 'Inapanga: Mpya zaidi kwanza' : 'Inapanga: Zamani zaidi kwanza'}
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-blue-500" />
            <span>{sortOrder === 'desc' ? 'Mpya Kwanza' : 'Zamani Kwanza'}</span>
          </button>

          {/* Filter Categories */}
          <div className="flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-850 p-1 rounded-xl border border-zinc-200/50 dark:border-zinc-750">
            <span className="px-2 text-[10px] text-zinc-400 font-bold uppercase tracking-wider hidden sm:inline">Kundi:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent border-none text-xs font-bold text-zinc-700 dark:text-zinc-300 py-1 px-2.5 focus:outline-hidden focus:ring-0 cursor-pointer"
            >
              <option value="all">Makundi Yote</option>
              {categories.slice(1).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Gallery layout: Clean, generous spacing, uncrowded cards */}
      {filteredDocs.length === 0 ? (
        <div className="text-center py-24 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl space-y-4">
          <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-850 rounded-2xl flex items-center justify-center mx-auto text-zinc-300 dark:text-zinc-600">
            <FileText className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Hakuna nyaraka zilizopatikana</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">Safi kabisa! Hifadhi risiti, mikataba au picha za kodi hapa ili uweze kuzipata kirahisi wakati wowote.</p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Hifadhi Hati ya Kwanza
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocs.map((doc) => (
            <div 
              key={doc.id}
              className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 hover:border-blue-500/30 dark:hover:border-blue-400/20 hover:shadow-lg dark:hover:shadow-none rounded-2xl transition duration-300 overflow-hidden flex flex-col justify-between group"
            >
              <div className="p-5 space-y-4">
                {/* Top card bar */}
                <div className="flex items-start justify-between gap-3">
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl group-hover:bg-blue-50 dark:group-hover:bg-blue-950/20 transition-colors">
                    {getFileIcon(doc.fileType)}
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2.5 py-1 bg-zinc-50 dark:bg-zinc-800/80 text-[10px] text-zinc-500 dark:text-zinc-400 font-bold rounded-lg uppercase tracking-wider border border-zinc-100/50 dark:border-zinc-800">
                      {doc.category}
                    </span>
                    <span className="block text-[10px] text-zinc-400 dark:text-zinc-500 font-bold mt-1.5">{doc.fileSize} • {doc.fileType.toUpperCase()}</span>
                  </div>
                </div>

                {/* Main Name & Description */}
                <div className="space-y-1">
                  <h3 className="text-xs font-black text-zinc-800 dark:text-zinc-200 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" title={doc.name}>
                    {doc.name}
                  </h3>
                  <p className="text-[11px] text-zinc-400 dark:text-zinc-500 line-clamp-2 leading-relaxed min-h-[32px]">
                    {doc.description || 'Hakuna maelezo yoyote yaliyowekwa kwenye hati hii.'}
                  </p>
                </div>

                {/* Precise chronological sorting indicators (muda na siku) */}
                <div className="pt-3 border-t border-zinc-50 dark:border-zinc-800/50 flex flex-wrap gap-y-1.5 gap-x-3 text-[10px] text-zinc-500 dark:text-zinc-400 font-bold">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{doc.date}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-blue-500" />
                    <span>{doc.time}</span>
                  </span>
                </div>
              </div>

              {/* Card Footer Actions - spacious and simple */}
              <div className="px-5 py-3.5 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-100/80 dark:border-zinc-800/60 flex items-center justify-between gap-2">
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setPreviewDoc(doc)}
                    className="p-2 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 rounded-lg border border-zinc-200/50 dark:border-zinc-700/60 transition cursor-pointer"
                    title="Angalia Hati (Preview)"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  {doc.fileData && (
                    <a
                      href={doc.fileData}
                      download={`${doc.name}.${doc.fileType}`}
                      className="p-2 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 rounded-lg border border-zinc-200/50 dark:border-zinc-700/60 transition flex items-center justify-center cursor-pointer"
                      title="Pakua (Download)"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                <button
                  onClick={() => {
                    if (confirm(`Je, una uhakika unataka kufuta hati hii "${doc.name}"?`)) {
                      onDeleteDocument(doc.id);
                    }
                  }}
                  className="p-2 bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-lg border border-rose-100/10 transition cursor-pointer"
                  title="Futa Kabisa"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col text-xs">
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-800/10">
              <div>
                <span className="text-[10px] bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-md uppercase font-bold">{previewDoc.category}</span>
                <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase mt-1">{previewDoc.name}</h3>
              </div>
              <button 
                onClick={() => setPreviewDoc(null)}
                className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 flex-1 flex flex-col items-center justify-center min-h-[250px] bg-zinc-50 dark:bg-zinc-950">
              {previewDoc.fileData ? (
                ['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(previewDoc.fileType.toLowerCase()) ? (
                  <div className="relative max-h-[380px] w-full overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-center bg-white dark:bg-zinc-900">
                    <img 
                      src={previewDoc.fileData} 
                      alt={previewDoc.name} 
                      className="max-h-[360px] max-w-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="text-center p-8 space-y-4">
                    <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-3xl flex items-center justify-center mx-auto text-blue-500">
                      {getFileIcon(previewDoc.fileType)}
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Faili la aina ya .{previewDoc.fileType.toUpperCase()}</h4>
                      <p className="text-zinc-400">Aina hii ya faili hauwezi kuiangalia hapa moja kwa moja.</p>
                    </div>
                    <a
                      href={previewDoc.fileData}
                      download={`${previewDoc.name}.${previewDoc.fileType}`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      Pakua Kwenye Kifaa
                    </a>
                  </div>
                )
              ) : (
                <div className="text-center p-8 space-y-4">
                  <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-3xl flex items-center justify-center mx-auto text-zinc-400">
                    <FileText className="w-10 h-10" />
                  </div>
                  <h4 className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Hati haina faili lililohifadhiwa</h4>
                  <p className="text-zinc-400 max-w-xs mx-auto">Hati hii ilihifadhiwa kama kumbukumbu tu bila kuambatanisha faili halisi.</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 space-y-2.5">
              <div className="text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                <span className="font-bold text-zinc-800 dark:text-zinc-200 block">Maelezo:</span>
                {previewDoc.description || 'Hakuna maelezo yaliyowekwa kwenye hati hii.'}
              </div>
              <div className="flex justify-between items-center text-[10px] text-zinc-400 dark:text-zinc-500 font-bold pt-1">
                <span>Imesajiliwa: {formatSwahiliDate(previewDoc.date, previewDoc.time)}</span>
                <span>Ukubwa: {previewDoc.fileSize}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Document Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col text-xs">
            <div className="p-4 border-b border-zinc-150 dark:border-zinc-850 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-800/10">
              <h3 className="text-xs font-black uppercase text-zinc-900 dark:text-white tracking-wider flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-blue-500" />
                Hifadhi Nyaraka Mpya
              </h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Drag & Drop File Zone */}
              <div>
                <label className="block text-zinc-400 font-bold uppercase text-[9px] tracking-wider mb-1.5">Pakia Faili / Document:</label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
                    isDragging 
                      ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-950/15' 
                      : fileName 
                        ? 'border-emerald-500 bg-emerald-50/10 dark:bg-emerald-950/5' 
                        : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-850'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileInput}
                    className="hidden"
                    accept=".pdf,.png,.jpg,.jpeg,.webp,.csv,.xlsx,.xls,.docx,.doc,.txt"
                  />
                  {fileName ? (
                    <div className="space-y-1.5">
                      <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                        {getFileIcon(fileType)}
                      </div>
                      <p className="font-bold text-xs text-zinc-800 dark:text-zinc-200 truncate max-w-xs mx-auto">{fileName}</p>
                      <p className="text-[10px] text-zinc-400 font-semibold uppercase">{fileSize} • .{fileType.toUpperCase()}</p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFileName('');
                          setFileBase64('');
                          setFileType('pdf');
                          setFileSize('0 KB');
                        }}
                        className="text-[10px] text-rose-500 hover:underline font-bold mt-1"
                      >
                        Ondoa faili
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1.5 text-zinc-500">
                      <UploadCloud className="w-8 h-8 text-zinc-400 dark:text-zinc-600 mx-auto" />
                      <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Buruta faili hapa au bofya kuchagua</p>
                      <p className="text-[9px] text-zinc-400">Inaruhusu: PDF, picha (PNG, JPG), Excel, Word (Max 15MB)</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Jina la Hati (Document Name) *</label>
                <input
                  type="text"
                  required
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  placeholder="Mfano: Risiti ya Kodi ya Pango Juni 2026"
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 text-zinc-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Kundi la Hati (Category) *</label>
                  <select
                    value={docCategory}
                    onChange={(e) => setDocCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 text-zinc-800 dark:text-white"
                  >
                    {categories.slice(1).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Maelezo/Kumbukumbu (Description)</label>
                <textarea
                  value={docDescription}
                  onChange={(e) => setDocDescription(e.target.value)}
                  rows={3}
                  placeholder="Weka maelezo ya ziada k.m. malipo yalifanywa kwa benki gani, n.k..."
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 text-zinc-800 dark:text-white"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800 justify-end">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-750 rounded-xl transition cursor-pointer"
                >
                  Ghairi
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition shadow-xs cursor-pointer"
                >
                  Hifadhi Hati
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
