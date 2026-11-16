import React, { useState } from 'react';
import {
  Settings,
  Database,
  Download,
  Upload,
  RefreshCw,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Save,
  Server,
  CloudUpload,
  CloudDownload,
  FileCode,
  Loader2
} from 'lucide-react';
import { useWorship } from '../../context/WorshipContext';
import { StorageService } from '../../services/storage';
import { testSupabaseConnection, pushAllToSupabase, pullAllFromSupabase } from '../../services/supabase';

export const SettingsView: React.FC = () => {
  const {
    currentUser,
    setIsUserModalOpen,
    exportBackup,
    importBackup,
    resetAllData,
    songs,
    lineups,
    members,
    tasks
  } = useWorship();

  const currentConfig = StorageService.getSupabaseConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(currentConfig.url);
  const [supabaseKey, setSupabaseKey] = useState(currentConfig.key);
  const [connStatus, setConnStatus] = useState<{ testing: boolean; message?: string; success?: boolean } | null>(null);
  const [syncStatus, setSyncStatus] = useState<{ loading: boolean; message?: string; success?: boolean } | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleSaveSupabase = () => {
    StorageService.saveSupabaseConfig({
      url: supabaseUrl.trim(),
      key: supabaseKey.trim()
    });
    alert('Supabase connection configuration saved successfully!');
  };

  const handleTestConnection = async () => {
    setConnStatus({ testing: true });
    const res = await testSupabaseConnection(supabaseUrl.trim(), supabaseKey.trim());
    setConnStatus({ testing: false, success: res.success, message: res.message });
  };

  const handlePushSupabase = async () => {
    setSyncStatus({ loading: true, message: 'Uploading local data to Supabase...' });
    const res = await pushAllToSupabase();
    setSyncStatus({ loading: false, success: res.success, message: res.message });
  };

  const handlePullSupabase = async () => {
    setSyncStatus({ loading: true, message: 'Downloading cloud data from Supabase...' });
    const res = await pullAllFromSupabase();
    setSyncStatus({ loading: false, success: res.success, message: res.message });
    if (res.success) {
      setTimeout(() => window.location.reload(), 1500);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const ok = importBackup(content);
        if (ok) {
          setImportStatus('Backup restored successfully! All data updated.');
        } else {
          setImportStatus('Failed to restore backup: Invalid file format.');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all data to default demo state? Custom added songs and lineups will be replaced.')) {
      resetAllData();
      alert('Application reset to default seed data.');
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="p-2.5 rounded-2xl bg-[#1E1D1B] text-white shadow-2xs">
          <Settings className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900 leading-tight">
            Settings & Database Management
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Account settings, Supabase cloud sync, and backup & recovery tools
          </p>
        </div>
      </div>

      {/* Section 1: Active Member & Open Team Access */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E8E2D7] shadow-soft space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-800" />
            <h2 className="text-sm font-bold text-stone-900">Active Profile & Equal Team Access</h2>
          </div>
          <button
            onClick={() => setIsUserModalOpen(true)}
            className="text-xs font-bold text-amber-800 hover:text-amber-900"
          >
            Switch Profile
          </button>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#1E1D1B] text-white flex items-center justify-center font-bold text-sm shadow-2xs">
              {currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-stone-900">{currentUser.name}</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  Equal Access Active
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                {currentUser.role_title} • Vocal Range: {currentUser.vocal_range} • {currentUser.email}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsUserModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#F8F5EE] hover:bg-stone-200 text-stone-800 text-xs font-bold border border-stone-200"
          >
            Manage Accounts
          </button>
        </div>

        <p className="text-[11px] text-stone-500 bg-[#FAF6F0] p-3 rounded-2xl border border-stone-200/60 leading-relaxed">
          <strong>Open Team Access Principle:</strong> In Beholding Jesus Worship Team, every member can add songs, organize lineups, schedule rehearsals, publish announcements, and update vocal keys without administrative locks. All modifications record your name for transparency.
        </p>
      </div>

      {/* Section 2: Supabase Cloud Database Integration */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E8E2D7] shadow-soft space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
          <Server className="w-5 h-5 text-amber-800" />
          <h2 className="text-sm font-bold text-stone-900">Supabase Cloud Database Synchronization</h2>
        </div>

        <p className="text-xs text-stone-600 leading-relaxed">
          The app works with an offline-first high-speed local engine. If you want cross-device cloud synchronization, configure your Supabase URL and key below.
        </p>

        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block mb-1">
              Supabase Project URL
            </label>
            <input
              type="text"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              placeholder="https://your-project.supabase.co"
              className="w-full text-xs p-3 rounded-2xl border border-stone-300 font-mono focus:outline-none focus:ring-2 focus:ring-stone-400"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block mb-1">
              Supabase Anon / API Key
            </label>
            <input
              type="password"
              value={supabaseKey}
              onChange={(e) => setSupabaseKey(e.target.value)}
              placeholder="Your Supabase key"
              className="w-full text-xs p-3 rounded-2xl border border-stone-300 font-mono focus:outline-none focus:ring-2 focus:ring-stone-400"
            />
          </div>

          {connStatus && (
            <div className={`p-3 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
              connStatus.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
            }`}>
              {connStatus.success ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              <span>{connStatus.testing ? 'Testing connection...' : connStatus.message}</span>
            </div>
          )}

          <div className="flex items-center gap-2 pt-1 flex-wrap">
            <button
              onClick={handleTestConnection}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-stone-100 text-stone-800 text-xs font-bold border border-stone-300 transition-colors"
            >
              Test Connection
            </button>
            <button
              onClick={handleSaveSupabase}
              className="px-5 py-2.5 rounded-xl bg-[#1E1D1B] hover:bg-stone-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save Configuration</span>
            </button>
          </div>

          {/* Cloud Sync Actions */}
          <div className="pt-3 border-t border-stone-200/80 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handlePushSupabase}
                disabled={syncStatus?.loading || !supabaseUrl || !supabaseKey}
                className="px-4 py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold border border-amber-300 flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {syncStatus?.loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CloudUpload className="w-3.5 h-3.5" />}
                <span>Upload Local Data to Supabase</span>
              </button>

              <button
                onClick={handlePullSupabase}
                disabled={syncStatus?.loading || !supabaseUrl || !supabaseKey}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-stone-100 text-stone-800 text-xs font-bold border border-stone-300 flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {syncStatus?.loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CloudDownload className="w-3.5 h-3.5" />}
                <span>Pull Cloud Data from Supabase</span>
              </button>
            </div>
          </div>

          {syncStatus && (
            <div className={`p-3 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
              syncStatus.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-stone-100 text-stone-800 border border-stone-300'
            }`}>
              {syncStatus.loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-amber-700" />
              ) : syncStatus.success ? (
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-700" />
              )}
              <span>{syncStatus.message}</span>
            </div>
          )}
        </div>
      </div>

      {/* Section 3: Backup & Recovery (Zero Data Loss Protection) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E8E2D7] shadow-soft space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
          <Database className="w-5 h-5 text-amber-800" />
          <h2 className="text-sm font-bold text-stone-900">Database Backup & Recovery (Zero Data Loss)</h2>
        </div>

        <p className="text-xs text-stone-600 leading-relaxed">
          Export full JSON snapshots of your complete worship database (songs, custom vocal keys, service lineups, rehearsal calendars, team chat, announcements, and tasks). You can restore this file anytime on any computer or phone!
        </p>

        {importStatus && (
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>{importStatus}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
          {/* Export Box */}
          <div className="p-4 rounded-2xl bg-[#FAF6F0] border border-stone-200 flex flex-col justify-between space-y-3">
            <div>
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">Export Database</h3>
              <p className="text-[11px] text-stone-500 mt-1">
                Download a complete .JSON backup containing {songs.length} songs, {lineups.length} lineups, {members.length} vocalists, and all messages.
              </p>
            </div>
            <button
              onClick={exportBackup}
              className="w-full py-2.5 px-4 rounded-xl bg-[#1E1D1B] hover:bg-stone-800 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-2xs"
            >
              <Download className="w-4 h-4" />
              <span>Download JSON Backup</span>
            </button>
          </div>

          {/* Import Box */}
          <div className="p-4 rounded-2xl bg-[#FAF6F0] border border-stone-200 flex flex-col justify-between space-y-3">
            <div>
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">Restore from Backup</h3>
              <p className="text-[11px] text-stone-500 mt-1">
                Upload a previously exported .JSON backup file to restore your entire worship team library.
              </p>
            </div>
            <label className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-stone-100 text-stone-800 text-xs font-bold flex items-center justify-center gap-2 transition-colors border border-stone-300 cursor-pointer shadow-2xs">
              <Upload className="w-4 h-4 text-stone-600" />
              <span>Choose Backup File...</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Reset to Factory Default */}
        <div className="pt-4 border-t border-stone-100 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h4 className="text-xs font-bold text-stone-800">Reset to Sample Worship Data</h4>
            <p className="text-[11px] text-stone-400">Restore the original sample setlists and songs.</p>
          </div>
          <button
            onClick={handleReset}
            className="px-3.5 py-2 rounded-xl text-stone-500 hover:text-red-600 hover:bg-red-50 text-xs font-semibold border border-stone-200 transition-colors"
          >
            Reset All
          </button>
        </div>
      </div>
    </div>
  );
};
