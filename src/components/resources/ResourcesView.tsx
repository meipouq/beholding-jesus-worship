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
          <div className="p-2.5 rounded-2xl bg-[#181510] border border-[#393027] text-[#E5AF45] shadow-sm">
            <FolderOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#FFF5E6] leading-tight">
              Files & Resources
            </h1>
            <p className="text-xs text-[#B8ADA0] mt-0.5">
              Chord charts packets, stage plots, backing tracks, guidelines, and audio reference documents
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#E5AF45] to-[#D69F35] hover:from-[#FFC85C] hover:to-[#E5AF45] text-[#100E0B] text-xs font-black shadow-[0_4px_16px_rgba(229,175,69,0.25)] hover:shadow-[0_6px_22px_rgba(229,175,69,0.38)] transition-all shrink-0 self-start sm:self-auto active:scale-95 cursor-pointer"
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
            className="bg-[#211C17] rounded-3xl p-5 border border-[#393027] hover:border-[#E5AF45]/50 shadow-sm transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-[#393027]">
                <span className="px-2.5 py-0.5 rounded-lg bg-[#29231C] text-[#E5AF45] border border-[#393027] text-[10px] font-bold uppercase tracking-wider">
                  {res.category}
                </span>

                <span className="px-2 py-0.5 rounded-md bg-[#100E0B] text-[#B8ADA0] border border-[#393027] text-[10px] font-bold">
                  {res.file_type} • {res.file_size}
                </span>
              </div>

              <div className="mt-3 flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#181510] border border-[#393027] text-[#E5AF45] flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-[#FFF5E6] leading-snug">
                    {res.title}
                  </h3>
                  <p className="text-[11px] text-[#B8ADA0] mt-0.5">
                    Uploaded by {res.uploaded_by} • {res.created_at}
                  </p>
                </div>
              </div>

              {res.notes && (
                <p className="text-xs text-[#B8ADA0] mt-3 bg-[#181510] p-2.5 rounded-xl border border-[#393027] leading-relaxed italic">
                  "{res.notes}"
                </p>
              )}
            </div>

            <div className="pt-4 mt-4 border-t border-[#393027] flex items-center justify-between">
              <button
                onClick={() => alert(`Downloading "${res.title}"...`)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E5AF45] hover:bg-[#FFC85C] text-[#100E0B] text-xs font-bold transition-all shadow-sm"
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
                className="p-1.5 rounded-xl text-[#B8ADA0] hover:text-[#E57373] hover:bg-red-950/30"
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
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsAdding(false)}
        >
          <div
            className="bg-[#211C17] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#393027] animate-slide-up text-[#FFF5E6]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#393027]">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-[#E5AF45]" />
                <h2 className="text-base font-bold text-[#FFF5E6]">Upload Team Resource</h2>
              </div>
              <button
                onClick={() => setIsAdding(false)}
                className="p-1 rounded-full text-[#B8ADA0] hover:text-[#FFF5E6] hover:bg-[#29231C]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="mt-4 space-y-3.5">
              <div>
                <label className="text-[11px] font-bold text-[#B8ADA0] uppercase tracking-wider block mb-1">
                  Document Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Sunday Lineup Chord Charts Packet"
                  className="w-full text-xs p-3 rounded-2xl border border-[#393027] bg-[#181510] text-[#FFF5E6] focus:outline-none focus:border-[#E5AF45] font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-[#B8ADA0] uppercase tracking-wider block mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full text-xs p-3 rounded-2xl border border-[#393027] bg-[#181510] text-[#FFF5E6] focus:outline-none focus:border-[#E5AF45]"
                  >
                    <option value="Chord Charts" className="bg-[#211C17] text-[#FFF5E6]">Chord Charts</option>
                    <option value="Vocal Guide" className="bg-[#211C17] text-[#FFF5E6]">Vocal Guide</option>
                    <option value="Audio Track" className="bg-[#211C17] text-[#FFF5E6]">Audio Track</option>
                    <option value="Stage Plot" className="bg-[#211C17] text-[#FFF5E6]">Stage Plot</option>
                    <option value="Policy / Guidelines" className="bg-[#211C17] text-[#FFF5E6]">Policy / Guidelines</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#B8ADA0] uppercase tracking-wider block mb-1">
                    File Type
                  </label>
                  <select
                    value={fileType}
                    onChange={(e) => setFileType(e.target.value)}
                    className="w-full text-xs p-3 rounded-2xl border border-[#393027] bg-[#181510] text-[#E5AF45] focus:outline-none focus:border-[#E5AF45] font-bold"
                  >
                    <option value="PDF" className="bg-[#211C17] text-[#E5AF45]">PDF</option>
                    <option value="PNG" className="bg-[#211C17] text-[#E5AF45]">PNG Image</option>
                    <option value="MP3" className="bg-[#211C17] text-[#E5AF45]">MP3 Audio</option>
                    <option value="DOCX" className="bg-[#211C17] text-[#E5AF45]">Word DOCX</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#B8ADA0] uppercase tracking-wider block mb-1">
                  Notes / Description
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Contains all 5 songs transposed to Sunday vocal keys."
                  className="w-full text-xs p-3 rounded-2xl border border-[#393027] bg-[#181510] text-[#FFF5E6] placeholder:text-[#B8ADA0]/50 focus:outline-none focus:border-[#E5AF45]"
                />
              </div>

              <div className="pt-3 border-t border-[#393027] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#B8ADA0] hover:text-[#FFF5E6] hover:bg-[#29231C]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl text-xs font-bold bg-[#E5AF45] hover:bg-[#FFC85C] text-[#100E0B] shadow-sm"
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
