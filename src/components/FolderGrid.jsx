import React, { useState } from 'react';
import { Folder, MoreVertical, Star, Trash2, Edit3, Share2 } from 'lucide-react';

export default function FolderGrid({ 
  folders, 
  viewMode, 
  onFolderClick, 
  onToggleStar, 
  onDeleteFolder,
  onRenameFolder,
  selectedFolderIds,
  onToggleSelect
}) {
  const [activeMenuId, setActiveMenuId] = useState(null);

  if (!folders || folders.length === 0) return null;

  return (
    <div style={{ marginBottom: '28px' }}>
      <h3 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', tracking: '0.5px', marginBottom: '12px' }}>
        FOLDERS ({folders.length})
      </h3>

      <div style={{
        display: viewMode === 'grid' ? 'grid' : 'flex',
        gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(240px, 1fr))' : 'none',
        flexDirection: viewMode === 'list' ? 'column' : 'none',
        gap: '12px'
      }}>
        {folders.map((folder) => {
          const isSelected = selectedFolderIds.includes(folder.id);

          return (
            <div
              key={folder.id}
              onClick={() => onFolderClick(folder.id)}
              className="animate-fade-in"
              style={{
                background: 'var(--bg-secondary)',
                border: isSelected ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: 'var(--card-shadow)',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                {/* Folder Icon */}
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: `${folder.color || '#6366f1'}18`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Folder size={22} color={folder.color || '#6366f1'} />
                </div>

                <div style={{ minWidth: 0, flex: 1 }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {folder.name}
                  </h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {folder.itemsCount || 0} items
                  </p>
                </div>
              </div>

              {/* Actions & Star */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleStar(folder.id); }}
                  className="btn btn-ghost btn-icon"
                  style={{ width: '30px', height: '30px' }}
                >
                  <Star size={16} color={folder.isStarred ? '#f59e0b' : 'var(--text-muted)'} fill={folder.isStarred ? '#f59e0b' : 'transparent'} />
                </button>

                <div style={{ position: 'relative' }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === folder.id ? null : folder.id); }}
                    className="btn btn-ghost btn-icon"
                    style={{ width: '30px', height: '30px' }}
                  >
                    <MoreVertical size={16} color="var(--text-muted)" />
                  </button>

                  {activeMenuId === folder.id && (
                    <div className="glass-panel animate-slide-up" style={{
                      position: 'absolute',
                      top: '36px',
                      right: 0,
                      width: '160px',
                      background: 'var(--bg-secondary)',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--modal-shadow)',
                      padding: '4px',
                      zIndex: 60
                    }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); onToggleStar(folder.id); setActiveMenuId(null); }}
                        className="btn btn-ghost"
                        style={{ width: '100%', justifyContent: 'flex-start', fontSize: '12px', padding: '6px 10px' }}
                      >
                        <Star size={14} /> {folder.isStarred ? 'Unstar' : 'Add Star'}
                      </button>
                      {onRenameFolder && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onRenameFolder(folder); setActiveMenuId(null); }}
                          className="btn btn-ghost"
                          style={{ width: '100%', justifyContent: 'flex-start', fontSize: '12px', padding: '6px 10px' }}
                        >
                          <Edit3 size={14} /> Rename Folder
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); onDeleteFolder(folder.id); setActiveMenuId(null); }}
                        className="btn btn-ghost"
                        style={{ width: '100%', justifyContent: 'flex-start', fontSize: '12px', padding: '6px 10px', color: 'var(--accent-pink)' }}
                      >
                        <Trash2 size={14} /> Move to Trash
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
