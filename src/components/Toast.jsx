import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function Toast({ message }) {
  if (!message) return null;

  return (
    <div className="glass-panel animate-slide-up" style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      background: 'var(--bg-secondary)',
      border: '1px solid var(--accent-primary)',
      boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
      borderRadius: 'var(--radius-md)',
      padding: '12px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      zIndex: 200,
      fontSize: '14px',
      fontWeight: '600',
      color: 'var(--text-primary)'
    }}>
      <CheckCircle2 size={18} color="var(--accent-emerald)" />
      {message}
    </div>
  );
}
