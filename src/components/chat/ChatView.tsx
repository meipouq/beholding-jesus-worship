import React, { useState, useRef, useEffect } from 'react';
import {
  MessageCircle,
  Send,
  Paperclip,
  Smile,
  Reply,
  Image,
  Search,
  Check,
  CheckCheck,
  MoreVertical,
  Play,
  ExternalLink,
  X,
  Users,
  Hash,
  Plus
} from 'lucide-react';
import { useWorship } from '../../context/WorshipContext';
import { ChatMessage, Conversation } from '../../types';

const COMMON_EMOJIS = ['🙏', '❤️', '🔥', '👍', '🎵', '🎉', '👏', '🙌'];

export const ChatView: React.FC = () => {
  const {
    conversations,
    messages,
    activeConversationId,
    setActiveConversationId,
    saveConversation,
    sendMessage,
    toggleReaction,
    currentUser,
    playVideo
  } = useWorship();

  const [inputText, setInputText] = useState('');
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [searchConv, setSearchConv] = useState('');
  const [showEmojiPickerFor, setShowEmojiPickerFor] = useState<string | null>(null);
  const [selectedAttachment, setSelectedAttachment] = useState<{ url: string; name: string; type: 'image' | 'file' } | null>(null);
  const [isCreatingChannel, setIsCreatingChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelDesc, setNewChannelDesc] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeConv = conversations.find(c => c.id === activeConversationId) || conversations[0];

  const convMessages = messages.filter(m => m.conversation_id === activeConv?.id);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [convMessages.length, activeConversationId]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !selectedAttachment) return;

    sendMessage(
      inputText.trim(),
      selectedAttachment ? [selectedAttachment] : undefined,
      replyingTo ? { id: replyingTo.id, sender_name: replyingTo.sender_name, content: replyingTo.content } : undefined
    );

    setInputText('');
    setReplyingTo(null);
    setSelectedAttachment(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be under 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const isImg = file.type.startsWith('image/');
      setSelectedAttachment({
        url: dataUrl,
        name: file.name,
        type: isImg ? 'image' : 'file'
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCreateChannel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;

    const formattedName = newChannelName.trim().startsWith('#')
      ? newChannelName.trim()
      : `#${newChannelName.trim().toLowerCase().replace(/\s+/g, '-')}`;

    const newConv: Conversation = {
      id: `conv-${Date.now()}`,
      name: formattedName,
      description: newChannelDesc.trim() || 'Custom Worship Team Channel',
      is_direct: false,
      unread_count: 0,
      participant_ids: []
    };

    saveConversation(newConv);
    setIsCreatingChannel(false);
    setNewChannelName('');
    setNewChannelDesc('');
  };

  // Check if text has YouTube link
  const extractYouTubeLink = (text: string) => {
    const match = text.match(/(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)[\w-]{11})/);
    return match ? match[1] : null;
  };

  return (
    <div className="h-[calc(100vh-140px)] md:h-[calc(100vh-120px)] bg-white rounded-3xl border border-[#E8E2D7] shadow-soft overflow-hidden flex max-w-7xl mx-auto">
      {/* Left Sidebar: Conversations List */}
      <div className="w-72 sm:w-80 border-r border-stone-200 bg-[#FAF6F0] flex flex-col shrink-0">
        <div className="p-4 border-b border-stone-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-amber-800" />
              <h2 className="text-sm font-bold text-stone-900">Conversations</h2>
            </div>
            <button
              onClick={() => setIsCreatingChannel(true)}
              className="p-1.5 rounded-xl hover:bg-stone-200/70 text-stone-600 hover:text-stone-900 transition-colors flex items-center gap-1 text-[11px] font-semibold"
              title="Create New Channel"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Channel</span>
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchConv}
              onChange={(e) => setSearchConv(e.target.value)}
              placeholder="Search channels..."
              className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-stone-400"
            />
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-2 space-y-1">
          {conversations
            .filter(c => c.name.toLowerCase().includes(searchConv.toLowerCase()))
            .map((c) => {
              const isActive = c.id === activeConv?.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveConversationId(c.id)}
                  className={`w-full text-left p-3 rounded-2xl transition-all flex items-start gap-3 ${
                    isActive
                      ? 'bg-white shadow-soft border border-stone-200/90 text-stone-900 font-bold'
                      : 'hover:bg-white/60 text-stone-700'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    isActive ? 'bg-[#1E1D1B] text-white' : 'bg-stone-200 text-stone-600'
                  }`}>
                    {c.is_direct ? <Users className="w-4 h-4" /> : <Hash className="w-4 h-4" />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold truncate">{c.name}</span>
                      <span className="text-[10px] text-stone-400 shrink-0">{c.last_message_at}</span>
                    </div>
                    <p className="text-[11px] text-stone-500 truncate mt-0.5 font-normal">
                      {c.last_message || 'No messages yet'}
                    </p>
                  </div>
                </button>
              );
            })}
        </div>
      </div>

      {/* Right Main Chat Panel */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Chat Header */}
        <div className="px-5 py-3.5 border-b border-stone-100 flex items-center justify-between bg-white z-10">
          <div>
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
              <span>{activeConv?.name}</span>
            </h3>
            <p className="text-[11px] text-stone-400 mt-0.5 truncate max-w-md">
              {activeConv?.description || 'Active Worship Team Channel'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-stone-400 px-2 py-1 rounded-full bg-stone-100">
              {convMessages.length} Messages
            </span>
          </div>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-[#F8F5EE]/40 flex flex-col">
          {convMessages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-stone-400 my-auto">
              <div className="w-16 h-16 rounded-3xl bg-[#EFE9DF] border border-stone-200 flex items-center justify-center text-stone-500 mb-3 shadow-inner">
                <MessageCircle className="w-8 h-8 text-amber-900/60" />
              </div>
              <h4 className="text-sm font-bold text-stone-800">No messages in {activeConv?.name || 'this channel'} yet</h4>
              <p className="text-xs text-stone-500 max-w-sm mt-1">
                Be the first to say hello! Share setlist ideas, worship links, lyrics notes, or updates with the team.
              </p>
            </div>
          ) : (
            convMessages.map((msg) => {
              const isMe = msg.sender_id === currentUser.id;
              const ytLink = extractYouTubeLink(msg.content);

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 max-w-[85%] sm:max-w-[75%] ${isMe ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                >
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full bg-[#1E1D1B] text-white flex items-center justify-center font-bold text-xs shrink-0 self-end mb-1">
                    {msg.sender_avatar && msg.sender_avatar.length <= 3
                      ? msg.sender_avatar
                      : msg.sender_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>

                  <div className={`space-y-1 ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                    {/* Sender Name & Time */}
                    <div className="flex items-center gap-2 px-1">
                      <span className="text-[11px] font-bold text-stone-700">
                        {isMe ? 'You' : msg.sender_name}
                      </span>
                      <span className="text-[9px] text-stone-400">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Quoted Reply Message if any */}
                    {msg.reply_to && (
                      <div className="text-[10px] px-3 py-1.5 rounded-xl bg-stone-200/70 border-l-2 border-amber-800 text-stone-700 max-w-full truncate">
                        <strong>{msg.reply_to.sender_name}:</strong> {msg.reply_to.content}
                      </div>
                    )}

                    {/* Message Bubble */}
                    <div
                      className={`relative group p-3.5 rounded-2xl text-xs leading-relaxed shadow-soft ${
                        isMe
                          ? 'bg-[#1E1D1B] text-white rounded-br-xs'
                          : 'bg-white text-stone-900 border border-stone-200/90 rounded-bl-xs'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>

                      {/* Image Attachment Preview */}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {msg.attachments.map((att, i) => (
                            <div key={i} className="rounded-xl overflow-hidden border border-stone-300">
                              {att.type === 'image' ? (
                                <img src={att.url} alt={att.name} className="max-h-48 w-full object-cover" />
                              ) : (
                                <div className="p-2 bg-stone-100 text-stone-800 text-[11px] font-medium flex items-center gap-2">
                                  <Paperclip className="w-3.5 h-3.5" />
                                  <span>{att.name}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* YouTube Link Preview Card */}
                      {ytLink && (
                        <div className="mt-2.5 p-2 rounded-xl bg-black/80 text-white flex items-center justify-between gap-2 border border-stone-700">
                          <div className="flex items-center gap-2 truncate">
                            <Play className="w-4 h-4 text-red-500 fill-current shrink-0" />
                            <span className="text-[11px] truncate">{ytLink}</span>
                          </div>
                          <button
                            onClick={() => playVideo('YouTube Reference', ytLink)}
                            className="px-2 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold shrink-0"
                          >
                            Play Video
                          </button>
                        </div>
                      )}

                      {/* Floating Reaction Trigger Button */}
                      <div className="absolute right-0 top-0 -translate-y-1/2 hidden group-hover:flex items-center bg-white rounded-full shadow-md border border-stone-200 px-1 py-0.5 gap-0.5 z-20">
                        <button
                          onClick={() => setReplyingTo(msg)}
                          className="p-1 hover:bg-stone-100 rounded-full text-stone-600"
                          title="Reply"
                        >
                          <Reply className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => setShowEmojiPickerFor(showEmojiPickerFor === msg.id ? null : msg.id)}
                          className="p-1 hover:bg-stone-100 rounded-full text-stone-600"
                          title="React"
                        >
                          <Smile className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Emoji Picker Popup */}
                      {showEmojiPickerFor === msg.id && (
                        <div className="absolute right-0 top-8 bg-white rounded-2xl shadow-modal border border-stone-200 p-2 flex items-center gap-1.5 z-30 animate-fade-in">
                          {COMMON_EMOJIS.map(emoji => (
                            <button
                              key={emoji}
                              onClick={() => {
                                toggleReaction(msg.id, emoji);
                                setShowEmojiPickerFor(null);
                              }}
                              className="text-base p-1 hover:bg-stone-100 rounded-lg transition-transform hover:scale-125"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Reactions Pill Display */}
                    {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                      <div className="flex items-center gap-1 flex-wrap pt-0.5">
                        {Object.entries(msg.reactions).map(([emoji, users]) => (
                          <button
                            key={emoji}
                            onClick={() => toggleReaction(msg.id, emoji)}
                            className={`text-[10px] px-2 py-0.5 rounded-full border flex items-center gap-1 transition-all ${
                              users.includes(currentUser.name)
                                ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                                : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-100'
                            }`}
                            title={`Reacted by: ${users.join(', ')}`}
                          >
                            <span>{emoji}</span>
                            <span>{users.length}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t border-stone-200 bg-white">
          {/* Active Reply Banner */}
          {replyingTo && (
            <div className="mb-2 p-2 rounded-xl bg-stone-100 flex items-center justify-between text-xs text-stone-700">
              <div className="truncate">
                Replying to <strong className="text-stone-900">{replyingTo.sender_name}</strong>: "{replyingTo.content}"
              </div>
              <button onClick={() => setReplyingTo(null)} className="text-stone-400 hover:text-stone-700">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Active Attachment Banner */}
          {selectedAttachment && (
            <div className="mb-2 p-2 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs text-amber-900">
              <div className="flex items-center gap-2 truncate">
                <Image className="w-3.5 h-3.5 text-amber-800" />
                <span className="font-semibold">{selectedAttachment.name}</span>
              </div>
              <button onClick={() => setSelectedAttachment(null)} className="text-stone-400 hover:text-stone-700">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Hidden File Input for Real Attachments */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.txt"
          />

          <form onSubmit={handleSend} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 rounded-2xl hover:bg-stone-100 text-stone-500 hover:text-stone-800 transition-colors"
              title="Attach File or Image"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Message ${activeConv?.name}... (paste YouTube links for instant video preview)`}
              className="flex-1 text-xs py-3 px-4 rounded-2xl border border-stone-200/90 bg-[#F8F5EE]/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-400 transition-all placeholder:text-stone-400"
            />

            <button
              type="submit"
              disabled={!inputText.trim() && !selectedAttachment}
              className="p-3 rounded-2xl bg-[#1E1D1B] hover:bg-stone-800 text-white disabled:opacity-30 disabled:pointer-events-none transition-all shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* New Channel Modal */}
      {isCreatingChannel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-modal border border-stone-200">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Hash className="w-5 h-5 text-amber-800" />
                <h3 className="text-base font-bold text-stone-900">Create New Channel</h3>
              </div>
              <button
                onClick={() => setIsCreatingChannel(false)}
                className="p-1 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateChannel} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Channel Name
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs font-bold">#</span>
                  <input
                    type="text"
                    required
                    value={newChannelName}
                    onChange={(e) => setNewChannelName(e.target.value)}
                    placeholder="e.g. youth-worship or band-rehearsal"
                    className="w-full text-xs pl-7 pr-3 py-2.5 rounded-2xl border border-stone-200 bg-[#FAF6F0] focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Topic / Purpose (Optional)
                </label>
                <input
                  type="text"
                  value={newChannelDesc}
                  onChange={(e) => setNewChannelDesc(e.target.value)}
                  placeholder="What is this channel for?"
                  className="w-full text-xs px-3.5 py-2.5 rounded-2xl border border-stone-200 bg-[#FAF6F0] focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-400"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingChannel(false)}
                  className="px-4 py-2.5 rounded-2xl border border-stone-200 text-xs font-semibold text-stone-600 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newChannelName.trim()}
                  className="px-5 py-2.5 rounded-2xl bg-[#1E1D1B] hover:bg-stone-800 text-white text-xs font-bold shadow-soft disabled:opacity-40"
                >
                  Create Channel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
