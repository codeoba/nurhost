import React, { useState } from 'react';
import { 
  FolderPlus, 
  UploadCloud, 
  FolderUp, 
  Mic, 
  HardDrive, 
  Users, 
  Clock, 
  Star, 
  Link2, 
  Trash2, 
  Plus, 
  ChevronRight, 
  ChevronDown, 
  Folder, 
  Database,
  Sparkles,
  PieChart,
  FileCode
} from 'lucide-react';
import { STORAGE_STATS } from '../mockData';

export default function Sidebar({ 
  activeNav, 
  setActiveNav, 
  folders, 
  files = [],
  currentFolderId, 
  setCurrentFolderId,
  onOpenUpload,
  onOpenNewFolder,
  onOpenPricing,
  onOpenMonaco,
  onOpenStorageAnalytics
}) {
  const [showNewMenu, setShowNewMenu] = useState(false);
  const [expandFolders, setExpandFolders] = useState(true);

  // Compute live real storage stats from uploaded files
  const totalUsedBytes = (files || []).reduce((acc, f) => acc + Number(f.size || 0), 0);
  const totalLimitBytes = 16106127360; // 15 GB
  const usedMB = (totalUsedBytes / (1024 * 1024)).toFixed(1);
  const totalGB = (totalLimitBytes / (1024 * 1024 * 1024)).toFixed(0);
  const percentage = Math.min(100, ((totalUsedBytes / totalLimitBytes) * 100)).toFixed(1);

  return (
    <aside style={{
      width: '260px',
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '20px 16px',
      height: '100%',
      userSelect: 'none',
      flexShrink: 0
    }}>
      {/* Top Action & Navigation */}
      <div>
        {/* + NEW Upload Button */}
        <div style={{ position: 'relative', marginBottom: '24px' }}>
          <button
            onClick={() => setShowNewMenu(!showNewMenu)}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '12px 18px',
              fontSize: '15px',
              fontWeight: '700',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
          >
            <Plus size={20} strokeWidth={2.5} /> New Upload
          </button>

          {showNewMenu && (
            <div className="glass-panel animate-slide-up" style={{
              position: 'absolute',
              top: '52px',
              left: 0,
              right: 0,
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--modal-shadow)',
              padding: '6px',
              zIndex: 60
            }}>
              <button
                onClick={() => { onOpenUpload(); setShowNewMenu(false); }}
                className="btn btn-ghost"
                style={{ width: '100%', justifyContent: 'flex-start', fontSize: '13px', padding: '10px 12px' }}
              >
                <UploadCloud size={16} color="var(--accent-primary)" /> Upload Files
              </button>
              <button
                onClick={() => { onOpenUpload(); setShowNewMenu(false); }}
                className="btn btn-ghost"
                style={{ width: '100%', justifyContent: 'flex-start', fontSize: '13px', padding: '10px 12px' }}
              >
                <FolderUp size={16} color="var(--accent-cyan)" /> Upload Folder
              </button>
              <div style={{ height: '1px', background: 'var(--border-color)', margin: '4px 0' }} />
              <button
                onClick={() => { onOpenNewFolder(); setShowNewMenu(false); }}
                className="btn btn-ghost"
                style={{ width: '100%', justifyContent: 'flex-start', fontSize: '13px', padding: '10px 12px' }}
              >
                <FolderPlus size={16} color="var(--accent-amber)" /> New Folder
              </button>
              {onOpenMonaco && (
                <button
                  onClick={() => { onOpenMonaco(); setShowNewMenu(false); }}
                  className="btn btn-ghost"
                  style={{ width: '100%', justifyContent: 'flex-start', fontSize: '13px', padding: '10px 12px' }}
                >
                  <FileCode size={16} color="#818cf8" /> New Code/Text File (Monaco)
                </button>
              )}
            </div>
          )}
        </div>

        {/* Navigation Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {/* My Drive */}
          <div>
            <div
              onClick={() => {
                setActiveNav('drive');
                setCurrentFolderId(null);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                background: activeNav === 'drive' && currentFolderId === null ? 'var(--accent-primary-light)' : 'transparent',
                color: activeNav === 'drive' && currentFolderId === null ? 'var(--accent-primary)' : 'var(--text-primary)',
                fontWeight: activeNav === 'drive' && currentFolderId === null ? '700' : '500',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <HardDrive size={18} /> My Drive
              </div>
              <span 
                onClick={(e) => { e.stopPropagation(); setExpandFolders(!expandFolders); }}
                style={{ display: 'flex', alignItems: 'center', padding: '2px' }}
              >
                {expandFolders ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </span>
            </div>

            {/* Folder Tree Submenu */}
            {expandFolders && (
              <div style={{ paddingLeft: '28px', marginTop: '2px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {folders.map((folder) => (
                  <div
                    key={folder.id}
                    onClick={() => {
                      setActiveNav('drive');
                      setCurrentFolderId(folder.id);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '7px 10px',
                      borderRadius: 'var(--radius-sm)',
                      background: currentFolderId === folder.id ? 'var(--bg-tertiary)' : 'transparent',
                      color: currentFolderId === folder.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                      fontSize: '13px',
                      cursor: 'pointer',
                      fontWeight: currentFolderId === folder.id ? '600' : '400'
                    }}
                  >
                    <Folder size={15} color={folder.color || 'var(--accent-primary)'} />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {folder.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Shared With Me */}
          <div
            onClick={() => { setActiveNav('shared'); setCurrentFolderId(null); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              background: activeNav === 'shared' ? 'var(--accent-primary-light)' : 'transparent',
              color: activeNav === 'shared' ? 'var(--accent-primary)' : 'var(--text-primary)',
              fontWeight: activeNav === 'shared' ? '700' : '500',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            <Users size={18} /> Shared with me
          </div>

          {/* Recent */}
          <div
            onClick={() => { setActiveNav('recent'); setCurrentFolderId(null); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              background: activeNav === 'recent' ? 'var(--accent-primary-light)' : 'transparent',
              color: activeNav === 'recent' ? 'var(--accent-primary)' : 'var(--text-primary)',
              fontWeight: activeNav === 'recent' ? '700' : '500',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            <Clock size={18} /> Recent
          </div>

          {/* Starred */}
          <div
            onClick={() => { setActiveNav('starred'); setCurrentFolderId(null); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              background: activeNav === 'starred' ? 'var(--accent-primary-light)' : 'transparent',
              color: activeNav === 'starred' ? 'var(--accent-primary)' : 'var(--text-primary)',
              fontWeight: activeNav === 'starred' ? '700' : '500',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            <Star size={18} color="#f59e0b" /> Starred
          </div>

          {/* Public Share Links */}
          <div
            onClick={() => { setActiveNav('public-links'); setCurrentFolderId(null); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              background: activeNav === 'public-links' ? 'var(--accent-primary-light)' : 'transparent',
              color: activeNav === 'public-links' ? 'var(--accent-primary)' : 'var(--text-primary)',
              fontWeight: activeNav === 'public-links' ? '700' : '500',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            <Link2 size={18} color="var(--accent-cyan)" /> Public Links
          </div>

          {/* Trash */}
          <div
            onClick={() => { setActiveNav('trash'); setCurrentFolderId(null); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              background: activeNav === 'trash' ? 'var(--accent-primary-light)' : 'transparent',
              color: activeNav === 'trash' ? 'var(--accent-primary)' : 'var(--text-primary)',
              fontWeight: activeNav === 'trash' ? '700' : '500',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            <Trash2 size={18} /> Trash
          </div>
        </div>
      </div>

      {/* Storage Breakdown Meter Widget */}
      <div
        onClick={onOpenStorageAnalytics}
        style={{
          background: 'var(--bg-tertiary)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          border: '1px solid var(--border-color)',
          cursor: onOpenStorageAnalytics ? 'pointer' : 'default',
          transition: 'border-color 0.2s ease'
        }}
        title="View Storage Analytics"
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>
            <Database size={16} color="var(--accent-primary)" /> Storage
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>
            {percentage}%
          </span>
        </div>

        {/* Multi-color Progress Bar */}
        <div style={{
          height: '8px',
          width: '100%',
          background: 'var(--border-color)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
          display: 'flex',
          marginBottom: '10px'
        }}>
          {STORAGE_STATS.breakdown.map((item, idx) => (
            <div
              key={idx}
              style={{
                width: `${item.percent}%`,
                background: item.color,
                height: '100%'
              }}
              title={`${item.label}: ${item.sizeFormatted}`}
            />
          ))}
        </div>

        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
          <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{usedMB} MB</span> of {totalGB} GB used
        </p>

        <button
          onClick={onOpenPricing}
          className="btn btn-secondary"
          style={{ width: '100%', fontSize: '12px', padding: '6px 12px' }}
        >
          <Sparkles size={14} color="var(--accent-primary)" /> Get Storage
        </button>
      </div>
    </aside>
  );
}
