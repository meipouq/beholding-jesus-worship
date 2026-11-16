import React, { useState } from 'react';
import { X, Plus, Trash2, Edit2, Tag } from 'lucide-react';
import { SongCategory } from '../../types';
import { useWorship } from '../../context/WorshipContext';

interface CategoryManagerModalProps {
  onClose: () => void;
}

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({ onClose }) => {
  const { categories, saveCategory, deleteCategory } = useWorship();
  const [newCatName, setNewCatName] = useState('');
  const [editingCat, setEditingCat] = useState<SongCategory | null>(null);

  const handleAddOrUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    if (editingCat) {
      saveCategory({
        ...editingCat,
        name: newCatName.trim()
      });
      setEditingCat(null);
    } else {
      saveCategory({
        id: `cat-${Date.now()}`,
        name: newCatName.trim(),
        is_default: false
      });
    }
    setNewCatName('');
  };

  const handleStartEdit = (cat: SongCategory) => {
    setEditingCat(cat);
    setNewCatName(cat.name);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Delete category "${name}"? Existing songs will keep their category text.`)) {
      deleteCategory(id);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-md w-full p-6 shadow-modal border border-stone-200 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-amber-800" />
            <h2 className="text-base font-bold text-stone-900">Manage Worship Categories</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleAddOrUpdate} className="mt-4 flex gap-2">
          <input
            type="text"
            required
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder="New Category (e.g. Call to Worship)"
            className="flex-1 text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-400"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-[#1E1D1B] hover:bg-stone-800 text-white text-xs font-bold transition-colors shrink-0"
          >
            {editingCat ? 'Update' : 'Add'}
          </button>
          {editingCat && (
            <button
              type="button"
              onClick={() => {
                setEditingCat(null);
                setNewCatName('');
              }}
              className="px-3 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs font-bold"
            >
              Cancel
            </button>
          )}
        </form>

        {/* Categories List */}
        <div className="mt-4 space-y-2 max-h-72 overflow-y-auto pr-1">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF6F0] border border-stone-200/80 text-xs"
            >
              <span className="font-semibold text-stone-800">{cat.name}</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleStartEdit(cat)}
                  className="p-1 rounded text-stone-400 hover:text-stone-700 hover:bg-white"
                  title="Rename Category"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(cat.id, cat.name)}
                  className="p-1 rounded text-stone-400 hover:text-red-600 hover:bg-white"
                  title="Delete Category"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
