import React, { useState } from 'react';
import {
  Trash2,
  RotateCcw,
  Music,
  Video,
  Image as ImageIcon,
  FileText,
  Archive,
  Code,
  File,
  AlertTriangle,
  X,
  CheckSquare,
  Square
} from 'lucide-react';

export default function TrashManager({
  files,
  onRestoreFile,
  onPermanentDelete,
  onBulkRestore,
  onBulkPermanentDelete
}) {
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  const trashedFiles = files.filter(f => f.inTrash);

  const getFileIcon = (type) => {
    switch (type) {
      case 'audio': return <Music size={20} color="#3b82f6" />;
      case 'video': return <Video size={20} color="#8b5cf6" />;
      case 'image': return <ImageIcon size={20} color="#ec4899" />;
      case 'document': return <FileText size={20} color="#10b981" />;
      case 'archive': return <Archive size={20} color="#f59e0b" />;
      case 'code': return <Code size={20} color="#06b6d4" />;
      default: return <File size={20} color="var(--text-muted)" />;
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const selectAll = () => {
    if (selectedIds.length === trashedFiles.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(trashedFiles.map(f => f.id));
    }
  };

  if (trashedFiles.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
        <div style={{
          width: '72px', height: '72px', borderRadius: '50%',
          background: 'var(--bg-secondary)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px', border: '1px solid var(--border-color)'
        }}>
          <Trash2 size={32} color="var(--text-muted)" />
        </div>
        <p style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>
          Trash is Empty
        </p>
        <p style={{ fontSize: '13px' }}>Files you delete will appear here. They are stored for 30 days.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Trash Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '16px', flexWrap: 'wrap', gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'rgba(239, 68, 68, 0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Trash2 size={18} color="#ef4444" />
          </div>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>
              Trash ({trashedFiles.length} {trashedFiles.length === 1 ? 'file' : 'files'})
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Files are permanently deleted after 30 days
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={selectAll}
            className="btn btn-ghost"
            style={{ fontSize: '12px', padding: '6px 10px', gap: '6px' }}
          >
            {selectedIds.length === trashedFiles.length && trashedFiles.length > 0
              ? <CheckSquare size={14} color="var(--accent-primary)" />
              : <Square size={14} />}
            {selectedIds.length === trashedFiles.length && trashedFiles.length > 0 ? 'Deselect All' : 'Select All'}
          </button>

          {selectedIds.length > 0 && (
            <>
              <button
                onClick={() => { onBulkRestore(selectedIds); setSelectedIds([]); }}
                className="btn btn-secondary"
                style={{ fontSize: '12px', padding: '6px 12px', gap: '6px' }}
              >
                <RotateCcw size={13} /> Restore ({selectedIds.length})
              </button>
              <button
                onClick={() => setConfirmBulkDelete(true)}
                className="btn"
                style={{ fontSize: '12px', padding: '6px 12px', gap: '6px', background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}
              >
                <Trash2 size={13} /> Delete ({selectedIds.length})
              </button>
            </>
          )}
        </div>
      </div>

      {/* Bulk Delete Confirmation */}
      {confirmBulkDelete && (
        <div className="animate-fade-in" style={{
          background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle size={18} color="#ef4444" />
            <div>
              <p style={{ fontSize: '13px', fontWeight: '700', color: '#ef4444' }}>
                Permanently delete {selectedIds.length} file(s)?
              </p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                This action cannot be undone.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setConfirmBulkDelete(false)}
              className="btn btn-ghost"
              style={{ fontSize: '12px', padding: '6px 12px' }}
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onBulkPermanentDelete(selectedIds);
                setSelectedIds([]);
                setConfirmBulkDelete(false);
              }}
              className="btn"
              style={{ fontSize: '12px', padding: '6px 12px', background: '#ef4444', color: '#fff' }}
            >
              Yes, Delete Permanently
            </button>
          </div>
        </div>
      )}

      {/* Files List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {trashedFiles.map((file) => {
          const isSelected = selectedIds.includes(file.id);
          const isConfirmingDelete = confirmDeleteId === file.id;

          return (
            <div
              key={file.id}
              className="animate-fade-in"
              style={{
                background: 'var(--bg-secondary)',
                border: isSelected
                  ? '1px solid var(--accent-primary)'
                  : '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                transition: 'all 0.2s ease',
                boxShadow: 'var(--card-shadow)'
              }}
            >
              {!isConfirmingDelete ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  {/* Checkbox */}
                  <div
                    onClick={() => toggleSelect(file.id)}
                    style={{ cursor: 'pointer', flexShrink: 0 }}
                  >
                    {isSelected
                      ? <CheckSquare size={16} color="var(--accent-primary)" />
                      : <Square size={16} color="var(--text-muted)" />}
                  </div>

                  {/* Icon */}
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '8px',
                    background: 'var(--bg-tertiary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, opacity: 0.7
                  }}>
                    {getFileIcon(file.type)}
                  </div>

                  {/* File Name & Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{
                      fontSize: '14px', fontWeight: '600',
                      color: 'var(--text-secondary)',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      textDecoration: 'line-through'
                    }}>
                      {file.name}
                    </h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {file.sizeFormatted} • Deleted {new Date(file.updatedAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    <button
                      onClick={() => onRestoreFile(file.id)}
                      className="btn btn-secondary"
                      style={{ fontSize: '12px', padding: '5px 12px', gap: '6px' }}
                      title="Restore file to Drive"
                    >
                      <RotateCcw size={13} /> Restore
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(file.id)}
                      className="btn btn-ghost btn-icon"
                      style={{ width: '32px', height: '32px', color: '#ef4444' }}
                      title="Permanently delete"
                    >
                      <X size={15} />
                    </button>
                  </div>
                </div>
              ) : (
                /* Confirm Delete Row */
                <div className="animate-fade-in" style={{
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <AlertTriangle size={16} color="#ef4444" />
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#ef4444' }}>
                      Permanently delete "{file.name}"?
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="btn btn-ghost"
                      style={{ fontSize: '12px', padding: '5px 12px' }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => { onPermanentDelete(file.id); setConfirmDeleteId(null); }}
                      className="btn"
                      style={{ fontSize: '12px', padding: '5px 12px', background: '#ef4444', color: '#fff' }}
                    >
                      Delete Forever
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
