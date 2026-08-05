import React, { useState, useEffect } from 'react';
import { X, History, RotateCcw, Clock, Check, FileText, Download } from 'lucide-react';
import { getFileVersions, revertFileVersion } from '../api';

export default function FileVersionDrawer({ isOpen, onClose, file, onToast }) {
  const [loading, setLoading] = useState(false);
  const [versions, setVersions] = useState([]);
  const [revertingId, setRevertingId] = useState(null);

  useEffect(() => {
    if (isOpen && file) {
      loadVersions();
    }
  }, [isOpen, file]);

  const loadVersions = async () => {
    setLoading(true);
    try {
      const data = await getFileVersions(file.id);
      setVersions(data.versions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRevert = async (versionNumber) => {
    setRevertingId(versionNumber);
    try {
      const res = await revertFileVersion(file.id, versionNumber);
      if (res.success) {
        if (onToast) onToast(`Limerudishwa kwenye Toleo #${versionNumber}!`);
        await loadVersions();
      } else {
        if (onToast) onToast(res.error || 'Imeshindwa kurudisha toleo');
      }
    } catch (err) {
      if (onToast) onToast('Imeshindwa kuunganisha na server');
    } finally {
      setRevertingId(null);
    }
  };

  if (!isOpen || !file) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-card animate-slide-up"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '520px' }}
      >
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent-primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-primary)'
            }}>
              <History size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>
                Historia ya Matoleo (File Versioning)
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {file.name}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-icon">
            <X size={18} />
          </button>
        </div>

        {/* Timeline Body */}
        <div className="modal-body" style={{ maxHeight: '420px', overflowY: 'auto' }}>
          {loading ? (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Clock size={28} className="animate-spin" style={{ margin: '0 auto 10px' }} />
              <p style={{ fontSize: '12px' }}>Inapakia matoleo yaliyopita...</p>
            </div>
          ) : versions.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
              Hakuna historia ya matoleo kwa faili hili.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative' }}>
              {versions.map((ver, idx) => {
                const isLatest = idx === 0;
                return (
                  <div
                    key={ver.id}
                    style={{
                      background: isLatest ? 'var(--accent-primary-light)' : 'var(--bg-tertiary)',
                      border: isLatest ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      padding: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: isLatest ? 'var(--accent-primary)' : 'var(--bg-hover)',
                        color: isLatest ? '#fff' : 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: '700',
                        flexShrink: 0
                      }}>
                        v{ver.versionNumber}
                      </div>

                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>
                            Toleo la {ver.versionNumber}
                          </h4>
                          {isLatest && (
                            <span className="badge badge-indigo" style={{ fontSize: '10px' }}>
                              <Check size={10} /> Ya Sasa (Current)
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {ver.changeSummary || 'Imesasishwa'} • {new Date(ver.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {!isLatest && (
                      <button
                        onClick={() => handleRevert(ver.versionNumber)}
                        disabled={revertingId === ver.versionNumber}
                        className="btn btn-secondary"
                        style={{ fontSize: '12px', padding: '6px 12px' }}
                      >
                        <RotateCcw size={14} />
                        <span>{revertingId === ver.versionNumber ? 'Inarudisha...' : 'Revert'}</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-primary" style={{ fontSize: '13px' }}>
            Funga
          </button>
        </div>
      </div>
    </div>
  );
}
