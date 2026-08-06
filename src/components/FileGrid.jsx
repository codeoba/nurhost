import React, { useState } from 'react';
import { resolveFileUrl, detectFileType } from '../api';
import { 
  Music, 
  Video, 
  Image as ImageIcon, 
  FileText, 
  Archive, 
  Code, 
  File,
  MoreVertical, 
  Star, 
  Share2, 
  Download, 
  Trash2, 
  Play, 
  Eye,
  Link2,
  CheckSquare,
  Square,
  Lock,
  Edit3,
  History,
  FolderOpen
} from 'lucide-react';

export default function FileGrid({ 
  files, 
  viewMode, 
  onPreviewFile, 
  onShareFile, 
  onToggleStar, 
  onDeleteFile, 
  onDownloadFile,
  onUnzipFile,
  onRenameFile,
  onVersionHistory,
  onMoveFile,
  selectedFileIds,
  onToggleSelectFile
}) {
  const [activeMenuId, setActiveMenuId] = useState(null);

  if (!files || files.length === 0) return null;

  const getFileIcon = (type) => {
    switch (type) {
      case 'audio': return <Music size={22} color="#3b82f6" />;
      case 'video': return <Video size={22} color="#8b5cf6" />;
      case 'image': return <ImageIcon size={22} color="#ec4899" />;
      case 'document': return <FileText size={22} color="#10b981" />;
      case 'archive': return <Archive size={22} color="#f59e0b" />;
      case 'code': return <Code size={22} color="#06b6d4" />;
      default: return <File size={22} color="var(--text-muted)" />;
    }
  };

  const getFileColorBg = (type) => {
    switch (type) {
      case 'audio': return 'rgba(59, 130, 246, 0.12)';
      case 'video': return 'rgba(139, 92, 246, 0.12)';
      case 'image': return 'rgba(236, 72, 153, 0.12)';
      case 'document': return 'rgba(16, 185, 129, 0.12)';
      case 'archive': return 'rgba(245, 158, 11, 0.12)';
      case 'code': return 'rgba(6, 182, 212, 0.12)';
      default: return 'var(--bg-tertiary)';
    }
  };

  return (
    <div>
      <h3 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', tracking: '0.5px', marginBottom: '12px' }}>
        FILES ({files.length})
      </h3>

      {/* Grid Mode */}
      {viewMode === 'grid' ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '16px'
        }}>
          {files.map((file) => {
            const isSelected = selectedFileIds.includes(file.id);

            return (
              <div
                key={file.id}
                onClick={() => onPreviewFile(file)}
                className="animate-fade-in"
                style={{
                  background: 'var(--bg-secondary)',
                  border: isSelected ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: 'var(--card-shadow)',
                  position: 'relative'
                }}
              >
                {/* Media Preview Box */}
                <div style={{
                  height: '140px',
                  background: getFileColorBg(file.type),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {(file.type === 'image' || detectFileType(file.name, file.mimeType) === 'image') ? (
                    <img 
                      src={resolveFileUrl(file.url, file.cleanFilename, file.name)} 
                      alt={file.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  ) : file.type === 'video' && file.poster ? (
                    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                      <img src={file.poster} alt={file.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(0,0,0,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                          <Play size={20} style={{ marginLeft: '2px' }} />
                        </div>
                      </div>
                    </div>
                  ) : file.type === 'audio' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Music size={26} color="#3b82f6" />
                      </div>
                      <div className="bar-waveform" style={{ height: '24px' }}>
                        <div className="wave-bar active" style={{ height: '60%' }} />
                        <div className="wave-bar active" style={{ height: '90%' }} />
                        <div className="wave-bar active" style={{ height: '40%' }} />
                        <div className="wave-bar active" style={{ height: '80%' }} />
                        <div className="wave-bar active" style={{ height: '50%' }} />
                      </div>
                    </div>
                  ) : (
                    getFileIcon(file.type)
                  )}

                  {/* Select Checkbox Top Left */}
                  <div
                    onClick={(e) => { e.stopPropagation(); onToggleSelectFile(file.id); }}
                    style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 10 }}
                  >
                    {isSelected ? (
                      <CheckSquare size={20} color="var(--accent-primary)" fill="#fff" />
                    ) : (
                      <Square size={20} color="rgba(255,255,255,0.7)" />
                    )}
                  </div>

                  {/* Top Right Star & Share Pills */}
                  <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '6px' }}>
                    {file.isShared && (
                      <span className="badge badge-cyan" title="Shared publicly">
                        <Share2 size={10} /> Public
                      </span>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); onToggleStar(file.id); }}
                      className="btn btn-ghost btn-icon"
                      style={{ width: '28px', height: '28px', background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}
                    >
                      <Star size={14} color={file.isStarred ? '#f59e0b' : '#fff'} fill={file.isStarred ? '#f59e0b' : 'transparent'} />
                    </button>
                  </div>
                </div>

                {/* File Details Footer */}
                <div style={{ padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {file.name}
                    </h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {file.sizeFormatted} • {new Date(file.updatedAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* More Menu */}
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === file.id ? null : file.id); }}
                      className="btn btn-ghost btn-icon"
                      style={{ width: '30px', height: '30px' }}
                    >
                      <MoreVertical size={16} color="var(--text-muted)" />
                    </button>

                    {activeMenuId === file.id && (
                      <div className="glass-panel animate-slide-up" style={{
                        position: 'absolute',
                        bottom: '36px',
                        right: 0,
                        width: '180px',
                        background: 'var(--bg-secondary)',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: 'var(--modal-shadow)',
                        padding: '6px',
                        zIndex: 60
                      }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); onPreviewFile(file); setActiveMenuId(null); }}
                          className="btn btn-ghost"
                          style={{ width: '100%', justifyContent: 'flex-start', fontSize: '12px', padding: '6px 10px' }}
                        >
                          <Eye size={14} /> Preview File
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); onShareFile(file); setActiveMenuId(null); }}
                          className="btn btn-ghost"
                          style={{ width: '100%', justifyContent: 'flex-start', fontSize: '12px', padding: '6px 10px' }}
                        >
                          <Share2 size={14} /> Share Link
                        </button>
                        {onRenameFile && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onRenameFile(file); setActiveMenuId(null); }}
                            className="btn btn-ghost"
                            style={{ width: '100%', justifyContent: 'flex-start', fontSize: '12px', padding: '6px 10px' }}
                          >
                            <Edit3 size={14} /> Rename File
                          </button>
                        )}
                        {onVersionHistory && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onVersionHistory(file); setActiveMenuId(null); }}
                            className="btn btn-ghost"
                            style={{ width: '100%', justifyContent: 'flex-start', fontSize: '12px', padding: '6px 10px', color: 'var(--accent-cyan)' }}
                          >
                            <History size={14} /> Version History
                          </button>
                        )}
                        {onMoveFile && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onMoveFile(file); setActiveMenuId(null); }}
                            className="btn btn-ghost"
                            style={{ width: '100%', justifyContent: 'flex-start', fontSize: '12px', padding: '6px 10px', color: '#a78bfa' }}
                          >
                            <FolderOpen size={14} /> Move to Folder
                          </button>
                        )}
                        {file.type === 'archive' && onUnzipFile && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onUnzipFile(file); setActiveMenuId(null); }}
                            className="btn btn-ghost"
                            style={{ width: '100%', justifyContent: 'flex-start', fontSize: '12px', padding: '6px 10px', color: 'var(--accent-amber)' }}
                          >
                            <Archive size={14} /> Selective Unzip
                          </button>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); onDownloadFile(file); setActiveMenuId(null); }}
                          className="btn btn-ghost"
                          style={{ width: '100%', justifyContent: 'flex-start', fontSize: '12px', padding: '6px 10px' }}
                        >
                          <Download size={14} /> Download
                        </button>
                        <div style={{ height: '1px', background: 'var(--border-color)', margin: '4px 0' }} />
                        <button
                          onClick={(e) => { e.stopPropagation(); onDeleteFile(file.id); setActiveMenuId(null); }}
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
      ) : (
        /* List Mode */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {files.map((file) => {
            const isSelected = selectedFileIds.includes(file.id);

            return (
              <div
                key={file.id}
                onClick={() => onPreviewFile(file)}
                className="animate-fade-in"
                style={{
                  background: 'var(--bg-secondary)',
                  border: isSelected ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: 'var(--card-shadow)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                  <div 
                    onClick={(e) => { e.stopPropagation(); onToggleSelectFile(file.id); }}
                    style={{ cursor: 'pointer' }}
                  >
                    {isSelected ? <CheckSquare size={18} color="var(--accent-primary)" /> : <Square size={18} color="var(--text-muted)" />}
                  </div>

                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '8px',
                    background: getFileColorBg(file.type),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {getFileIcon(file.type)}
                  </div>

                  <div style={{ minWidth: 0, flex: 1 }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {file.name}
                    </h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {file.owner ? file.owner.name : 'Administrator'} • {new Date(file.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                    {file.sizeFormatted}
                  </span>

                  <button
                    onClick={(e) => { e.stopPropagation(); onToggleStar(file.id); }}
                    className="btn btn-ghost btn-icon"
                    style={{ width: '30px', height: '30px' }}
                  >
                    <Star size={16} color={file.isStarred ? '#f59e0b' : 'var(--text-muted)'} fill={file.isStarred ? '#f59e0b' : 'transparent'} />
                  </button>

                  <button
                    onClick={(e) => { e.stopPropagation(); onShareFile(file); }}
                    className="btn btn-ghost btn-icon"
                    style={{ width: '30px', height: '30px' }}
                  >
                    <Share2 size={16} color="var(--text-muted)" />
                  </button>

                  <button
                    onClick={(e) => { e.stopPropagation(); onDownloadFile(file); }}
                    className="btn btn-ghost btn-icon"
                    style={{ width: '30px', height: '30px' }}
                  >
                    <Download size={16} color="var(--text-muted)" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
