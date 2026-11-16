import React, { useState, useRef } from 'react';
import { X, Mic, User, Camera, Upload, Trash2 } from 'lucide-react';
import { TeamMember } from '../../types';

interface VocalistModalProps {
  vocalist: TeamMember | null;
  onClose: () => void;
  onSave: (member: TeamMember) => void;
}

export const VocalistModal: React.FC<VocalistModalProps> = ({ vocalist, onClose, onSave }) => {
  const [name, setName] = useState(vocalist?.name || '');
  const [avatar, setAvatar] = useState(vocalist?.avatar || '');
  const [email, setEmail] = useState(vocalist?.email || '');
  const [roleTitle, setRoleTitle] = useState(vocalist?.role_title || 'Vocalist');
  const [vocalRange, setVocalRange] = useState<TeamMember['vocal_range']>(vocalist?.vocal_range || 'Alto');
  const [instrument, setInstrument] = useState(vocalist?.instrument || 'Vocals');
  const [availability, setAvailability] = useState<TeamMember['availability']>(vocalist?.availability || 'Available');
  const [phone, setPhone] = useState(vocalist?.phone || '');
  const [notes, setNotes] = useState(vocalist?.notes || '');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Please select an image smaller than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setAvatar(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const saved: TeamMember = {
      id: vocalist?.id || `m-${Date.now()}`,
      name: name.trim(),
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '.')}@beholdingjesus.org`,
      avatar: avatar.trim() || name.trim().split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
      role_title: roleTitle.trim() || 'Vocalist',
      vocal_range: vocalRange,
      instrument: instrument.trim() || 'Vocals',
      availability,
      phone: phone.trim() || undefined,
      notes: notes.trim() || undefined,
      joined_at: vocalist?.joined_at || new Date().toISOString().slice(0, 10)
    };

    onSave(saved);
    onClose();
  };

  const initials = name.trim()
    ? name.trim().split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'BJ';

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-modal border border-stone-200 animate-slide-up max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <Mic className="w-5 h-5 text-amber-800" />
            <h2 className="text-base font-bold text-stone-900">
              {vocalist ? 'Edit Vocalist Profile' : 'Add New Vocalist'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Profile Picture Uploader */}
          <div className="flex items-center gap-4 p-3.5 bg-[#FAF6F0] rounded-2xl border border-stone-200/80">
            <div className="relative group shrink-0">
              <div className="w-16 h-16 rounded-2xl bg-[#1E1D1B] text-white flex items-center justify-center font-bold text-lg overflow-hidden border-2 border-white shadow-soft">
                {avatar ? (
                  <img src={avatar} alt="Profile preview" className="w-full h-full object-cover" />
                ) : (
                  <span>{initials}</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/40 text-white rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                title="Change Photo"
              >
                <Camera className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 min-w-0">
              <span className="text-[11px] font-bold text-stone-800 uppercase tracking-wider block">
                Profile Picture
              </span>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Upload a personal headshot or photo (JPG, PNG).
              </p>

              <div className="flex items-center gap-2 mt-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageFileChange}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-stone-50 text-stone-800 text-xs font-semibold border border-stone-200/90 shadow-2xs flex items-center gap-1.5 transition-all"
                >
                  <Upload className="w-3.5 h-3.5 text-stone-600" />
                  <span>{avatar ? 'Change Photo' : 'Upload Photo'}</span>
                </button>

                {avatar && (
                  <button
                    type="button"
                    onClick={() => setAvatar('')}
                    className="px-2.5 py-1.5 rounded-xl text-stone-500 hover:text-red-600 hover:bg-red-50 text-xs font-medium transition-all"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sarah Joy Morales"
              className="w-full text-xs p-3 rounded-2xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-400 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block mb-1">
                Vocal Range *
              </label>
              <select
                value={vocalRange}
                onChange={(e) => setVocalRange(e.target.value as any)}
                className="w-full text-xs p-3 rounded-2xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-400 bg-white font-bold"
              >
                <option value="Soprano">Soprano</option>
                <option value="Mezzo-Soprano">Mezzo-Soprano</option>
                <option value="Alto">Alto</option>
                <option value="Tenor">Tenor</option>
                <option value="Baritone">Baritone</option>
                <option value="Bass">Bass</option>
                <option value="Instrumentalist">Instrumentalist</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block mb-1">
                Availability Status
              </label>
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value as any)}
                className="w-full text-xs p-3 rounded-2xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-400 bg-white font-medium"
              >
                <option value="Available">Available</option>
                <option value="Rehearsal Only">Rehearsal Only</option>
                <option value="Traveling">Traveling</option>
                <option value="On Break">On Break</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block mb-1">
                Role / Title
              </label>
              <input
                type="text"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                placeholder="Worship Leader / Vocalist"
                className="w-full text-xs p-3 rounded-2xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-400"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block mb-1">
                Instrument(s)
              </label>
              <input
                type="text"
                value={instrument}
                onChange={(e) => setInstrument(e.target.value)}
                placeholder="Vocals, Keys, Acoustic"
                className="w-full text-xs p-3 rounded-2xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sarah@beholdingjesus.org"
                className="w-full text-xs p-3 rounded-2xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-400"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block mb-1">
                Phone / Mobile
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+63 912 345 6789"
                className="w-full text-xs p-3 rounded-2xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-400"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block mb-1">
              Vocal Notes / Comfortable Range
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Sings best in Key C or D. Great with high soprano ad-libs."
              className="w-full text-xs p-3 rounded-2xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-400"
            />
          </div>

          <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-2xl text-xs font-bold bg-[#1E1D1B] hover:bg-stone-800 text-white transition-colors shadow-2xs"
            >
              {vocalist ? 'Save Changes' : 'Add Vocalist'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
