import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { X, Save, FileCode, Check, AlertCircle, Loader2 } from 'lucide-react';
import { createTextFile, resolveFileUrl } from '../api';

export default function MonacoTextEditorModal({ isOpen, onClose, initialFile = null, onSaved }) {
  const [filename, setFilename] = useState('');
  const [content, setContent] = useState('');
  const [language, setLanguage] = useState('plaintext');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (initialFile && isOpen) {
      const fName = initialFile.name || initialFile.originalFilename || 'untitled.txt';
      setFilename(fName);
      setLanguage(detectLanguage(fName));

      if (initialFile.content) {
        setContent(initialFile.content);
        setLoading(false);
      } else {
        const fileUrl = resolveFileUrl(initialFile.url, initialFile.cleanFilename, fName);
        if (fileUrl) {
          setLoading(true);
          fetch(fileUrl)
            .then(res => res.text())
            .then(text => {
              setContent(text);
              setLoading(false);
            })
            .catch(err => {
              console.warn("Error reading text file content:", err);
              setContent(`// Could not read file content from server\n${err.message}`);
              setLoading(false);
            });
        } else {
          setContent('');
          setLoading(false);
        }
      }
    } else if (isOpen) {
      setFilename('new_document.txt');
      setContent('// NurHost In-Browser Text & Code Editor\n');
      setLanguage('plaintext');
      setLoading(false);
    }
  }, [initialFile, isOpen]);

  const detectLanguage = (fname) => {
    if (!fname) return 'plaintext';
    const ext = fname.split('.').pop().toLowerCase();
    const map = {
      js: 'javascript',
      jsx: 'javascript',
      ts: 'typescript',
      tsx: 'typescript',
      html: 'html',
      css: 'css',
      json: 'json',
      py: 'python',
      php: 'php',
      sql: 'sql',
      md: 'markdown',
      xml: 'xml',
      sh: 'shell',
      yaml: 'yaml',
      yml: 'yaml',
      txt: 'plaintext',
      log: 'plaintext',
      ini: 'plaintext',
      conf: 'plaintext'
    };
    return map[ext] || 'plaintext';
  };

  const handleFilenameChange = (e) => {
    const val = e.target.value;
    setFilename(val);
    setLanguage(detectLanguage(val));
  };

  const handleSave = async () => {
    if (!filename.trim()) {
      setMessage({ type: 'error', text: 'Tafadhali ingiza jina la faili.' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const fileId = initialFile ? initialFile.id : null;
      const res = await createTextFile(filename, content, fileId);
      setMessage({ type: 'success', text: 'Faili limehifadhiwa kikamilifu!' });
      if (onSaved) onSaved(res.file || { name: filename, content });
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Imefeli kuhifadhi faili. Jaribu tena.' });
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 12000 }} onClick={onClose}>
      <div 
        className="modal-card animate-slide-up"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '1080px',
          width: '94vw',
          height: '88vh',
          background: '#0d1117',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          padding: 0,
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.85)'
        }}
      >
        {/* Top Header */}
        <div style={{
          padding: '14px 20px',
          background: '#161b22',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'rgba(99, 102, 241, 0.15)',
              color: '#818cf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(99, 102, 241, 0.3)'
            }}>
              <FileCode size={20} />
            </div>
            <div style={{ minWidth: 0 }}>
              <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#f3f4f6', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                Monaco Live Code & Text Editor
              </h2>
              <p style={{ fontSize: '12px', color: '#9ca3af', margin: '2px 0 0 0' }}>
                Soma, badilisha, na uhifadhi maandishi au kodi moja kwa moja
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              style={{
                background: '#0d1117',
                color: '#e5e7eb',
                fontSize: '12px',
                fontWeight: '600',
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.15)',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="plaintext">Plain Text</option>
              <option value="markdown">Markdown</option>
              <option value="json">JSON</option>
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="html">HTML</option>
              <option value="css">CSS</option>
              <option value="python">Python</option>
              <option value="php">PHP</option>
              <option value="sql">SQL</option>
              <option value="xml">XML</option>
              <option value="shell">Shell (bash)</option>
              <option value="yaml">YAML</option>
            </select>

            <button
              onClick={onClose}
              className="btn btn-ghost btn-icon"
              style={{ color: '#9ca3af', background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px' }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Action Toolbar */}
        <div style={{
          padding: '10px 20px',
          background: '#0d1117',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, maxWidth: '480px' }}>
            <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: '600', whiteSpace: 'nowrap' }}>Jina la Faili:</span>
            <input
              type="text"
              value={filename}
              onChange={handleFilenameChange}
              placeholder="e.g. notes.txt, config.json"
              style={{
                flex: 1,
                background: '#161b22',
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: '600',
                padding: '7px 12px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.15)',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {message && (
              <span style={{
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 12px',
                borderRadius: '6px',
                background: message.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                color: message.type === 'success' ? '#10b981' : '#f43f5e',
                border: `1px solid ${message.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`
              }}>
                {message.type === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
                {message.text}
              </span>
            )}

            <button
              onClick={handleSave}
              disabled={saving}
              className="btn btn-primary"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: '700',
                padding: '8px 18px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
              }}
            >
              <Save size={16} />
              <span>{saving ? 'Inahifadhi...' : 'Hifadhi Faili'}</span>
            </button>
          </div>
        </div>

        {/* Editor Container */}
        <div style={{ flex: 1, width: '100%', minHeight: 0, position: 'relative', background: '#1e1e1e' }}>
          {loading && (
            <div style={{
              position: 'absolute',
              inset: 0,
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(30,30,30,0.92)',
              color: '#e2e8f0'
            }}>
              <Loader2 size={32} className="animate-spin" style={{ color: '#6366f1', marginBottom: '10px' }} />
              <p style={{ fontSize: '13px', fontWeight: '600' }}>Inafungua maudhui ya faili...</p>
            </div>
          )}
          <Editor
            height="100%"
            width="100%"
            language={language}
            theme="vs-dark"
            value={content}
            onChange={(val) => setContent(val || '')}
            options={{
              fontSize: 14,
              minimap: { enabled: true },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              wordWrap: 'on',
              tabSize: 2
            }}
          />
        </div>
      </div>
    </div>
  );
}
