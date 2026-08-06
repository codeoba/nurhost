import React, { useState, useEffect } from 'react';
import { X, Archive, CheckSquare, Square, Download, Check, AlertCircle, FileText } from 'lucide-react';
import { inspectZipFile, extractSelectiveZip } from '../api';

export default function ZipUnzipModal({ isOpen, onClose, zipFile, onExtracted }) {
  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState([]);
  const [selectedIndices, setSelectedIndices] = useState([]);
  const [extracting, setExtracting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  useEffect(() => {
    if (isOpen && zipFile) {
      loadZipContents();
    }
  }, [isOpen, zipFile]);

  const loadZipContents = async () => {
    setLoading(true);
    setStatusMessage(null);
    try {
      const targetQuery = zipFile.cleanFilename || zipFile.name || zipFile.id;
      const data = await inspectZipFile(targetQuery);
      const list = data.entries || data.files || [];
      setEntries(list);
      const nonDirIndices = list
        .filter(e => !e.isDirectory)
        .map(e => e.index);
      setSelectedIndices(nonDirIndices);
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: 'error', text: 'Imeshindwa kukagua yaliyomo kwenye Zip file' });
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (index) => {
    if (selectedIndices.includes(index)) {
      setSelectedIndices(selectedIndices.filter(i => i !== index));
    } else {
      setSelectedIndices([...selectedIndices, index]);
    }
  };

  const toggleSelectAll = () => {
    const nonDirIndices = entries.filter(e => !e.isDirectory).map(e => e.index);
    if (selectedIndices.length === nonDirIndices.length) {
      setSelectedIndices([]);
    } else {
      setSelectedIndices(nonDirIndices);
    }
  };

  const handleExtract = async () => {
    if (selectedIndices.length === 0) {
      setStatusMessage({ type: 'error', text: 'Tafadhali chagua angalau faili 1 la kufungua (unzip).' });
      return;
    }

    setExtracting(true);
    setStatusMessage(null);

    try {
      const targetQuery = zipFile.cleanFilename || zipFile.name || zipFile.id;
      const res = await extractSelectiveZip(targetQuery, selectedIndices);
      if (res.success && res.extractedFiles) {
        setStatusMessage({
          type: 'success',
          text: res.message || `Mchakato umefanikiwa! Mafaili ${res.extractedFiles.length} yametolewa.`
        });
        if (onExtracted) onExtracted(res.extractedFiles);
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setStatusMessage({ type: 'error', text: res.error || 'Mchakato wa kutatua zip umefeli.' });
      }
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: 'error', text: 'Mchakato wa kutatua zip umefeli. Jaribu tena.' });
    } finally {
      setExtracting(false);
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i];
  };

  if (!isOpen || !zipFile) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-card animate-slide-up"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '720px' }}
      >
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(245, 158, 11, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-amber)'
            }}>
              <Archive size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>
                Selective Zip Unzipper Engine
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Kagua na uchague mafaili maalum ya kutatua kutoka: <span style={{ color: 'var(--accent-amber)', fontWeight: '600' }}>{zipFile.name}</span>
              </p>
            </div>
          </div>

          <button onClick={onClose} className="btn btn-ghost btn-icon">
            <X size={18} />
          </button>
        </div>

        {/* Toolbar */}
        <div style={{
          padding: '10px 24px',
          background: 'var(--bg-tertiary)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <button
            onClick={toggleSelectAll}
            disabled={loading || entries.length === 0}
            className="btn btn-ghost"
            style={{ fontSize: '12px', padding: '4px 8px' }}
          >
            {selectedIndices.length > 0 && selectedIndices.length === entries.filter(e => !e.isDirectory).length ? (
              <CheckSquare size={16} color="var(--accent-primary)" />
            ) : (
              <Square size={16} color="var(--text-muted)" />
            )}
            <span>Chagua Zote ({selectedIndices.length}/{entries.filter(e => !e.isDirectory).length})</span>
          </button>

          {statusMessage && (
            <span className={`badge ${statusMessage.type === 'success' ? 'badge-emerald' : 'badge-pink'}`}>
              {statusMessage.type === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
              {statusMessage.text}
            </span>
          )}
        </div>

        {/* List of Entries */}
        <div style={{ maxHeight: '360px', overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Archive size={36} color="var(--accent-primary)" style={{ animation: 'bounce 1s infinite' }} />
              <p style={{ fontSize: '13px', marginTop: '12px' }}>Inakagua yaliyomo kwenye Zip file...</p>
            </div>
          ) : entries.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
              Hakuna mafaili yaliyopatikana ndani ya zip hii.
            </div>
          ) : (
            entries.map((entry) => {
              const isSelected = selectedIndices.includes(entry.index);
              return (
                <div
                  key={entry.index}
                  onClick={() => !entry.isDirectory && toggleSelect(entry.index)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                    background: isSelected ? 'var(--accent-primary-light)' : 'var(--bg-tertiary)',
                    cursor: entry.isDirectory ? 'default' : 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                    {!entry.isDirectory ? (
                      isSelected ? (
                        <CheckSquare size={16} color="var(--accent-primary)" />
                      ) : (
                        <Square size={16} color="var(--text-muted)" />
                      )
                    ) : (
                      <div style={{ width: '16px' }} />
                    )}
                    <FileText size={16} color={entry.isDirectory ? 'var(--accent-amber)' : 'var(--text-secondary)'} />
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{entry.entryName}</p>
                    </div>
                  </div>

                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                    {entry.isDirectory ? 'Folda' : formatSize(entry.size)}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Action */}
        <div className="modal-footer">
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginRight: 'auto' }}>
            {selectedIndices.length} mafaili yamechaguliwa
          </span>

          <button onClick={onClose} className="btn btn-ghost" style={{ fontSize: '13px' }}>
            Ghairi
          </button>

          <button
            onClick={handleExtract}
            disabled={extracting || selectedIndices.length === 0}
            className="btn btn-primary"
            style={{ fontSize: '13px', background: 'linear-gradient(135deg, var(--accent-amber), #d97706)' }}
          >
            <Download size={16} />
            <span>{extracting ? 'Inatatua (Unzipping)...' : 'Fungua Mafaili Yaliyochaguliwa'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
