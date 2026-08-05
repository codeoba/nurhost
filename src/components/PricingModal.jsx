import React from 'react';
import { X, Check, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { PRICING_PLANS } from '../mockData';

export default function PricingModal({ onClose, onToast }) {
  const handleUpgrade = (planName) => {
    if (onToast) onToast(`Subscribed to ${planName}! Storage upgrade activated.`);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-card animate-slide-up"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '900px', background: 'var(--bg-secondary)' }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={22} color="var(--accent-primary)" />
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)' }}>
                Upgrade NurHost Storage & Speed
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Unlock high-speed streaming CDN, unlimited direct links & encrypted vaults
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-icon">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', padding: '28px' }}>
          {PRICING_PLANS.map((plan) => (
            <div
              key={plan.id}
              style={{
                background: plan.popular ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
                border: plan.popular ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                boxShadow: plan.popular ? '0 10px 30px rgba(79, 70, 229, 0.2)' : 'none'
              }}
            >
              {plan.popular && (
                <span className="badge badge-indigo" style={{ position: 'absolute', top: '-12px', right: '20px' }}>
                  <Zap size={10} /> MOST POPULAR
                </span>
              )}

              <div>
                <h4 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {plan.name}
                </h4>
                <p style={{ fontSize: '12px', color: 'var(--accent-primary)', fontWeight: '700', marginBottom: '16px' }}>
                  {plan.storage}
                </p>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '20px' }}>
                  <span style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-primary)' }}>{plan.price}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>/{plan.period}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                  {plan.features.map((feat, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      <Check size={16} color="var(--accent-emerald)" style={{ flexShrink: 0 }} />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleUpgrade(plan.name)}
                className={`btn ${plan.popular ? 'btn-primary' : 'btn-secondary'}`}
                style={{ width: '100%', padding: '10px' }}
              >
                {plan.id === 'free' ? 'Current Plan' : `Upgrade to ${plan.name}`}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
