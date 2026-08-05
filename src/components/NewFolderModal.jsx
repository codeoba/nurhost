import React, { useState } from 'react';
import { X, Folder, Palette } from 'lucide-react';

export default function NewFolderModal({ onClose, onCreateFolder }) {
  const [folderName, setFolderName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#6366f1');

  const COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#06b6d4', '#8b5cf6', '#ef4444', '#64748b'];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!folderName.trim()) return;
    onCreateFolder({
      id: `f-${Date.now()}`,
      name: folderName.trim(),
      color: selectedColor,
      itemsCount: 0,
      updatedAt: new Date().toISOString(),
      isStarred: false,
      parentId: null
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-card animate-slide-up"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '440px', background: 'var(--bg-secondary)' }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Folder size={22} color={selectedColor} />
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>
              Create New Folder
            </h3>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-icon">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                FOLDER NAME
              </label>
              <input
                type="text"
                autoFocus
                placeholder="e.g. Master Audio Stems..."
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 14px',
                  fontSize: '14px',
                  color: 'var(--text-primary)',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                ACCENT COLOR
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {COLORS.map((c) => (
                  <div
                    key={c}
                    onClick={() => setSelectedColor(c)}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: c,
                      cursor: 'pointer',
                      border: selectedColor === c ? '3px solid var(--text-primary)' : 'none',
                      boxShadow: selectedColor === c ? '0 0 10px rgba(0,0,0,0.3)' : 'none'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={!folderName.trim()}>
              Create Folder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
