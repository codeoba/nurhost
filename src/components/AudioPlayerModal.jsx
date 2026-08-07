import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  RotateCw, 
  Download, 
  Share2, 
  Music, 
  Sparkles, 
  Radio, 
  Repeat,
  Copy,
  Check
} from 'lucide-react';
import { resolveFileUrl } from '../api';

export default function AudioPlayerModal({ file, onClose, onShare, onToast }) {
  const audioSrc = resolveFileUrl(file.url, file.cleanFilename, file.name);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(165); // default fallback ~2:45
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [isLooping, setIsLooping] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.playbackRate = playbackRate;
      audioRef.current.loop = isLooping;
    }
  }, [volume, playbackRate, isLooping]);

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

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const formatTime = (secs) => {
    if (isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const copyDirectLink = () => {
    navigator.clipboard.writeText(file.shareUrl || window.location.href);
    setCopiedLink(true);
    if (onToast) onToast('Share link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-card animate-slide-up"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '540px', background: 'var(--bg-secondary)', overflow: 'hidden' }}
      >
        <audio
          ref={audioRef}
          key={audioSrc}
          src={audioSrc}
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => setIsPlaying(false)}
        />

        {/* Modal Top Bar */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="badge badge-indigo">
              <Music size={12} /> Audio Studio Player
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {file.bitrate || '320 kbps'} HQ
            </span>
          </div>

          <button onClick={onClose} className="btn btn-ghost btn-icon">
            <X size={18} />
          </button>
        </div>

        {/* Player Vinyl Visual Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
          padding: '32px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Background Ambient Glow */}
          <div style={{
            position: 'absolute',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.4) 0%, rgba(0,0,0,0) 70%)',
            top: '-50px',
            filter: 'blur(30px)'
          }} />

          {/* Animated Audio Disc */}
          <div style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, #312e81 20%, #0f172a 100%)',
            border: '6px solid rgba(255, 255, 255, 0.15)',
            boxShadow: isPlaying ? '0 0 35px rgba(99, 102, 241, 0.6)' : '0 10px 25px rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
            position: 'relative',
            animation: isPlaying ? 'rotateDisc 8s linear infinite' : 'none'
          }}>
            <Music size={40} color="#818cf8" />
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: '#ffffff',
              position: 'absolute',
              border: '4px solid #312e81'
            }} />
          </div>

          <style>{`
            @keyframes rotateDisc {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>

          <h2 style={{ color: '#ffffff', fontSize: '18px', fontWeight: '800', textAlign: 'center', marginBottom: '4px' }}>
            {file.name}
          </h2>
          <p style={{ color: '#93c5fd', fontSize: '13px', textAlign: 'center' }}>
            {file.artist || 'NurHost Audio Track'} • {file.album || 'Cloud Vault'}
          </p>

          {/* Waveform Visualization Bars */}
          <div className="bar-waveform" style={{ marginTop: '20px', width: '100%', maxWidth: '320px' }}>
            {[40, 70, 30, 85, 100, 60, 90, 45, 80, 60, 95, 30, 75, 90, 50, 85, 65, 40, 90, 30].map((h, i) => (
              <div 
                key={i} 
                className={`wave-bar ${isPlaying ? 'active' : ''}`}
                style={{
                  height: isPlaying ? `${Math.min(100, h * (isPlaying ? 1.1 : 0.4))}%` : '20%',
                  animationDelay: `${(i % 5) * 0.15}s`
                }}
              />
            ))}
          </div>
        </div>

        {/* Audio Scrubber & Controls */}
        <div className="modal-body" style={{ padding: '24px' }}>
          {/* Time Scrubber Slider */}
          <div style={{ marginBottom: '16px' }}>
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              style={{
                width: '100%',
                accentColor: 'var(--accent-primary)',
                height: '6px',
                borderRadius: '3px',
                cursor: 'pointer'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px', fontWeight: '600' }}>
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Player Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            {/* Speed Selector */}
            <button
              onClick={() => {
                const rates = [0.75, 1.0, 1.25, 1.5, 2.0];
                const next = rates[(rates.indexOf(playbackRate) + 1) % rates.length];
                setPlaybackRate(next);
              }}
              className="btn btn-ghost"
              style={{ fontSize: '12px', fontWeight: '700', padding: '4px 8px' }}
            >
              {playbackRate}x Speed
            </button>

            {/* Rewind 10s */}
            <button
              onClick={() => {
                if (audioRef.current) audioRef.current.currentTime -= 10;
              }}
              className="btn btn-ghost btn-icon"
            >
              <RotateCcw size={18} />
            </button>

            {/* Main Play / Pause Button */}
            <button
              onClick={togglePlay}
              className="btn btn-primary btn-icon animate-pulse"
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                boxShadow: '0 8px 24px rgba(79, 70, 229, 0.5)'
              }}
            >
              {isPlaying ? <Pause size={24} fill="#fff" /> : <Play size={24} fill="#fff" style={{ marginLeft: '3px' }} />}
            </button>

            {/* Fast Forward 10s */}
            <button
              onClick={() => {
                if (audioRef.current) audioRef.current.currentTime += 10;
              }}
              className="btn btn-ghost btn-icon"
            >
              <RotateCw size={18} />
            </button>

            {/* Loop Toggle */}
            <button
              onClick={() => setIsLooping(!isLooping)}
              className="btn btn-ghost btn-icon"
              style={{ color: isLooping ? 'var(--accent-primary)' : 'var(--text-muted)' }}
              title="Repeat Track"
            >
              <Repeat size={18} />
            </button>
          </div>

          {/* Volume Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-tertiary)', padding: '8px 14px', borderRadius: 'var(--radius-md)' }}>
            <button
              onClick={() => {
                setIsMuted(!isMuted);
                if (audioRef.current) audioRef.current.muted = !isMuted;
              }}
              className="btn btn-ghost btn-icon"
              style={{ width: '28px', height: '28px' }}
            >
              {isMuted || volume === 0 ? <VolumeX size={16} color="var(--accent-pink)" /> : <Volume2 size={16} />}
            </button>

            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                setVolume(v);
                setIsMuted(v === 0);
              }}
              style={{
                flex: 1,
                accentColor: 'var(--accent-primary)',
                height: '4px',
                cursor: 'pointer'
              }}
            />
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <button onClick={copyDirectLink} className="btn btn-secondary" style={{ fontSize: '13px' }}>
            {copiedLink ? <Check size={16} color="var(--accent-emerald)" /> : <Copy size={16} />}
            {copiedLink ? 'Link Copied!' : 'Copy Share Link'}
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => { onClose(); onShare(file); }} className="btn btn-secondary" style={{ fontSize: '13px' }}>
              <Share2 size={16} /> Share Settings
            </button>

            <a
              href={audioSrc}
              download={file.name}
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary"
              style={{ fontSize: '13px', textDecoration: 'none' }}
            >
              <Download size={16} /> Download MP3
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
