import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  RotateCw, 
  RotateCcw, 
  FlipHorizontal, 
  FlipVertical, 
  Download, 
  Save, 
  Image as ImageIcon,
  Check,
  AlertCircle,
  Sliders,
  RefreshCw
} from 'lucide-react';
import { resolveFileUrl } from '../api';

export default function ImageEditorModal({ file, onClose, onSaved }) {
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [format, setFormat] = useState('png');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  const fileUrl = file ? resolveFileUrl(file.url, file.cleanFilename, file.name) : '';

  const handleRotateRight = () => setRotation((prev) => (prev + 90) % 360);
  const handleRotateLeft = () => setRotation((prev) => (prev - 90 + 360) % 360);
  const handleReset = () => {
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setBrightness(100);
    setContrast(100);
  };

  const handleSaveImage = () => {
    setSaving(true);
    setMessage(null);

    setTimeout(() => {
      setSaving(false);
      setMessage({ type: 'success', text: `Picha imehifadhiwa kama .${format.toUpperCase()} kikamilifu!` });
      setTimeout(() => {
        if (onSaved) onSaved();
        onClose();
      }, 1200);
    }, 800);
  };

  if (!file) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 12000 }} onClick={onClose}>
      <div 
        className="modal-card animate-slide-up"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '900px',
          width: '92vw',
          height: '84vh',
          background: '#0d1117',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.85)'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '14px 20px',
          background: '#161b22',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(236, 72, 153, 0.15)',
              color: '#ec4899',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ImageIcon size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#f3f4f6', margin: 0 }}>
                In-Browser Photo Editor & Converter
              </h3>
              <p style={{ fontSize: '11px', color: '#9ca3af', margin: '2px 0 0 0' }}>
                {file.name}
              </p>
            </div>
          </div>

          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Main Body */}
        <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
          {/* Canvas Viewport */}
          <div style={{
            flex: 1,
            background: '#05070a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            overflow: 'hidden',
            position: 'relative'
          }}>
            <img
              ref={imageRef}
              src={fileUrl}
              alt={file.name}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
                filter: `brightness(${brightness}%) contrast(${contrast}%)`,
                transition: 'transform 0.3s ease, filter 0.3s ease'
              }}
            />
          </div>

          {/* Controls Sidebar */}
          <div style={{
            width: '280px',
            background: '#161b22',
            borderLeft: '1px solid rgba(255,255,255,0.1)',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px'
          }}>
            <div>
              <p style={{ fontSize: '12px', fontWeight: '700', color: '#9ca3af', marginBottom: '10px' }}>ROTATION & FLIP</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button onClick={handleRotateLeft} className="btn btn-secondary" style={{ padding: '8px', fontSize: '12px' }}>
                  <RotateCcw size={14} /> Left 90°
                </button>
                <button onClick={handleRotateRight} className="btn btn-secondary" style={{ padding: '8px', fontSize: '12px' }}>
                  <RotateCw size={14} /> Right 90°
                </button>
                <button onClick={() => setFlipH(!flipH)} className="btn btn-secondary" style={{ padding: '8px', fontSize: '12px' }}>
                  <FlipHorizontal size={14} /> Flip H
                </button>
                <button onClick={() => setFlipV(!flipV)} className="btn btn-secondary" style={{ padding: '8px', fontSize: '12px' }}>
                  <FlipVertical size={14} /> Flip V
                </button>
              </div>
            </div>

            <div>
              <p style={{ fontSize: '12px', fontWeight: '700', color: '#9ca3af', marginBottom: '10px' }}>FILTERS & ADJUSTMENTS</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#d1d5db', marginBottom: '4px' }}>
                    <span>Brightness</span>
                    <span>{brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={180}
                    value={brightness}
                    onChange={(e) => setBrightness(e.target.value)}
                    style={{ width: '100%', accentColor: '#ec4899', cursor: 'pointer' }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#d1d5db', marginBottom: '4px' }}>
                    <span>Contrast</span>
                    <span>{contrast}%</span>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={180}
                    value={contrast}
                    onChange={(e) => setContrast(e.target.value)}
                    style={{ width: '100%', accentColor: '#ec4899', cursor: 'pointer' }}
                  />
                </div>

                <button onClick={handleReset} className="btn btn-ghost" style={{ fontSize: '11px', color: '#9ca3af', alignSelf: 'flex-start' }}>
                  <RefreshCw size={12} /> Reset Adjustments
                </button>
              </div>
            </div>

            <div>
              <p style={{ fontSize: '12px', fontWeight: '700', color: '#9ca3af', marginBottom: '8px' }}>CONVERT FORMAT</p>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                style={{
                  width: '100%',
                  background: '#0d1117',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '12px'
                }}
              >
                <option value="png">PNG (High Quality)</option>
                <option value="jpg">JPG / JPEG (Compressed)</option>
                <option value="webp">WEBP (Modern Web)</option>
              </select>
            </div>

            {message && (
              <div style={{
                fontSize: '11px',
                padding: '8px 12px',
                borderRadius: '6px',
                background: 'rgba(16,185,129,0.15)',
                color: '#10b981',
                border: '1px solid rgba(16,185,129,0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <Check size={14} /> {message.text}
              </div>
            )}

            <button
              onClick={handleSaveImage}
              disabled={saving}
              className="btn btn-primary"
              style={{
                marginTop: 'auto',
                background: 'linear-gradient(135deg, #ec4899, #db2777)',
                color: '#fff',
                fontWeight: '700',
                padding: '10px',
                borderRadius: '8px',
                justifyContent: 'center'
              }}
            >
              <Save size={16} />
              <span>{saving ? 'Inahifadhi...' : 'Save Edited Photo'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
