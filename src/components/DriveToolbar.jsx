import React from 'react';
import { 
  ChevronRight, 
  HardDrive, 
  Folder, 
  ArrowUpDown, 
  CheckSquare, 
  Square, 
  Download, 
  Star, 
  Trash2, 
  Share2,
  Music,
  Video,
  Image,
  FileText,
  Archive,
  Code,
  FolderOpen
} from 'lucide-react';

export default function DriveToolbar({ 
  currentFolder, 
  onBackToRoot, 
  selectedCategory, 
  setSelectedCategory,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  selectedItemsCount,
  onSelectAll,
  allSelected,
  onBulkDownload,
  onBulkStar,
  onBulkDelete,
  onBulkShare,
  onBulkMove
}) {
  const CATEGORIES = [
    { id: 'all', label: 'All Files', icon: HardDrive },
    { id: 'audio', label: 'Audio', icon: Music, color: '#3b82f6' },
    { id: 'video', label: 'Video', icon: Video, color: '#8b5cf6' },
    { id: 'image', label: 'Images', icon: Image, color: '#ec4899' },
    { id: 'document', label: 'Docs', icon: FileText, color: '#10b981' },
    { id: 'archive', label: 'Archives', icon: Archive, color: '#f59e0b' },
    { id: 'code', label: 'Code', icon: Code, color: '#06b6d4' }
  ];

  return (
    <div style={{
      padding: '16px 24px',
      borderBottom: '1px solid var(--border-color)',
      background: 'var(--bg-secondary)',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      {/* Top Breadcrumb & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        {/* Breadcrumb Path */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: '600' }}>
          <span
            onClick={onBackToRoot}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: currentFolder ? 'var(--text-muted)' : 'var(--text-primary)',
              cursor: currentFolder ? 'pointer' : 'default'
            }}
          >
            <HardDrive size={18} /> My Drive
          </span>

          {currentFolder && (
            <>
              <ChevronRight size={16} color="var(--text-muted)" />
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary)', fontWeight: '700' }}>
                <Folder size={18} color={currentFolder.color || 'var(--accent-primary)'} />
                {currentFolder.name}
              </span>
            </>
          )}
        </div>

        {/* Sort & Bulk Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Select All Checkbox */}
          <button
            onClick={onSelectAll}
            className="btn btn-ghost"
            style={{ fontSize: '13px', padding: '6px 10px', gap: '6px' }}
          >
            {allSelected ? <CheckSquare size={16} color="var(--accent-primary)" /> : <Square size={16} />}
            Select All
          </button>

          {/* Sort Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', padding: '2px 8px', border: '1px solid var(--border-color)' }}>
            <ArrowUpDown size={14} color="var(--text-muted)" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                fontSize: '13px',
                fontWeight: '600',
                outline: 'none',
                cursor: 'pointer',
                padding: '4px 0'
              }}
            >
              <option value="name">Name</option>
              <option value="date">Date Modified</option>
              <option value="size">Size</option>
              <option value="type">Type</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="btn btn-ghost btn-icon"
              style={{ width: '24px', height: '24px', fontSize: '11px', fontWeight: '800' }}
              title={`Toggle Sort Direction (${sortOrder.toUpperCase()})`}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      {/* Selected Items Bulk Actions Floating Bar */}
      {selectedItemsCount > 0 && (
        <div className="animate-slide-up" style={{
          background: 'linear-gradient(135deg, var(--accent-primary), #4338ca)',
          color: '#ffffff',
          borderRadius: 'var(--radius-md)',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 8px 24px rgba(79, 70, 229, 0.3)'
        }}>
          <span style={{ fontSize: '13px', fontWeight: '700' }}>
            {selectedItemsCount} item{selectedItemsCount > 1 ? 's' : ''} selected
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button onClick={onBulkShare} className="btn" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', padding: '6px 12px', fontSize: '12px' }}>
              <Share2 size={14} /> Share
            </button>
            <button onClick={onBulkStar} className="btn" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', padding: '6px 12px', fontSize: '12px' }}>
              <Star size={14} /> Star
            </button>
            <button onClick={onBulkDownload} className="btn" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', padding: '6px 12px', fontSize: '12px' }}>
              <Download size={14} /> Download
            </button>
            {onBulkMove && (
              <button onClick={onBulkMove} className="btn" style={{ background: 'rgba(167,139,250,0.3)', color: '#fff', padding: '6px 12px', fontSize: '12px' }}>
                <FolderOpen size={14} /> Move
              </button>
            )}
            <button onClick={onBulkDelete} className="btn" style={{ background: 'rgba(239, 68, 68, 0.4)', color: '#fff', padding: '6px 12px', fontSize: '12px' }}>
              <Trash2 size={14} /> Move to Trash
            </button>
          </div>
        </div>
      )}

      {/* Filter Chips Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                padding: '6px 14px',
                fontSize: '13px',
                borderRadius: 'var(--radius-full)',
                fontWeight: isSelected ? '700' : '500'
              }}
            >
              <Icon size={14} color={isSelected ? '#fff' : (cat.color || 'var(--text-secondary)')} />
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
