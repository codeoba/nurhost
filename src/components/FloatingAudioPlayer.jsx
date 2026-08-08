import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Music, 
  X, 
  Maximize2,
  Repeat,
  Shuffle
} from 'lucide-react';
import { resolveFileUrl } from '../api';

export default function FloatingAudioPlayer({ 
  currentTrack, 
  playlist = [], 
  onClose, 
  onTrackChange 
}) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(false);

  useEffect(() => {
    if (currentTrack && audioRef.current) {
      const url = resolveFileUrl(currentTrack.url, currentTrack.cleanFilename, currentTrack.name);
      audioRef.current.src = url;
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  }, [currentTrack]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleEnded = () => {
    if (isLooping && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      return;
    }

    // Auto-Play Next Track in Queue
    if (playlist.length > 0 && currentTrack) {
      const currentIndex = playlist.findIndex(t => t.id === currentTrack.id);
      if (currentIndex !== -1 && currentIndex < playlist.length - 1) {
        if (onTrackChange) onTrackChange(playlist[currentIndex + 1]);
      } else {
        setIsPlaying(false);
      }
    } else {
      setIsPlaying(false);
    }
  };

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) audioRef.current.currentTime = time;
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
      setIsMuted(val === 0);
    }
  };

  const formatTime = (secs) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!currentTrack) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 10000,
      width: '420px',
      maxWidth: 'calc(100vw - 32px)',
      background: 'rgba(15, 23, 42, 0.92)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(99, 102, 241, 0.3)',
      borderRadius: '16px',
      padding: '14px 18px',
      boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.6)',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      color: '#fff'
    }} className="animate-slide-up">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      />

      {/* Header Info */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            flexShrink: 0
          }}>
            <Music size={18} className={isPlaying ? 'animate-pulse' : ''} />
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: '13px', fontWeight: '700', color: '#f3f4f6', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {currentTrack.name || currentTrack.originalFilename || 'Audio Track'}
            </p>
            <p style={{ fontSize: '11px', color: '#9ca3af', margin: '2px 0 0 0' }}>
              NurHost Floating Player • {formatTime(currentTime)} / {formatTime(duration)}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '4px' }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Progress Bar */}
      <input
        type="range"
        min={0}
        max={duration || 100}
        value={currentTime}
        onChange={handleSeek}
        style={{
          width: '100%',
          height: '4px',
          accentColor: '#6366f1',
          cursor: 'pointer'
        }}
      />

      {/* Player Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setIsLooping(!isLooping)}
            style={{ background: 'transparent', border: 'none', color: isLooping ? '#6366f1' : '#6b7280', cursor: 'pointer' }}
            title="Loop Track"
          >
            <Repeat size={15} />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={togglePlay}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: '#6366f1',
              border: 'none',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)'
            }}
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: '2px' }} />}
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Volume2 size={15} color="#9ca3af" />
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={handleVolumeChange}
            style={{ width: '60px', height: '3px', accentColor: '#6366f1', cursor: 'pointer' }}
          />
        </div>
      </div>
    </div>
  );
}
