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
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#211C17] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#393027] animate-slide-up text-[#FFF5E6]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#393027]">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-[#E5AF45]" />
            <h2 className="text-base font-bold text-[#FFF5E6]">Manage Worship Categories</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#B8ADA0] hover:text-[#FFF5E6] hover:bg-[#29231C]"
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
            className="flex-1 text-xs p-2.5 rounded-xl border border-[#393027] bg-[#181510] text-[#FFF5E6] placeholder:text-[#B8ADA0]/50 focus:outline-none focus:border-[#E5AF45]"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-[#E5AF45] hover:bg-[#FFC85C] text-[#100E0B] text-xs font-bold transition-colors shrink-0 shadow-sm"
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
              className="px-3 py-2.5 rounded-xl bg-[#29231C] hover:bg-[#393027] text-[#FFF5E6] text-xs font-bold"
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
              className="flex items-center justify-between p-2.5 rounded-xl bg-[#181510] border border-[#393027] text-xs"
            >
              <span className="font-semibold text-[#FFF5E6]">{cat.name}</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleStartEdit(cat)}
                  className="p-1 rounded text-[#B8ADA0] hover:text-[#E5AF45] hover:bg-[#29231C]"
                  title="Rename Category"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(cat.id, cat.name)}
                  className="p-1 rounded text-[#B8ADA0] hover:text-[#E57373] hover:bg-[#29231C]"
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
