import React, { useState, useRef } from 'react';
import { X, Check, UserPlus, ShieldCheck, Mail, Phone, Music, Mic, Camera, Upload, User } from 'lucide-react';
import { useWorship } from '../../context/WorshipContext';
import { TeamMember } from '../../types';

export const UserSwitcherModal: React.FC = () => {
  const {
    currentUser,
    setCurrentUser,
    isUserModalOpen,
    setIsUserModalOpen,
    members,
    saveMember
  } = useWorship();

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAvatar, setNewAvatar] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('Vocalist');
  const [newVocalRange, setNewVocalRange] = useState<TeamMember['vocal_range']>('Alto');
  const [newInstrument, setNewInstrument] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isUserModalOpen) return null;

  const handleSelectUser = (member: TeamMember) => {
    setCurrentUser(member);
    setIsUserModalOpen(false);
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Please select an image smaller than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setNewAvatar(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    const newMember: TeamMember = {
      id: `m-${Date.now()}`,
      name: newName.trim(),
      email: newEmail.trim(),
      avatar: newAvatar.trim() || newName.trim().split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
      role_title: newRole.trim() || 'Worship Team Member',
      vocal_range: newVocalRange,
      instrument: newInstrument.trim() || 'Vocals',
      availability: 'Available',
      joined_at: new Date().toISOString().slice(0, 10)
    };

    saveMember(newMember);
    setCurrentUser(newMember);
    setIsAddingNew(false);
    setIsUserModalOpen(false);
    setNewName('');
    setNewAvatar('');
    setNewEmail('');
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
      onClick={() => setIsUserModalOpen(false)}
    >
      <div
        className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-modal border border-stone-200 animate-slide-up max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-700" />
              <h2 className="text-lg font-bold text-stone-900">Open Team Access</h2>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Every member has equal full access. Switch active profile or join the team below.
            </p>
          </div>
          <button
            onClick={() => setIsUserModalOpen(false)}
            className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Currently Active Member Highlight */}
        <div className="my-4 p-3.5 bg-[#FAF6F0] rounded-2xl border border-[#EDE3D3] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1E1D1B] text-white flex items-center justify-center font-bold text-sm overflow-hidden shrink-0 shadow-2xs">
              {currentUser.avatar && currentUser.avatar.includes('/') ? (
                <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
              ) : (
                currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-stone-900">{currentUser.name}</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                  Active Profile
                </span>
              </div>
              <p className="text-[11px] text-stone-500">{currentUser.role_title} • {currentUser.vocal_range}</p>
            </div>
          </div>
        </div>

        {/* Member List */}
        {!isAddingNew ? (
          <div>
            <div className="flex items-center justify-between my-3">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
                Worship Team Members ({members.length})
              </span>
              <button
                onClick={() => setIsAddingNew(true)}
                className="text-xs font-semibold text-amber-800 hover:text-amber-900 flex items-center gap-1"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add Member</span>
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {members.map((member) => {
                const isSelected = member.id === currentUser.id;
                return (
                  <button
                    key={member.id}
                    onClick={() => handleSelectUser(member)}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'bg-[#1E1D1B] text-white border-[#1E1D1B] shadow-xs'
                        : 'bg-white border-stone-200/90 hover:bg-stone-50 text-stone-800'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden ${
                        isSelected ? 'bg-white text-stone-900' : 'bg-[#EDE7DB] text-stone-700'
                      }`}>
                        {member.avatar && member.avatar.includes('/') ? (
                          <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                        ) : (
                          member.name.split(' ').map(n => n[0]).join('').slice(0, 2)
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate">{member.name}</div>
                        <div className={`text-[11px] truncate ${isSelected ? 'text-stone-300' : 'text-stone-500'}`}>
                          {member.role_title} • {member.vocal_range}
                        </div>
                      </div>
                    </div>

                    {isSelected ? (
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <span className="text-[10px] text-stone-400 shrink-0 font-medium">Switch</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* Add New Member Form */
          <form onSubmit={handleCreateMember} className="space-y-3.5 pt-2">
            <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
              Add New Team Member
            </h3>

            {/* Profile Picture Upload */}
            <div className="flex items-center gap-3 p-3 bg-[#FAF6F0] rounded-2xl border border-stone-200/80">
              <div className="w-12 h-12 rounded-2xl bg-[#1E1D1B] text-white flex items-center justify-center font-bold text-sm overflow-hidden shrink-0 shadow-2xs border-2 border-white">
                {newAvatar ? (
                  <img src={newAvatar} alt="Profile preview" className="w-full h-full object-cover" />
                ) : newName.trim() ? (
                  newName.trim().split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                ) : (
                  <User className="w-5 h-5 text-stone-400" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <span className="text-[11px] font-bold text-stone-800 uppercase tracking-wider block">
                  Profile Picture
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarFileChange}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1 rounded-xl bg-white hover:bg-stone-50 text-stone-800 text-[11px] font-semibold border border-stone-200 shadow-2xs flex items-center gap-1"
                  >
                    <Upload className="w-3 h-3 text-stone-600" />
                    <span>{newAvatar ? 'Change Photo' : 'Upload Photo'}</span>
                  </button>
                  {newAvatar && (
                    <button
                      type="button"
                      onClick={() => setNewAvatar('')}
                      className="text-[11px] text-stone-500 hover:text-red-600"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-medium text-stone-600 block mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Maria Clara"
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-400"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-stone-600 block mb-1">Email</label>
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="maria@beholdingjesus.org"
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-stone-600 block mb-1">Role Title</label>
                <input
                  type="text"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  placeholder="Vocalist"
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-stone-600 block mb-1">Vocal Range</label>
                <select
                  value={newVocalRange}
                  onChange={(e) => setNewVocalRange(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-400 bg-white"
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
            </div>

            <div>
              <label className="text-[11px] font-medium text-stone-600 block mb-1">Instrument (Optional)</label>
              <input
                type="text"
                value={newInstrument}
                onChange={(e) => setNewInstrument(e.target.value)}
                placeholder="Acoustic Guitar / Vocals"
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-400"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#1E1D1B] text-white hover:bg-stone-800"
              >
                Save & Switch
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
