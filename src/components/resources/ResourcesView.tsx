import React, { useState } from 'react';
import {
  FolderOpen,
  Plus,
  FileText,
  Download,
  Trash2,
  Calendar,
  User,
  Music,
  ExternalLink,
  X
} from 'lucide-react';
import { useWorship } from '../../context/WorshipContext';
import { WorshipResource } from '../../types';

export const ResourcesView: React.FC = () => {
  const { resources, saveResource, deleteResource, currentUser } = useWorship();
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<WorshipResource['category']>('Chord Charts');
  const [fileType, setFileType] = useState('PDF');
  const [notes, setNotes] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newRes: WorshipResource = {
      id: `res-${Date.now()}`,
      title: title.trim(),
      category,
      file_url: '#',
      file_type: fileType,
      file_size: '1.4 MB',
      notes: notes.trim() || undefined,
      uploaded_by: currentUser.name,
      created_at: new Date().toISOString().slice(0, 10)
    };

    saveResource(newRes);
    setIsAdding(false);
    setTitle('');
    setNotes('');
  };

  return (
    <div className="space-y-5 pb-20 md:pb-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-[#1E1D1B] text-white shadow-2xs">
            <FolderOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-stone-900 leading-tight">
              Files & Resources
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Chord charts packets, stage plots, backing tracks, guidelines, and audio reference documents
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#1E1D1B] hover:bg-stone-800 text-white text-xs font-bold shadow-soft transition-all shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Resource</span>
        </button>
      </div>

      {/* Grid of Files */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {resources.map((res) => (
          <div
            key={res.id}
            className="bg-white rounded-3xl p-5 border border-[#E8E2D7] shadow-soft hover:shadow-card transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-stone-100">
                <span className="px-2.5 py-0.5 rounded-lg bg-[#EFE8DC] text-stone-800 text-[10px] font-bold uppercase tracking-wider">
                  {res.category}
                </span>

                <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 text-[10px] font-bold">
                  {res.file_type} • {res.file_size}
                </span>
              </div>

              <div className="mt-3 flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FAF6F0] border border-stone-200 text-amber-900 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-stone-900 leading-snug">
                    {res.title}
                  </h3>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Uploaded by {res.uploaded_by} • {res.created_at}
                  </p>
                </div>
              </div>

              {res.notes && (
                <p className="text-xs text-stone-600 mt-3 bg-[#FAF6F0] p-2.5 rounded-xl border border-stone-200/60 leading-relaxed italic">
                  "{res.notes}"
                </p>
              )}
            </div>

            <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between">
              <button
                onClick={() => alert(`Downloading "${res.title}"...`)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1E1D1B] hover:bg-stone-800 text-white text-xs font-bold transition-all shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>

              <button
                onClick={() => {
                  if (window.confirm(`Delete resource "${res.title}"?`)) {
                    deleteResource(res.id);
                  }
                }}
                className="p-1.5 rounded-xl text-stone-400 hover:text-red-600 hover:bg-red-50"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Modal */}
      {isAdding && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsAdding(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-modal border border-stone-200 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-amber-800" />
                <h2 className="text-base font-bold text-stone-900">Upload Team Resource</h2>
              </div>
              <button
                onClick={() => setIsAdding(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="mt-4 space-y-3.5">
              <div>
                <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block mb-1">
                  Document Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Sunday Lineup Chord Charts Packet"
                  className="w-full text-xs p-3 rounded-2xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-400 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full text-xs p-3 rounded-2xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-400 bg-white"
                  >
                    <option value="Chord Charts">Chord Charts</option>
                    <option value="Vocal Guide">Vocal Guide</option>
                    <option value="Audio Track">Audio Track</option>
                    <option value="Stage Plot">Stage Plot</option>
                    <option value="Policy / Guidelines">Policy / Guidelines</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block mb-1">
                    File Type
                  </label>
                  <select
                    value={fileType}
                    onChange={(e) => setFileType(e.target.value)}
                    className="w-full text-xs p-3 rounded-2xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-400 bg-white font-bold"
                  >
                    <option value="PDF">PDF</option>
                    <option value="PNG">PNG Image</option>
                    <option value="MP3">MP3 Audio</option>
                    <option value="DOCX">Word DOCX</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block mb-1">
                  Notes / Description
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Contains all 5 songs transposed to Sunday vocal keys."
                  className="w-full text-xs p-3 rounded-2xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-400"
                />
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl text-xs font-bold bg-[#1E1D1B] hover:bg-stone-800 text-white"
                >
                  Save Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
