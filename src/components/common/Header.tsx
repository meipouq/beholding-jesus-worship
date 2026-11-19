import React, { useState } from 'react';
import { Search, Bell, ChevronDown, UserCircle2, X } from 'lucide-react';
import { useWorship } from '../../context/WorshipContext';
import { Logo } from './Logo';
import { NotificationCenter } from './NotificationCenter';
import { NotificationSettingsModal } from '../settings/NotificationSettingsModal';

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
  const [isNotifSettingsOpen, setIsNotifSettingsOpen] = useState(false);
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
    <header className="sticky top-0 z-30 bg-[#100E0B]/95 backdrop-blur-xl px-4 md:px-8 py-3 border-b border-[#393027] shadow-[0_4px_20px_rgba(0,0,0,0.5)] no-print transition-all">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Mobile Logo Brand */}
        <div className="flex md:hidden items-center">
          <Logo variant="dark" size="sm" showText={true} />
        </div>

        {/* Desktop Search Bar */}
        <div className="hidden md:flex flex-1 max-w-xl relative">
          <div className="w-full relative flex items-center group">
            <Search className="w-4 h-4 text-[#B8ADA0] group-focus-within:text-[#E5AF45] absolute left-3.5 pointer-events-none transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => setShowSearchResults(true)}
              placeholder="Search songs, members, keys or features..."
              className="w-full bg-[#181510] hover:bg-[#211C17] focus:bg-[#211C17] text-[#FFF5E6] text-[13.5px] font-medium pl-10 pr-14 py-2.5 rounded-2xl border border-[#393027] focus:border-[#E5AF45] focus:outline-none focus:ring-4 focus:ring-[#E5AF45]/15 shadow-2xs transition-all placeholder:text-[#B8ADA0]/60"
            />
            {searchQuery ? (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setShowSearchResults(false);
                }}
                className="absolute right-3 p-1 rounded-lg text-[#B8ADA0] hover:text-[#FFF5E6] hover:bg-[#29231C] transition-colors"
                title="Clear Search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span className="hidden lg:inline-flex items-center absolute right-3 text-[10px] font-extrabold text-[#B8ADA0] bg-[#29231C] px-1.5 py-0.5 rounded-md border border-[#393027] pointer-events-none">
                ⌘K
              </span>
            )}
          </div>

          {/* Quick Search Dropdown Preview */}
          {showSearchResults && trimmedSearch && (
            <div
              className="absolute left-0 right-0 top-12 bg-[#211C17] rounded-3xl shadow-modal border border-[#393027] p-3.5 z-50 animate-slide-up"
              onMouseLeave={() => setShowSearchResults(false)}
            >
              {matchedSongs.length === 0 && matchedMembers.length === 0 ? (
                <div className="py-5 text-center text-xs text-[#B8ADA0] font-medium">
                  No matching songs or members found for "{searchQuery}"
                </div>
              ) : (
                <div className="space-y-3">
                  {matchedSongs.length > 0 && (
                    <div>
                      <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#E5AF45] px-2 mb-1.5">
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
                            className="w-full text-left flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#29231C] text-xs text-[#B8ADA0] transition-colors group/item"
                          >
                            <span className="font-bold text-[#FFF5E6] group-hover/item:text-[#E5AF45] transition-colors">{s.title}</span>
                            <span className="text-[#B8ADA0] text-[11px] font-semibold">{s.category} • Key {s.original_key}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {matchedMembers.length > 0 && (
                    <div>
                      <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#E5AF45] px-2 mb-1.5">
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
                            className="w-full text-left flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#29231C] text-xs text-[#B8ADA0] transition-colors group/item"
                          >
                            <span className="font-bold text-[#FFF5E6] group-hover/item:text-[#E5AF45] transition-colors">{m.name}</span>
                            <span className="text-[#B8ADA0] text-[11px] font-semibold">{m.role_title}</span>
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
        <div className="flex items-center gap-2.5 sm:gap-3 relative">
          {/* Notification Button */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="w-10 h-10 rounded-2xl bg-[#211C17] hover:bg-[#29231C] text-[#FFF5E6] border border-[#393027] hover:border-[#E5AF45]/50 shadow-2xs transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center relative group cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-[18px] h-[18px] text-[#FFF5E6] group-hover:text-[#FFC85C] transition-colors" />
              {unreadNotifCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#E57373] text-[#100E0B] text-[10px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-xs ring-2 ring-[#100E0B]">
                  {unreadNotifCount}
                </span>
              )}
            </button>

            {/* Notification Modal Drawer */}
            {isNotifOpen && (
              <NotificationCenter
                onClose={() => setIsNotifOpen(false)}
                onOpenSettings={() => {
                  setIsNotifOpen(false);
                  setIsNotifSettingsOpen(true);
                }}
              />
            )}
          </div>

          {/* Dedicated Notification Settings Modal */}
          <NotificationSettingsModal
            isOpen={isNotifSettingsOpen}
            onClose={() => setIsNotifSettingsOpen(false)}
          />

          {/* User Profile / Auth Button */}
          <button
            onClick={() => setIsUserModalOpen(true)}
            className="flex items-center gap-2.5 py-1.5 pl-1.5 pr-3 sm:pr-3.5 rounded-2xl bg-[#211C17] hover:bg-[#29231C] border border-[#393027] hover:border-[#E5AF45]/60 shadow-2xs transition-all duration-200 active:scale-[0.98] group cursor-pointer"
            title="Account Portal • Log In / Switch Account"
          >
            <div className="w-8 h-8 rounded-xl bg-[#181510] border border-[#393027] flex items-center justify-center text-xs font-black tracking-wider shrink-0 overflow-hidden shadow-2xs ring-1 ring-[#E5AF45]/40 group-hover:ring-[#E5AF45] transition-all">
              <img
                src={currentUser.avatar && currentUser.avatar.includes('/') ? currentUser.avatar : '/images/worship_team_profile.png'}
                alt={currentUser.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/worship_team_profile.png';
                }}
              />
            </div>

            <div className="hidden sm:block text-left min-w-0 pr-0.5">
              <p className="text-xs font-extrabold text-[#FFF5E6] group-hover:text-[#FFC85C] transition-colors leading-tight truncate">
                {currentUser.name}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#79BB8B] shadow-[0_0_6px_rgba(120,184,135,0.7)] animate-pulse inline-block" />
                <span className="text-[10px] text-[#E5AF45] font-bold truncate">
                  {currentUser.username ? `@${currentUser.username}` : 'Worship Author'}
                </span>
              </div>
            </div>

            <ChevronDown className="w-3.5 h-3.5 text-[#B8ADA0] group-hover:text-[#E5AF45] group-hover:translate-y-0.5 transition-all shrink-0 ml-0.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
