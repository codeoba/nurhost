import React, { useState } from 'react';
import { X, Download, Share2, Film, Image as ImageIcon, Code, Copy, Check } from 'lucide-react';
import { resolveFileUrl } from '../api';

export function VideoPlayerModal({ file, onClose, onShare, onToast }) {
  const videoSrc = resolveFileUrl(file.url, file.cleanFilename, file.name);
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-card animate-slide-up"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '800px', background: 'var(--bg-secondary)', overflow: 'hidden' }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="badge badge-indigo">
              <Film size={12} /> Video Player
            </span>
            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>
              {file.name}
            </span>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-icon">
            <X size={18} />
          </button>
        </div>

        <div style={{ background: '#000000', width: '100%', maxHeight: '480px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <video
            src={videoSrc}
            controls
            autoPlay
            poster={file.poster}
            style={{ width: '100%', maxHeight: '480px', objectFit: 'contain' }}
          />
        </div>

        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Resolution: <strong>{file.resolution || '1080p HD'}</strong> • Size: <strong>{file.sizeFormatted}</strong>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => { onClose(); onShare(file); }} className="btn btn-secondary" style={{ fontSize: '13px' }}>
              <Share2 size={16} /> Share Video
            </button>
            <a href={videoSrc} download={file.name} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ fontSize: '13px', textDecoration: 'none' }}>
              <Download size={16} /> Download
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ImageViewerModal({ file, onClose, onShare }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-card animate-slide-up"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '850px', background: 'var(--bg-secondary)', overflow: 'hidden' }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="badge badge-pink">
              <ImageIcon size={12} /> Image Preview
            </span>
            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>
              {file.name}
            </span>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-icon">
            <X size={18} />
          </button>
        </div>

        <div style={{ background: 'rgba(0,0,0,0.9)', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', maxHeight: '550px' }}>
          <img src={resolveFileUrl(file.url)} alt={file.name} style={{ maxWidth: '100%', maxHeight: '500px', objectFit: 'contain', borderRadius: 'var(--radius-sm)' }} />
        </div>

        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Dimensions: <strong>{file.dimensions || 'Image File'}</strong> • Size: <strong>{file.sizeFormatted}</strong>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => { onClose(); onShare(file); }} className="btn btn-secondary" style={{ fontSize: '13px' }}>
              <Share2 size={16} /> Share Image
            </button>
            <a href={resolveFileUrl(file.url)} download={file.name} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ fontSize: '13px', textDecoration: 'none' }}>
              <Download size={16} /> Download
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CodeViewerModal({ file, onClose, onToast }) {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(file.content || '');
    setCopied(true);
    if (onToast) onToast('Code copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-card animate-slide-up"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '720px', background: 'var(--bg-secondary)' }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="badge badge-cyan">
              <Code size={12} /> Code / Config Inspector
            </span>
            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>
              {file.name}
            </span>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-icon">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '0' }}>
          <pre style={{
            background: '#0f172a',
            color: '#38bdf8',
            padding: '20px',
            fontSize: '13px',
            lineHeight: '1.6',
            overflowX: 'auto',
            maxHeight: '400px',
            fontFamily: "'JetBrains Mono', monospace"
          }}>
            <code>{file.content || '// Empty document or binary contents'}</code>
          </pre>
        </div>

        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            MIME: {file.mimeType} • Size: {file.sizeFormatted}
          </span>
          <button onClick={handleCopyCode} className="btn btn-primary" style={{ fontSize: '13px' }}>
            {copied ? <Check size={16} color="var(--accent-emerald)" /> : <Copy size={16} />}
            {copied ? 'Copied Code!' : 'Copy Code'}
          </button>
        </div>
      </div>
    </div>
  );
}
