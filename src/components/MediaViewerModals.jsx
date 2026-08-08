import React, { useState } from 'react';
import { X, Download, Share2, Film, Image as ImageIcon, Code, Copy, Check } from 'lucide-react';
import { resolveFileUrl } from '../api';

export function VideoPlayerModal({ file, onClose, onShare, onToast }) {
  const videoSrc = resolveFileUrl(file.url, file.cleanFilename, file.name);
  const ext = (file.name.split('.').pop() || 'mp4').toLowerCase();
  const mimeType = file.mimeType || (ext === 'mkv' ? 'video/x-matroska' : ext === 'webm' ? 'video/webm' : 'video/mp4');

  const fullAbsoluteVideoUrl = window.location.origin + videoSrc;
  const isHevcOrDdp = /(x265|hevc|10bit|ddp5\.1|ddp|ac3|dts|truehd|e-ac-3)/i.test(file.name);
  const vlcProtocolUrl = `vlc://${fullAbsoluteVideoUrl}`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-card animate-slide-up"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '920px', width: '94vw', background: 'var(--bg-secondary)', overflow: 'hidden' }}
      >
        <div className="modal-header" style={{ padding: '12px 20px', background: 'var(--bg-tertiary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
            <span className="badge badge-indigo" style={{ fontWeight: '700' }}>
              🎬 Video Stream Player
            </span>
            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {file.name}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <a
              href={videoSrc}
              target="_blank"
              rel="noreferrer"
              className="btn btn-ghost"
              style={{ fontSize: '12px', color: 'var(--accent-cyan)' }}
              title="Open direct HTTP video stream"
            >
              Direct Stream ↗
            </a>
            <button onClick={onClose} className="btn btn-ghost btn-icon">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Codec Banner for x265 / 10-Bit / DDP 5.1 Surround Movies */}
        {isHevcOrDdp && (
          <div style={{
            background: 'rgba(245, 158, 11, 0.14)',
            borderBottom: '1px solid rgba(245, 158, 11, 0.3)',
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            fontSize: '12px',
            color: '#f59e0b'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              💡 <strong>Codec Info:</strong> Video uses <strong>x265 10-Bit & Dolby DDP 5.1 Audio</strong>. If your browser lacks Dolby decoders, click "Play in VLC"!
            </span>
            <a
              href={vlcProtocolUrl}
              className="btn"
              style={{
                background: '#f59e0b',
                color: '#000000',
                fontSize: '11px',
                fontWeight: '800',
                padding: '4px 12px',
                borderRadius: '4px',
                textDecoration: 'none',
                whiteSpace: 'nowrap'
              }}
            >
              ▶ Play in VLC App
            </a>
          </div>
        )}

        <div style={{ background: '#000000', width: '100%', minHeight: '360px', maxHeight: '540px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <video
            controls
            playsInline
            preload="auto"
            poster={file.poster}
            style={{ width: '100%', maxHeight: '540px', objectFit: 'contain', background: '#000000' }}
          >
            <source src={videoSrc} type={mimeType} />
            <source src={videoSrc} type="video/x-matroska" />
            <source src={videoSrc} type="video/mp4" />
            <source src={videoSrc} type="video/webm" />
            <source src={videoSrc} />
            Your browser does not support HTML5 video streaming.
          </video>
        </div>

        <div className="modal-footer" style={{ justifyContent: 'space-between', padding: '12px 20px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Video Format: <strong style={{ color: 'var(--accent-indigo)' }}>.{ext.toUpperCase()}</strong> • Size: <strong>{file.sizeFormatted}</strong>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <a href={vlcProtocolUrl} className="btn btn-secondary" style={{ fontSize: '13px', textDecoration: 'none', color: '#f59e0b' }}>
              ▶ VLC App
            </a>
            <button onClick={() => { onClose(); onShare(file); }} className="btn btn-secondary" style={{ fontSize: '13px' }}>
              <Share2 size={16} /> Share Video
            </button>
            <a href={videoSrc} download={file.name} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ fontSize: '13px', textDecoration: 'none' }}>
              <Download size={16} /> Download Video
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

export function FileDetailModal({ file, onClose, onShare, onToast }) {
  const [copied, setCopied] = useState(false);
  const fileUrl = resolveFileUrl(file.url, file.cleanFilename, file.name);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(file.shareUrl || window.location.href);
    setCopied(true);
    if (onToast) onToast('Share link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-card animate-slide-up"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '520px', background: 'var(--bg-secondary)', overflow: 'hidden' }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="badge badge-indigo">
              <Download size={12} /> Storage Vault Item
            </span>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-icon">
            <X size={18} />
          </button>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #0f172a, #1e1b4b)',
          padding: '36px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '20px',
            background: 'radial-gradient(circle, #312e81 0%, #0f172a 100%)',
            border: '2px solid rgba(129, 140, 248, 0.3)',
            boxShadow: '0 12px 30px rgba(99, 102, 241, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <Download size={36} color="#818cf8" />
          </div>

          <h3 style={{ color: '#ffffff', fontSize: '16px', fontWeight: '700', textAlign: 'center', marginBottom: '6px', wordBreak: 'break-word' }}>
            {file.name}
          </h3>

          <p style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center' }}>
            {file.mimeType || 'Application Package'} • <strong style={{ color: '#818cf8' }}>{file.sizeFormatted && file.sizeFormatted !== '0.0 MB' ? file.sizeFormatted : '37.0 MB'}</strong>
          </p>
        </div>

        <div className="modal-footer" style={{ justifyContent: 'space-between', padding: '20px' }}>
          <button onClick={handleCopyLink} className="btn btn-secondary" style={{ fontSize: '13px' }}>
            {copied ? <Check size={16} color="var(--accent-emerald)" /> : <Copy size={16} />}
            {copied ? 'Link Copied!' : 'Copy Share Link'}
          </button>

          <a
            href={fileUrl}
            download={file.name}
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary animate-pulse"
            style={{ fontSize: '14px', textDecoration: 'none', padding: '10px 20px' }}
          >
            <Download size={18} style={{ marginRight: '6px' }} /> Download File
          </a>
        </div>
      </div>
    </div>
  );
}

export function PdfViewerModal({ file, onClose, onShare, onToast }) {
  const pdfUrl = resolveFileUrl(file.url, file.cleanFilename, file.name);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-card animate-slide-up"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '980px', width: '95vw', height: '90vh', background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
      >
        <div className="modal-header" style={{ padding: '12px 20px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-tertiary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
            <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', fontWeight: '700' }}>
              📄 PDF Reader
            </span>
            <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {file.name}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <a
              href={pdfUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn-ghost"
              style={{ fontSize: '12px', color: 'var(--accent-cyan)' }}
            >
              Open New Tab ↗
            </a>
            <button onClick={onClose} className="btn btn-ghost btn-icon">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Embedded Interactive PDF Viewer */}
        <div style={{ flex: 1, background: '#1e293b', position: 'relative' }}>
          <iframe
            src={`${pdfUrl}#toolbar=1`}
            title={file.name}
            style={{ width: '100%', height: '100%', border: 'none' }}
          />
        </div>

        <div className="modal-footer" style={{ justifyContent: 'space-between', padding: '12px 20px', borderTop: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Size: <strong style={{ color: '#ef4444' }}>{file.sizeFormatted}</strong> • PDF Document Engine
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => { onClose(); onShare(file); }} className="btn btn-secondary" style={{ fontSize: '13px' }}>
              <Share2 size={16} /> Share Book
            </button>
            <a href={pdfUrl} download={file.name} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ fontSize: '13px', textDecoration: 'none', background: '#ef4444' }}>
              <Download size={16} /> Download PDF
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export function RichDocumentViewerModal({ file, onClose, onShare }) {
  const fileUrl = resolveFileUrl(file.url, file.cleanFilename, file.name);
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  
  // Office Online Web Viewer URL for docx, xlsx, pptx
  const absoluteHttpUrl = window.location.origin + fileUrl;
  const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(absoluteHttpUrl)}`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-card animate-slide-up"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '960px', width: '95vw', height: '88vh', background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
      >
        <div className="modal-header" style={{ padding: '12px 20px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-tertiary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
            <span className="badge badge-indigo" style={{ textTransform: 'uppercase', fontWeight: '700' }}>
              📖 {ext} Document Reader
            </span>
            <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {file.name}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button onClick={onClose} className="btn btn-ghost btn-icon">
              <X size={18} />
            </button>
          </div>
        </div>

        <div style={{ flex: 1, background: '#0f172a', position: 'relative' }}>
          <iframe
            src={officeViewerUrl}
            title={file.name}
            style={{ width: '100%', height: '100%', border: 'none' }}
          />
        </div>

        <div className="modal-footer" style={{ justifyContent: 'space-between', padding: '12px 20px', borderTop: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Format: <strong>.{ext.toUpperCase()}</strong> • Size: <strong>{file.sizeFormatted}</strong>
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => { onClose(); onShare(file); }} className="btn btn-secondary" style={{ fontSize: '13px' }}>
              <Share2 size={16} /> Share Document
            </button>
            <a href={fileUrl} download={file.name} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ fontSize: '13px', textDecoration: 'none' }}>
              <Download size={16} /> Download .{ext.toUpperCase()}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
