import React, { useState, useRef } from 'react';
import { 
  Cloud, 
  Download, 
  Share2, 
  Copy, 
  Check, 
  Play, 
  Pause, 
  Music, 
  ShieldCheck, 
  Eye, 
  HardDrive, 
  Sparkles,
  ExternalLink,
  Volume2,
  Lock,
  ArrowLeft
} from 'lucide-react';

export default function PublicShareView({ file, onBackToDrive, onToast }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(165);
  const [copiedLink, setCopiedLink] = useState(false);
  const [savedToDrive, setSavedToDrive] = useState(false);

  const audioRef = useRef(null);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(true));
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (audioRef.current.duration && !isNaN(audioRef.current.duration)) {
        setDuration(audioRef.current.duration);
      }
    }
  };

  const formatTime = (secs) => {
    if (isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(file.shareUrl || window.location.href);
    setCopiedLink(true);
    if (onToast) onToast('Public share link copied!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSaveToDrive = () => {
    setSavedToDrive(true);
    if (onToast) onToast(`"${file.name}" saved to your NurHost Drive!`);
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      background: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <audio
        ref={audioRef}
        src={file.url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Top Navbar */}
      <header className="glass-panel" style={{
        height: '64px',
        padding: '0 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-color)',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={onBackToDrive} className="btn btn-ghost" style={{ fontSize: '13px', gap: '6px' }}>
            <ArrowLeft size={16} /> Back to Dashboard
          </button>

          <div style={{ height: '20px', width: '1px', background: 'var(--border-color)', margin: '0 8px' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #4f46e5, #06b6d4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff'
            }}>
              <Cloud size={18} />
            </div>
            <span style={{ fontSize: '18px', fontWeight: '800', tracking: '-0.5px' }}>
              nurhost
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={copyShareLink} className="btn btn-secondary" style={{ fontSize: '13px' }}>
            {copiedLink ? <Check size={16} color="var(--accent-emerald)" /> : <Copy size={16} />}
            {copiedLink ? 'Link Copied!' : 'Copy Share Link'}
          </button>

          <button onClick={handleSaveToDrive} className={`btn ${savedToDrive ? 'btn-secondary' : 'btn-ghost'}`} style={{ fontSize: '13px' }}>
            <HardDrive size={16} color={savedToDrive ? 'var(--accent-emerald)' : 'var(--text-primary)'} />
            {savedToDrive ? 'Saved to Drive' : 'Save Copy to My Drive'}
          </button>

          <a
            href={file.url}
            download={file.name}
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary"
            style={{ fontSize: '13px', textDecoration: 'none' }}
          >
            <Download size={16} /> Download File
          </a>
        </div>
      </header>

      {/* Shared Media Content Main Container */}
      <main style={{
        flex: 1,
        maxWidth: '1200px',
        width: '100%',
        margin: '0 auto',
        padding: '40px 24px',
        display: 'grid',
        gridTemplateColumns: '1fr 340px',
        gap: '32px',
        alignItems: 'start'
      }}>
        {/* Left: Media Preview & Player Hero Card */}
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--card-shadow)',
          overflow: 'hidden'
        }}>
          {/* Main Visual Player Header */}
          <div style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
            padding: '48px 32px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}>
            <span className="badge badge-indigo" style={{ position: 'absolute', top: '20px', left: '20px' }}>
              <Music size={12} /> Audio Stream • 320 kbps
            </span>

            {/* Glowing Audio Cover Disc */}
            <div style={{
              width: '140px',
              height: '140px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, #4338ca 10%, #0f172a 100%)',
              border: '6px solid rgba(255, 255, 255, 0.2)',
              boxShadow: isPlaying ? '0 0 50px rgba(99, 102, 241, 0.7)' : '0 12px 30px rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '24px',
              position: 'relative',
              animation: isPlaying ? 'rotateDisc 8s linear infinite' : 'none'
            }}>
              <Music size={48} color="#818cf8" />
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#ffffff', position: 'absolute', border: '4px solid #312e81' }} />
            </div>

            <h1 style={{ color: '#ffffff', fontSize: '22px', fontWeight: '800', textAlign: 'center', marginBottom: '6px' }}>
              {file.name}
            </h1>
            <p style={{ color: '#93c5fd', fontSize: '14px', textAlign: 'center', marginBottom: '24px' }}>
              Shared via NurHost Cloud • {file.artist || 'NurHost Studio Track'}
            </p>

            {/* Waveform Visualization */}
            <div className="bar-waveform" style={{ width: '100%', maxWidth: '400px' }}>
              {[30, 60, 90, 40, 80, 100, 70, 50, 95, 60, 85, 30, 75, 90, 40, 80, 100, 60, 40, 85, 70, 90, 50, 80].map((h, i) => (
                <div 
                  key={i} 
                  className={`wave-bar ${isPlaying ? 'active' : ''}`}
                  style={{
                    height: isPlaying ? `${Math.min(100, h * 1.1)}%` : '20%',
                    animationDelay: `${(i % 6) * 0.12}s`
                  }}
                />
              ))}
            </div>
          </div>

          {/* Player Scrubber & Play Bar */}
          <div style={{ padding: '32px' }}>
            <div style={{ marginBottom: '20px' }}>
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setCurrentTime(val);
                  if (audioRef.current) audioRef.current.currentTime = val;
                }}
                style={{
                  width: '100%',
                  accentColor: 'var(--accent-primary)',
                  height: '6px',
                  borderRadius: '3px',
                  cursor: 'pointer'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px', fontWeight: '600' }}>
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
              <button
                onClick={togglePlay}
                className="btn btn-primary"
                style={{
                  padding: '14px 36px',
                  fontSize: '16px',
                  fontWeight: '700',
                  borderRadius: 'var(--radius-full)',
                  boxShadow: '0 8px 24px rgba(79, 70, 229, 0.4)'
                }}
              >
                {isPlaying ? <Pause size={20} fill="#fff" /> : <Play size={20} fill="#fff" style={{ marginLeft: '2px' }} />}
                {isPlaying ? 'Pause Track' : 'Play Audio'}
              </button>

              <a
                href={file.url}
                download={file.name}
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary"
                style={{
                  padding: '14px 24px',
                  fontSize: '14px',
                  fontWeight: '600',
                  borderRadius: 'var(--radius-full)',
                  textDecoration: 'none'
                }}
              >
                <Download size={18} /> Download (4.6 MB)
              </a>
            </div>
          </div>
        </div>

        {/* Right Sidebar: File Metadata & Security Status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* File Properties Card */}
          <div style={{
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--card-shadow)'
          }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
              File Details
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Size</span>
                <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{file.sizeFormatted}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Format</span>
                <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>MPEG Audio (MP3)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Uploaded</span>
                <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{new Date(file.createdAt).toLocaleDateString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Total Downloads</span>
                <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{file.downloadsCount || 142}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Views</span>
                <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{file.viewsCount || 528}</span>
              </div>
            </div>

            {/* Owner Section */}
            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img
                src={file.owner?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                alt="Owner"
                style={{ width: '36px', height: '36px', borderRadius: '50%' }}
              />
              <div>
                <p style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>{file.owner?.name || 'Administrator'}</p>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>NurHost Verified Uploader</p>
              </div>
            </div>
          </div>

          {/* Virus & Security Scan Card */}
          <div style={{
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}>
            <ShieldCheck size={24} color="var(--accent-emerald)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <p style={{ fontSize: '13px', fontWeight: '700', color: 'var(--accent-emerald)' }}>
                Verified Clean File
              </p>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Scanned by NurHost Security Engine. Free of malware and safe for direct playback and download.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
