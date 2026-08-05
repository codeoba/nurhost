import React, { useState } from 'react';
import {
  Database,
  Music,
  Video,
  Image as ImageIcon,
  FileText,
  Archive,
  Code,
  TrendingUp,
  X,
  HardDrive,
  Zap,
  Globe
} from 'lucide-react';
import { STORAGE_STATS } from '../mockData';

// Donut Chart via SVG
function DonutChart({ breakdown, usedPercent }) {
  const SIZE = 180;
  const STROKE = 28;
  const R = (SIZE - STROKE) / 2;
  const CIRC = 2 * Math.PI * R;
  const center = SIZE / 2;

  let cumulativeOffset = 0;
  // Start from top (-90deg = offset = CIRC * 0.25)
  const startOffset = CIRC * 0.25;

  const segments = breakdown.map((item) => {
    const dash = (item.percent / 100) * CIRC;
    const gap = CIRC - dash;
    const offset = CIRC - cumulativeOffset + startOffset;
    cumulativeOffset += dash;
    return { ...item, dash, gap, offset: offset % CIRC };
  });

  return (
    <div style={{ position: 'relative', width: SIZE, height: SIZE, flexShrink: 0 }}>
      <svg width={SIZE} height={SIZE} style={{ transform: 'rotate(0deg)' }}>
        {/* Background Track */}
        <circle
          cx={center} cy={center} r={R}
          fill="none"
          stroke="var(--bg-tertiary)"
          strokeWidth={STROKE}
        />
        {/* Segments */}
        {segments.map((seg, i) => (
          <circle
            key={i}
            cx={center} cy={center} r={R}
            fill="none"
            stroke={seg.color}
            strokeWidth={STROKE}
            strokeDasharray={`${seg.dash} ${CIRC - seg.dash}`}
            strokeDashoffset={seg.offset}
            strokeLinecap="butt"
            style={{ transition: 'stroke-dasharray 0.6s ease', filter: `drop-shadow(0 2px 6px ${seg.color}44)` }}
          />
        ))}
      </svg>
      {/* Center Label */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center'
      }}>
        <span style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-primary)', lineHeight: 1 }}>
          {usedPercent}%
        </span>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', marginTop: '4px' }}>
          USED
        </span>
      </div>
    </div>
  );
}

export default function StorageAnalyticsModal({ isOpen, onClose, onOpenPricing }) {
  const [hoveredType, setHoveredType] = useState(null);

  if (!isOpen) return null;

  const usedMB = (STORAGE_STATS.usedBytes / (1024 * 1024)).toFixed(1);
  const totalGB = (STORAGE_STATS.totalBytes / (1024 * 1024 * 1024)).toFixed(0);
  const freeGB = ((STORAGE_STATS.totalBytes - STORAGE_STATS.usedBytes) / (1024 * 1024 * 1024)).toFixed(2);
  const usedPercent = ((STORAGE_STATS.usedBytes / STORAGE_STATS.totalBytes) * 100).toFixed(1);

  const typeIcons = {
    audio: <Music size={15} />,
    video: <Video size={15} />,
    image: <ImageIcon size={15} />,
    document: <FileText size={15} />,
    archive: <Archive size={15} />,
    code: <Code size={15} />
  };

  // Sort breakdown by bytes descending
  const sortedBreakdown = [...STORAGE_STATS.breakdown].sort((a, b) => b.bytes - a.bytes);

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{ zIndex: 1100 }}
    >
      <div
        className="modal-card animate-slide-up"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '620px', width: '100%' }}
      >
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px', height: '38px', borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(79,70,229,0.2), rgba(139,92,246,0.2))',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Database size={20} color="var(--accent-primary)" />
            </div>
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                Storage Analytics
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                Full breakdown of your NurHost storage usage
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-icon"
            style={{ width: '32px', height: '32px' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ padding: '24px' }}>

          {/* Top Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '28px' }}>
            {[
              { label: 'Total Storage', value: `${totalGB} GB`, icon: <HardDrive size={18} />, color: '#6366f1' },
              { label: 'Used Space', value: `${usedMB} MB`, icon: <Database size={18} />, color: '#ec4899' },
              { label: 'Free Space', value: `${freeGB} GB`, icon: <Zap size={18} />, color: '#10b981' }
            ].map((stat, i) => (
              <div key={i} style={{
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '38px', height: '38px', borderRadius: '10px',
                  background: `${stat.color}22`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 10px',
                  color: stat.color
                }}>
                  {stat.icon}
                </div>
                <p style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {stat.value}
                </p>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* Donut Chart + Breakdown Side by Side */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '28px',
            background: 'var(--bg-tertiary)',
            borderRadius: 'var(--radius-md)',
            padding: '24px',
            border: '1px solid var(--border-color)',
            marginBottom: '20px'
          }}>
            {/* Donut */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <DonutChart breakdown={STORAGE_STATS.breakdown} usedPercent={usedPercent} />
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
                <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{usedMB} MB</span> of {totalGB} GB
              </p>
            </div>

            {/* Breakdown List */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                Breakdown by Type
              </p>
              {sortedBreakdown.map((item, i) => (
                <div
                  key={i}
                  onMouseEnter={() => setHoveredType(item.type)}
                  onMouseLeave={() => setHoveredType(null)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: hoveredType === item.type ? 'var(--bg-secondary)' : 'transparent',
                    transition: 'background 0.15s ease',
                    cursor: 'default'
                  }}
                >
                  {/* Color dot + icon */}
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '8px',
                    background: `${item.color}22`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: item.color,
                    flexShrink: 0
                  }}>
                    {typeIcons[item.type] || <HardDrive size={14} />}
                  </div>

                  {/* Label + bar */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
                        {item.label}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>
                        {item.sizeFormatted} <span style={{ color: item.color }}>({item.percent}%)</span>
                      </span>
                    </div>
                    <div style={{
                      height: '6px',
                      background: 'var(--border-color)',
                      borderRadius: 'var(--radius-full)',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${item.percent}%`,
                        height: '100%',
                        background: `linear-gradient(90deg, ${item.color}cc, ${item.color})`,
                        borderRadius: 'var(--radius-full)',
                        transition: 'width 0.5s ease'
                      }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upgrade Banner */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(79,70,229,0.15), rgba(139,92,246,0.10))',
            border: '1px solid rgba(79,70,229,0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Globe size={20} color="var(--accent-primary)" />
              <div>
                <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '2px' }}>
                  Need more storage?
                </p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Upgrade to NurHost Pro — 100 GB for just $4.99/month
                </p>
              </div>
            </div>
            <button
              onClick={() => { onOpenPricing(); onClose(); }}
              className="btn btn-primary"
              style={{ fontSize: '13px', padding: '8px 20px', whiteSpace: 'nowrap' }}
            >
              <TrendingUp size={14} /> Upgrade Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
