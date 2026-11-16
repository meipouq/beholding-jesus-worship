import React, { useState } from 'react';
import { Search, Bell, ChevronDown, UserCircle2, X } from 'lucide-react';
import { useWorship } from '../../context/WorshipContext';
import { Logo } from './Logo';
import { NotificationCenter } from './NotificationCenter';

export const Header: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    currentUser,
    setIsUserModalOpen,
    unreadNotifCount,
    setActiveModule,
    songs,
    members
  } = useWorship();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Search filter
  const trimmedSearch = searchQuery.trim().toLowerCase();
  const matchedSongs = trimmedSearch
    ? songs.filter(s => s.title.toLowerCase().includes(trimmedSearch) || s.artist.toLowerCase().includes(trimmedSearch)).slice(0, 5)
    : [];
  const matchedMembers = trimmedSearch
    ? members.filter(m => m.name.toLowerCase().includes(trimmedSearch) || m.role_title.toLowerCase().includes(trimmedSearch)).slice(0, 3)
    : [];

  const userInitials = currentUser.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-20 bg-[#F8F5EE]/95 backdrop-blur-md px-4 md:px-8 py-3.5 border-b border-[#E8E2D7] no-print">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Mobile Logo Brand */}
        <div className="flex md:hidden items-center">
          <Logo variant="dark" size="sm" showText={true} />
        </div>

        {/* Desktop Search Bar */}
        <div className="hidden md:flex flex-1 max-w-xl relative">
          <div className="w-full relative flex items-center">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => setShowSearchResults(true)}
              placeholder="Search songs, members, or features..."
              className="w-full bg-[#EDE7DB]/80 hover:bg-[#EDE7DB] focus:bg-white text-stone-800 text-[13.5px] pl-10 pr-9 py-2 rounded-full border border-transparent focus:border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-200 transition-all placeholder:text-stone-400"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setShowSearchResults(false);
                }}
                className="absolute right-3 text-stone-400 hover:text-stone-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Search Dropdown Preview */}
          {showSearchResults && trimmedSearch && (
            <div
              className="absolute left-0 right-0 top-12 bg-white rounded-2xl shadow-modal border border-stone-200 p-3 z-50 animate-slide-up"
              onMouseLeave={() => setShowSearchResults(false)}
            >
              {matchedSongs.length === 0 && matchedMembers.length === 0 ? (
                <div className="py-4 text-center text-xs text-stone-400">
                  No matching songs or members found for "{searchQuery}"
                </div>
              ) : (
                <div className="space-y-3">
                  {matchedSongs.length > 0 && (
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 px-2 mb-1">
                        Songs ({matchedSongs.length})
                      </div>
                      <div className="space-y-1">
                        {matchedSongs.map(s => (
                          <button
                            key={s.id}
                            onClick={() => {
                              setActiveModule('songs');
                              setShowSearchResults(false);
                            }}
                            className="w-full text-left flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-[#F8F5EE] text-xs text-stone-700"
                          >
                            <span className="font-medium text-stone-900">{s.title}</span>
                            <span className="text-stone-400 text-[11px]">{s.category} • Key {s.original_key}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {matchedMembers.length > 0 && (
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 px-2 mb-1">
                        Team Members ({matchedMembers.length})
                      </div>
                      <div className="space-y-1">
                        {matchedMembers.map(m => (
                          <button
                            key={m.id}
                            onClick={() => {
                              setActiveModule('vocalists');
                              setShowSearchResults(false);
                            }}
                            className="w-full text-left flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-[#F8F5EE] text-xs text-stone-700"
                          >
                            <span className="font-medium text-stone-900">{m.name}</span>
                            <span className="text-stone-400 text-[11px]">{m.role_title}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Section: Notifications & User Profile */}
        <div className="flex items-center gap-2.5 md:gap-3.5 relative">
          {/* Notification Button */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="p-2 rounded-full hover:bg-stone-200/60 text-stone-700 transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-[#F8F5EE]">
                  {unreadNotifCount}
                </span>
              )}
            </button>

            {/* Notification Modal Drawer */}
            {isNotifOpen && (
              <NotificationCenter onClose={() => setIsNotifOpen(false)} />
            )}
          </div>

          {/* User Profile / Auth Button */}
          <button
            onClick={() => setIsUserModalOpen(true)}
            className="flex items-center gap-2 py-1 px-1.5 sm:px-2.5 rounded-full hover:bg-stone-200/70 border border-stone-200/80 transition-all bg-white/70 shadow-2xs group"
            title="Account Portal • Log In / Register"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#1E1D1B] text-white flex items-center justify-center text-xs font-bold tracking-wider shrink-0 overflow-hidden shadow-2xs">
              {currentUser.avatar && currentUser.avatar.includes('/') ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                userInitials
              )}
            </div>

            <div className="hidden sm:block text-left min-w-0 pr-1">
              <p className="text-xs font-bold text-stone-900 truncate leading-tight group-hover:text-amber-900 transition-colors">
                {currentUser.name}
              </p>
              <p className="text-[10px] text-amber-800 font-semibold truncate">
                {currentUser.username ? `@${currentUser.username}` : 'Worship Author'}
              </p>
            </div>

            <ChevronDown className="w-3.5 h-3.5 text-stone-500 group-hover:text-stone-900 transition-colors shrink-0" />
          </button>
        </div>
      </div>
    </header>
  );
};
