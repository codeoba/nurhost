import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { X, Save, FileCode, Check, AlertCircle } from 'lucide-react';
import { createTextFile } from '../api';

export default function MonacoTextEditorModal({ isOpen, onClose, initialFile = null, onSaved }) {
  const [filename, setFilename] = useState('');
  const [content, setContent] = useState('// Write your code or text here...\n');
  const [language, setLanguage] = useState('javascript');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (initialFile) {
      setFilename(initialFile.name || 'untitled.js');
      setContent(initialFile.content || '');
      setLanguage(detectLanguage(initialFile.name));
    } else {
      setFilename('new_document.js');
      setContent('// NurHost In-Browser Code & Text Editor\nconsole.log("Hello NurHost!");\n');
      setLanguage('javascript');
    }
  }, [initialFile, isOpen]);

  const detectLanguage = (fname) => {
    if (!fname) return 'javascript';
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
      yml: 'yaml'
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
      const res = await createTextFile(filename, content);
      setMessage({ type: 'success', text: 'Faili limehifadhiwa kikamilifu!' });
      if (onSaved) onSaved(res.file);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                In-Browser Monaco Code Editor
              </h2>
              <p className="text-xs text-slate-400">Tengeneza au hariri maandishi/code moja kwa moja</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Language dropdown */}
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-slate-800 text-slate-200 text-xs px-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-indigo-500"
            >
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="html">HTML</option>
              <option value="css">CSS</option>
              <option value="json">JSON</option>
              <option value="python">Python</option>
              <option value="php">PHP</option>
              <option value="sql">SQL</option>
              <option value="markdown">Markdown</option>
              <option value="plaintext">Plain Text</option>
            </select>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar & Filename Input */}
        <div className="px-6 py-3 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2 flex-1 max-w-md">
            <span className="text-xs text-slate-400 font-medium">Jina la Faili:</span>
            <input
              type="text"
              value={filename}
              onChange={handleFilenameChange}
              placeholder="e.g. index.js, notes.txt"
              className="flex-1 bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg border border-slate-700/70 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center space-x-3">
            {message && (
              <span className={`text-xs flex items-center gap-1.5 px-3 py-1 rounded-md ${
                message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}>
                {message.type === 'success' ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                {message.text}
              </span>
            )}

            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Inahifadhi...' : 'Hifadhi Faili'}</span>
            </button>
          </div>
        </div>

        {/* Monaco Editor Container */}
        <div className="flex-1 w-full bg-[#1e1e1e] relative">
          <Editor
            height="100%"
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
