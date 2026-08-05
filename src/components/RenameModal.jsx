import React, { useState, useEffect } from 'react';
import { X, Edit3, Check } from 'lucide-react';

export default function RenameModal({ isOpen, onClose, item, isFolder, onRename }) {
  const [name, setName] = useState('');

  useEffect(() => {
    if (item) {
      setName(item.name || '');
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onRename(item.id, name.trim(), isFolder);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-card animate-slide-up"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '440px' }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent-primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-primary)'
            }}>
              <Edit3 size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>
                Badilisha Jina la {isFolder ? 'Folda' : 'Faili'}
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Ingiza jina jipya hapa chini</p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-icon">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                Jina Jipya
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
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
                placeholder="Ingiza jina..."
                autoFocus
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-ghost" style={{ fontSize: '13px' }}>
              Ghairi
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="btn btn-primary"
              style={{ fontSize: '13px' }}
            >
              <Check size={16} />
              <span>Hifadhi Jina</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
