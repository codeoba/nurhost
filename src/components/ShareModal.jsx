import React, { useState } from 'react';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  Lock, 
  Calendar, 
  Link2, 
  ShieldCheck, 
  UserPlus, 
  Mail,
  ChevronDown
} from 'lucide-react';

export default function ShareModal({ file, onClose, onToast }) {
  const [copiedShare, setCopiedShare] = useState(false);
  const [copiedDirect, setCopiedDirect] = useState(false);
  const [passwordEnabled, setPasswordEnabled] = useState(file.passwordProtected || false);
  const [password, setPassword] = useState('');
  const [expiryEnabled, setExpiryEnabled] = useState(false);
  const [expiryDate, setExpiryDate] = useState('');
  const [allowDirectAccess, setAllowDirectAccess] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('can_view');
  const [invitedUsers, setInvitedUsers] = useState([
    { email: 'team@nurhost.app', role: 'Can Edit' }
  ]);

  const shareUrl = file.shareUrl || `https://nurhost.app/drive/s/${file.shareCode || 'U4WQceXTvogbqFC7iJmyq9UsK80E9q'}`;
  const directUrl = file.directUrl || `https://nurhost.app/direct/${file.name}`;

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedShare(true);
    if (onToast) onToast('Public shareable link copied!');
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const copyDirectLink = () => {
    navigator.clipboard.writeText(directUrl);
    setCopiedDirect(true);
    if (onToast) onToast('Direct stream link copied!');
    setTimeout(() => setCopiedDirect(false), 2000);
  };

  const handleSendInvite = (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setInvitedUsers([...invitedUsers, { email: inviteEmail, role: inviteRole === 'can_view' ? 'Can View' : 'Can Edit' }]);
    setInviteEmail('');
    if (onToast) onToast(`Invitation sent to ${inviteEmail}`);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-card animate-slide-up"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '620px', background: 'var(--bg-secondary)' }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'var(--accent-primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-primary)'
            }}>
              <Share2 size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>
                Share "{file.name}"
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Configure access permissions and public shareable links
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-icon">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Public Shareable Link Generator */}
          <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '13px', color: 'var(--text-primary)' }}>
                <Link2 size={16} color="var(--accent-primary)" /> Shareable Link
              </div>
              <span className="badge badge-emerald">
                Public Access Enabled
              </span>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <input
                type="text"
                readOnly
                value={shareUrl}
                style={{
                  flex: 1,
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '8px 12px',
                  fontSize: '13px',
                  color: 'var(--text-primary)',
                  fontFamily: "'JetBrains Mono', monospace"
                }}
              />
              <button onClick={copyShareLink} className="btn btn-primary" style={{ fontSize: '13px' }}>
                {copiedShare ? <Check size={16} /> : <Copy size={16} />}
                {copiedShare ? 'Copied' : 'Copy'}
              </button>
            </div>

            {/* Direct Link Section */}
            {allowDirectAccess && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-secondary)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border-color)' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: "'JetBrains Mono', monospace" }}>
                  Direct URL: {directUrl}
                </span>
                <button onClick={copyDirectLink} className="btn btn-ghost" style={{ fontSize: '12px', padding: '4px 8px', color: 'var(--accent-cyan)' }}>
                  {copiedDirect ? 'Copied' : 'Copy Direct'}
                </button>
              </div>
            )}
          </div>

          {/* Advanced Link Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h4 style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              SECURITY & ACCESS CONTROL
            </h4>

            {/* Password Protection */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Lock size={16} color="var(--accent-amber)" />
                <div>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>Password Protection</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Require password to view or stream file</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={passwordEnabled}
                onChange={(e) => setPasswordEnabled(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
              />
            </div>

            {passwordEnabled && (
              <input
                type="password"
                placeholder="Set access password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '8px 12px',
                  fontSize: '13px',
                  color: 'var(--text-primary)'
                }}
              />
            )}

            {/* Link Expiration */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Calendar size={16} color="var(--accent-cyan)" />
                <div>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>Link Expiration Date</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Automatically disable link after date</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={expiryEnabled}
                onChange={(e) => setExpiryEnabled(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
              />
            </div>

            {expiryEnabled && (
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '8px 12px',
                  fontSize: '13px',
                  color: 'var(--text-primary)'
                }}
              />
            )}
          </div>

          {/* Email Invites Section */}
          <div>
            <h4 style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
              PEOPLE WITH ACCESS
            </h4>

            <form onSubmit={handleSendInvite} style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '0 10px' }}>
                <Mail size={16} color="var(--text-muted)" style={{ marginRight: '8px' }} />
                <input
                  type="email"
                  placeholder="Enter email address..."
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '13px', width: '100%' }}
                />
              </div>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', padding: '0 10px', fontSize: '13px' }}
              >
                <option value="can_view">Can View</option>
                <option value="can_edit">Can Edit</option>
              </select>
              <button type="submit" className="btn btn-secondary" style={{ fontSize: '13px' }}>
                Invite
              </button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-tertiary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img src={file.owner?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'} alt="Owner" style={{ width: '28px', height: '28px', borderRadius: '50%' }} />
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{file.owner?.name || 'Administrator'}</p>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{file.owner?.email || 'admin@nurhost.app'}</p>
                  </div>
                </div>
                <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--accent-primary)' }}>Owner</span>
              </div>

              {invitedUsers.map((user, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--accent-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: 'var(--accent-primary)' }}>
                      {user.email.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{user.email}</span>
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{user.role}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-primary" style={{ fontSize: '13px' }}>
            Save Share Settings
          </button>
        </div>
      </div>
    </div>
  );
}
