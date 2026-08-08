import React, { useState, useEffect } from 'react';
import {
  X, User, Shield, Key, Lock, CheckCircle2, AlertCircle, Copy, Check,
  QrCode, RefreshCw, Cpu, Database, HardDrive, Smartphone, History
} from 'lucide-react';
import {
  getUserProfileApi, updateUserProfileApi, changePasswordApi,
  setup2FAApi, toggle2FAApi, getActivityLogsApi, generateApiKeyApi
} from '../api';

export default function ProfileModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'security' | 'apikeys'
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  // Profile State
  const [name, setName] = useState('Mdandu Host Admin');
  const [email, setEmail] = useState('demo@nurhost.mdandu.com');
  const [plan, setPlan] = useState('PRO Enterprise');
  const [storageUsed, setStorageUsed] = useState(24576000000); // 24.5 GB
  const [storageLimit, setStorageLimit] = useState(107374182400); // 100 GB
  const [avatarUrl, setAvatarUrl] = useState('');

  // Security State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [totpSecret, setTotpSecret] = useState('');
  const [activityLogs, setActivityLogs] = useState([]);

  // API Keys State
  const [generatedApiKey, setGeneratedApiKey] = useState('');
  const [copiedKey, setCopiedKey] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadProfileData();
      loadActivityLogs();
    }
  }, [isOpen]);

  const loadProfileData = async () => {
    setLoading(true);
    try {
      const data = await getUserProfileApi();
      if (data && data.success && data.user) {
        setName(data.user.name || 'Mdandu Host Admin');
        setEmail(data.user.email || 'demo@nurhost.mdandu.com');
        setPlan(data.user.plan || 'PRO Enterprise');
        setStorageUsed(data.user.storageUsed || 24576000000);
        setStorageLimit(data.user.storageLimit || 107374182400);
        setIs2FAEnabled(!!data.user.is2FAEnabled);
        setAvatarUrl(data.user.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(data.user.email)}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadActivityLogs = async () => {
    try {
      const res = await getActivityLogsApi();
      if (res && res.success && res.logs) {
        setActivityLogs(res.logs);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setStatusMsg(null);
    try {
      const res = await updateUserProfileApi({ name, email });
      if (res && res.success) {
        setStatusMsg({ type: 'success', text: ' Profile yako imesasishwa kikamilifu!' });
      } else {
        setStatusMsg({ type: 'error', text: res.error || 'Imeshindwa kusasisha profile.' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Imeshindwa kusasisha profile.' });
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setStatusMsg(null);
    if (newPassword !== confirmPassword) {
      setStatusMsg({ type: 'error', text: 'Password mpya na ya kuthibitisha hazifanani!' });
      return;
    }
    try {
      const res = await changePasswordApi(currentPassword, newPassword);
      if (res && res.success) {
        setStatusMsg({ type: 'success', text: res.message || '🔒 Password imebadilishwa kikamilifu!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setStatusMsg({ type: 'error', text: res.error || 'Imeshindwa kubadilisha password.' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Imeshindwa kubadilisha password.' });
    }
  };

  const handleSetup2FA = async () => {
    setStatusMsg(null);
    try {
      const res = await setup2FAApi();
      if (res && res.success) {
        setQrCodeDataUrl(res.qrCodeDataUrl);
        setTotpSecret(res.secret);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggle2FA = async (enable) => {
    try {
      const res = await toggle2FAApi(enable);
      if (res && res.success) {
        setIs2FAEnabled(res.is2FAEnabled);
        setStatusMsg({ type: 'success', text: res.message });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateApiKey = async () => {
    try {
      const res = await generateApiKeyApi();
      if (res && res.success && res.apiKey) {
        setGeneratedApiKey(res.apiKey);
        loadActivityLogs();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  if (!isOpen) return null;

  const usedGb = (storageUsed / (1024 * 1024 * 1024)).toFixed(1);
  const limitGb = (storageLimit / (1024 * 1024 * 1024)).toFixed(0);
  const usedPercent = Math.min(100, Math.round((storageUsed / storageLimit) * 100));

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1050 }}>
      <div
        className="modal-card animate-slide-up"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '780px',
          maxWidth: '92vw',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          background: '#0d1117',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75)',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.5), transparent)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <img
              src={avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=admin`}
              alt="User Avatar"
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                border: '2px solid var(--accent-primary)',
                background: '#161b22',
                padding: '2px'
              }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#ffffff', margin: 0 }}>{name}</h3>
                <span style={{
                  fontSize: '11px',
                  fontWeight: '800',
                  color: '#38bdf8',
                  background: 'rgba(56, 189, 248, 0.15)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  padding: '2px 8px',
                  borderRadius: '12px'
                }}>
                  {plan}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>{email}</p>
            </div>
          </div>

          <button onClick={onClose} className="btn btn-ghost btn-icon" style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: '#161b22',
          padding: '0 24px'
        }}>
          <button
            onClick={() => setActiveTab('profile')}
            style={{
              padding: '12px 18px',
              fontSize: '13px',
              fontWeight: '700',
              color: activeTab === 'profile' ? 'var(--accent-primary)' : 'var(--text-muted)',
              borderBottom: activeTab === 'profile' ? '2px solid var(--accent-primary)' : '2px solid transparent',
              background: 'transparent',
              borderLeft: 'none', borderRight: 'none', borderTop: 'none',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
            <User size={16} />
            <span>Profile & Hifadhi</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            style={{
              padding: '12px 18px',
              fontSize: '13px',
              fontWeight: '700',
              color: activeTab === 'security' ? 'var(--accent-primary)' : 'var(--text-muted)',
              borderBottom: activeTab === 'security' ? '2px solid var(--accent-primary)' : '2px solid transparent',
              background: 'transparent',
              borderLeft: 'none', borderRight: 'none', borderTop: 'none',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
            <Shield size={16} />
            <span>Usalama & 2FA</span>
          </button>

          <button
            onClick={() => setActiveTab('apikeys')}
            style={{
              padding: '12px 18px',
              fontSize: '13px',
              fontWeight: '700',
              color: activeTab === 'apikeys' ? 'var(--accent-primary)' : 'var(--text-muted)',
              borderBottom: activeTab === 'apikeys' ? '2px solid var(--accent-primary)' : '2px solid transparent',
              background: 'transparent',
              borderLeft: 'none', borderRight: 'none', borderTop: 'none',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
            <Key size={16} />
            <span>API Access Keys</span>
          </button>
        </div>

        {/* Toast Status Notification */}
        {statusMsg && (
          <div style={{
            margin: '16px 24px 0 24px',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: statusMsg.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            color: statusMsg.type === 'success' ? '#10b981' : '#f87171',
            border: statusMsg.type === 'success' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)'
          }}>
            {statusMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* Content Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>

          {/* TAB 1: PROFILE & STORAGE */}
          {activeTab === 'profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Storage Usage Card */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.9))',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <HardDrive size={20} color="var(--accent-primary)" />
                    <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#fff', margin: 0 }}>Hali ya Hifadhi Yako (Storage Gauge)</h4>
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--accent-cyan)' }}>
                    {usedGb} GB / {limitGb} GB ({usedPercent}%)
                  </span>
                </div>

                <div style={{ height: '10px', width: '100%', background: '#1e293b', borderRadius: '5px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${usedPercent}%`,
                    background: 'linear-gradient(90deg, #6366f1, #06b6d4, #10b981)',
                    borderRadius: '5px'
                  }} />
                </div>
              </div>

              {/* Edit Profile Form */}
              <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Jina Lako Kamili (Full Name)
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#161b22',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      color: '#fff',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Anwani ya Barua Pepe (Email Address)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#161b22',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      color: '#fff',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                    required
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <button type="submit" className="btn btn-primary" style={{ fontSize: '13px' }}>
                    Hifadhi Mabadiliko ya Profile
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: SECURITY & 2FA */}
          {activeTab === 'security' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Change Password Form */}
              <div style={{
                background: '#161b22',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <Lock size={18} color="var(--accent-primary)" />
                  <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#fff', margin: 0 }}>Badilisha Password</h4>
                </div>

                <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <input
                    type="password"
                    placeholder="Password ya sasa (Current Password)"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    style={{
                      width: '100%', background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px', padding: '10px 14px', color: '#fff', fontSize: '13px', outline: 'none'
                    }}
                    required
                  />
                  <input
                    type="password"
                    placeholder="Password mpya (New Password)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{
                      width: '100%', background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px', padding: '10px 14px', color: '#fff', fontSize: '13px', outline: 'none'
                    }}
                    required
                  />
                  <input
                    type="password"
                    placeholder="Thibitisha Password mpya (Confirm Password)"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{
                      width: '100%', background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px', padding: '10px 14px', color: '#fff', fontSize: '13px', outline: 'none'
                    }}
                    required
                  />

                  <button type="submit" className="btn btn-primary" style={{ fontSize: '12px', alignSelf: 'flex-end', background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}>
                    Sasisha Password MPYA
                  </button>
                </form>
              </div>

              {/* 2FA Section */}
              <div style={{
                background: '#161b22',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Smartphone size={18} color="var(--accent-emerald)" />
                    <div>
                      <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#fff', margin: 0 }}>Two-Factor Authentication (2FA)</h4>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>Ongeza ulinzi wa Google Authenticator au Authy</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggle2FA(!is2FAEnabled)}
                    className={`btn ${is2FAEnabled ? 'btn-danger' : 'btn-primary'}`}
                    style={{ fontSize: '12px', padding: '6px 12px' }}
                  >
                    {is2FAEnabled ? 'Zima 2FA' : 'Washa 2FA'}
                  </button>
                </div>

                {!is2FAEnabled && (
                  <div style={{ marginTop: '14px' }}>
                    {!qrCodeDataUrl ? (
                      <button onClick={handleSetup2FA} className="btn btn-ghost" style={{ fontSize: '12px', color: 'var(--accent-cyan)' }}>
                        <QrCode size={16} /> Onyesha QR Code ya Ku-scan (Setup 2FA)
                      </button>
                    ) : (
                      <div style={{ textAlign: 'center', background: '#0d1117', padding: '16px', borderRadius: '10px' }}>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>Scan QR Code hii kwenye App yako ya Google Authenticator:</p>
                        <img src={qrCodeDataUrl} alt="2FA QR Code" style={{ width: '160px', height: '160px', borderRadius: '8px', border: '4px solid #fff' }} />
                        <p style={{ fontSize: '11px', color: '#38bdf8', fontFamily: 'monospace', marginTop: '10px' }}>Secret Key: {totpSecret}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Login Activity Logs */}
              <div style={{
                background: '#161b22',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                  <History size={18} color="var(--accent-cyan)" />
                  <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#fff', margin: 0 }}>Kumbukumbu za Kuingia (Security Activity Logs)</h4>
                </div>

                <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {activityLogs.length === 0 ? (
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Hakuna kumbukumbu bado.</p>
                  ) : (
                    activityLogs.map((log) => (
                      <div key={log.id} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        background: '#0d1117', padding: '8px 12px', borderRadius: '6px', fontSize: '12px'
                      }}>
                        <div>
                          <span style={{ fontWeight: '700', color: '#38bdf8', marginRight: '8px' }}>{log.action}</span>
                          <span style={{ color: 'var(--text-muted)' }}>{log.details || ''}</span>
                        </div>
                        <div style={{ textAlign: 'right', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                          <span>{log.ipAddress || '127.0.0.1'}</span> • <span>{new Date(log.createdAt).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: API KEYS */}
          {activeTab === 'apikeys' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{
                background: '#161b22',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <Cpu size={20} color="var(--accent-primary)" />
                  <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#fff', margin: 0 }}>Developer API Keys Engine</h4>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5', margin: '0 0 16px 0' }}>
                  Tumia API Key hii kuunganisha mfumo wako wa NurHost na Application yoyote, Script au Bot kwa ajili ya ku-upload na download mafaili kiotomatiki kupitia REST API endpoints.
                </p>

                <button
                  onClick={handleGenerateApiKey}
                  className="btn btn-primary"
                  style={{ fontSize: '12px', background: 'linear-gradient(135deg, #06b6d4, #0891b2)' }}
                >
                  <RefreshCw size={14} /> Tengeneza API Access Key Mpya
                </button>

                {generatedApiKey && (
                  <div style={{ marginTop: '16px', background: '#0d1117', padding: '14px', borderRadius: '8px', border: '1px solid var(--accent-cyan)' }}>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--accent-cyan)', fontWeight: '700', marginBottom: '6px' }}>
                      API ACCESS KEY YAKO (HIFADHI MAHALI SALAMA):
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input
                        type="text"
                        readOnly
                        value={generatedApiKey}
                        style={{
                          flex: 1, background: '#161b22', border: 'none', color: '#10b981',
                          padding: '8px 12px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '12px'
                        }}
                      />
                      <button
                        onClick={() => copyToClipboard(generatedApiKey)}
                        className="btn btn-ghost"
                        style={{ fontSize: '12px', color: copiedKey ? '#10b981' : 'var(--text-primary)' }}
                      >
                        {copiedKey ? <Check size={16} /> : <Copy size={16} />}
                        <span>{copiedKey ? 'Imenakiliwa!' : 'Nakili'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
