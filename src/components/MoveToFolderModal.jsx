import React, { useState } from 'react';
import {
  FolderOpen,
  Folder,
  HardDrive,
  ChevronRight,
  X,
  Check
} from 'lucide-react';

export default function MoveToFolderModal({
  isOpen,
  onClose,
  files,        // Array of File objects being moved
  folders,      // All available folders
  onMove        // (fileIds, targetFolderId) => void
}) {
  const [selectedFolderId, setSelectedFolderId] = useState(null); // null = root/My Drive
  const [hoveredId, setHoveredId] = useState(null);

  if (!isOpen || !files || files.length === 0) return null;

  const handleMove = () => {
    const fileIds = files.map(f => f.id);
    onMove(fileIds, selectedFolderId);
    onClose();
  };

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{ zIndex: 1100 }}
    >
      <div
        className="modal-card animate-slide-up"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '440px', width: '100%' }}
      >
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'rgba(79, 70, 229, 0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <FolderOpen size={18} color="var(--accent-primary)" />
            </div>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                Move to Folder
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                Moving {files.length} file{files.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-icon"
            style={{ width: '32px', height: '32px' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Files being moved */}
          <div style={{
            background: 'var(--bg-tertiary)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 14px',
            marginBottom: '16px',
            border: '1px solid var(--border-color)'
          }}>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: '600' }}>
              FILES BEING MOVED
            </p>
            {files.slice(0, 3).map(f => (
              <p key={f.id} style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '2px' }}>
                • {f.name}
              </p>
            ))}
            {files.length > 3 && (
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                + {files.length - 3} more files...
              </p>
            )}
          </div>

          {/* Destination folder picker */}
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px', fontWeight: '600', textTransform: 'uppercase' }}>
            SELECT DESTINATION
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '280px', overflowY: 'auto' }}>
            {/* My Drive (Root) */}
            <div
              onClick={() => setSelectedFolderId(null)}
              onMouseEnter={() => setHoveredId('__root__')}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                border: selectedFolderId === null
                  ? '2px solid var(--accent-primary)'
                  : '1px solid var(--border-color)',
                background: selectedFolderId === null
                  ? 'var(--accent-primary-light)'
                  : hoveredId === '__root__'
                  ? 'var(--bg-tertiary)'
                  : 'var(--bg-secondary)',
                transition: 'all 0.15s ease'
              }}
            >
              <HardDrive size={20} color={selectedFolderId === null ? 'var(--accent-primary)' : 'var(--text-muted)'} />
              <span style={{
                flex: 1,
                fontSize: '14px',
                fontWeight: '600',
                color: selectedFolderId === null ? 'var(--accent-primary)' : 'var(--text-primary)'
              }}>
                My Drive (Root)
              </span>
              {selectedFolderId === null && (
                <Check size={16} color="var(--accent-primary)" />
              )}
            </div>

            {/* All Folders */}
            {folders.map((folder) => (
              <div
                key={folder.id}
                onClick={() => setSelectedFolderId(folder.id)}
                onMouseEnter={() => setHoveredId(folder.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  border: selectedFolderId === folder.id
                    ? '2px solid var(--accent-primary)'
                    : '1px solid var(--border-color)',
                  background: selectedFolderId === folder.id
                    ? 'var(--accent-primary-light)'
                    : hoveredId === folder.id
                    ? 'var(--bg-tertiary)'
                    : 'var(--bg-secondary)',
                  transition: 'all 0.15s ease'
                }}
              >
                <Folder size={20} color={folder.color || 'var(--accent-primary)'} />
                <span style={{
                  flex: 1,
                  fontSize: '14px',
                  fontWeight: '600',
                  color: selectedFolderId === folder.id ? 'var(--accent-primary)' : 'var(--text-primary)'
                }}>
                  {folder.name}
                </span>
                {selectedFolderId === folder.id && (
                  <Check size={16} color="var(--accent-primary)" />
                )}
              </div>
            ))}

            {folders.length === 0 && (
              <div style={{
                padding: '24px',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: '13px'
              }}>
                No folders available. You can move files to My Drive (Root).
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '12px' }}>
            <ChevronRight size={14} />
            {selectedFolderId === null
              ? 'Moving to My Drive (Root)'
              : `Moving to: ${folders.find(f => f.id === selectedFolderId)?.name || 'Selected Folder'}`}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={onClose}
              className="btn btn-ghost"
              style={{ fontSize: '13px', padding: '8px 18px' }}
            >
              Cancel
            </button>
            <button
              onClick={handleMove}
              className="btn btn-primary"
              style={{ fontSize: '13px', padding: '8px 20px' }}
            >
              Move Here
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
