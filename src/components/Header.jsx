import React, { useState } from 'react';
import { 
  Cloud, 
  Search, 
  Sun, 
  Moon, 
  Grid, 
  List, 
  Share2, 
  HardDrive, 
  User, 
  Settings, 
  ShieldCheck, 
  LogOut, 
  Sparkles,
  ExternalLink,
  ChevronDown,
  X,
  Filter,
  Languages
} from 'lucide-react';
import { useLanguage } from '../i18n';

export default function Header({ 
  darkMode, 
  setDarkMode, 
  viewMode, 
  setViewMode, 
  searchQuery, 
  setSearchQuery, 
  activeTab, 
  setActiveTab,
  onOpenPricing,
  selectedCategory,
  setSelectedCategory
}) {
  const { lang, toggleLanguage, t } = useLanguage();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSearchFilter, setShowSearchFilter] = useState(false);

  return (
    <header className="glass-panel" style={{
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      borderBottom: '1px solid var(--border-color)',
      zIndex: 50,
      position: 'relative'
    }}>
      {/* Brand & Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div 
          onClick={() => setActiveTab('drive')}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px', 
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #4f46e5, #06b6d4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)'
          }}>
            <Cloud size={24} strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '20px', fontWeight: '800', tracking: '-0.5px', color: 'var(--text-primary)' }}>
                nurhost
              </span>
              <span className="badge badge-indigo" style={{ fontSize: '10px', padding: '2px 6px' }}>
                PRO
              </span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '-2px' }}>
              Cloud Drive & Media Vault
            </p>
          </div>
        </div>

        {/* Quick View Mode Switcher Pill */}
        <div style={{
          display: 'flex',
          background: 'var(--bg-tertiary)',
          borderRadius: 'var(--radius-full)',
          padding: '4px',
          border: '1px solid var(--border-color)',
          marginLeft: '20px'
        }}>
          <button
            onClick={() => setActiveTab('drive')}
            className={`btn ${activeTab === 'drive' ? 'btn-primary' : 'btn-ghost'}`}
            style={{
              padding: '4px 14px',
              fontSize: '12px',
              borderRadius: 'var(--radius-full)',
              height: '28px'
            }}
          >
            <HardDrive size={14} /> My Drive
          </button>
          <button
            onClick={() => setActiveTab('public-share')}
            className={`btn ${activeTab === 'public-share' ? 'btn-primary' : 'btn-ghost'}`}
            style={{
              padding: '4px 14px',
              fontSize: '12px',
              borderRadius: 'var(--radius-full)',
              height: '28px'
            }}
          >
            <Share2 size={14} /> Public Share Link Demo
          </button>
        </div>
      </div>

      {/* Global Search Bar */}
      <div style={{ flex: 1, maxWidth: '520px', margin: '0 24px', position: 'relative' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '0 12px',
          height: '40px',
          transition: 'all 0.2s ease'
        }}>
          <Search size={18} color="var(--text-muted)" style={{ marginRight: '8px' }} />
          <input
            type="text"
            placeholder="Search audio, video, files & folders in NurHost... (Press '/' to focus)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              width: '100%',
              color: 'var(--text-primary)',
              fontSize: '14px'
            }}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="btn btn-ghost btn-icon"
              style={{ width: '24px', height: '24px' }}
            >
              <X size={14} />
            </button>
          )}
          <button
            onClick={() => setShowSearchFilter(!showSearchFilter)}
            className="btn btn-ghost btn-icon"
            style={{ width: '28px', height: '28px', marginLeft: '4px' }}
            title="Filter options"
          >
            <Filter size={14} color={selectedCategory !== 'all' ? 'var(--accent-primary)' : 'var(--text-muted)'} />
          </button>
        </div>

        {/* Filter Popover */}
        {showSearchFilter && (
          <div className="glass-panel animate-slide-up" style={{
            position: 'absolute',
            top: '48px',
            left: 0,
            right: 0,
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            boxShadow: 'var(--card-shadow)',
            zIndex: 60
          }}>
            <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              FILTER BY TYPE
            </p>
            <div style={{ display: 'flex', wrap: 'wrap', gap: '8px' }}>
              {['all', 'audio', 'video', 'image', 'document', 'archive', 'code'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setShowSearchFilter(false);
                  }}
                  className={`btn ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '4px 10px', fontSize: '12px', textTransform: 'capitalize' }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Header Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Language Switcher Toggle */}
        <button
          onClick={toggleLanguage}
          className="btn btn-secondary"
          style={{
            fontSize: '12px',
            fontWeight: '700',
            padding: '6px 12px',
            borderColor: 'var(--accent-indigo)',
            color: 'var(--accent-cyan)'
          }}
          title="Badilisha Lugha / Switch Language"
        >
          <Languages size={15} /> {lang === 'sw' ? 'SW 🇹🇿' : 'EN 🇬🇧'}
        </button>

        {/* Storage Upgrade CTA */}
        <button
          onClick={onOpenPricing}
          className="btn btn-secondary"
          style={{
            borderColor: 'var(--accent-primary-hover)',
            color: 'var(--accent-primary)',
            background: 'var(--accent-primary-light)'
          }}
        >
          <Sparkles size={16} /> Upgrade Storage
        </button>

        {/* View Mode Switcher */}
        <div style={{
          display: 'flex',
          background: 'var(--bg-tertiary)',
          borderRadius: 'var(--radius-md)',
          padding: '2px',
          border: '1px solid var(--border-color)'
        }}>
          <button
            onClick={() => setViewMode('grid')}
            className={`btn btn-icon ${viewMode === 'grid' ? 'btn-secondary' : 'btn-ghost'}`}
            style={{ width: '32px', height: '32px' }}
            title="Grid View"
          >
            <Grid size={16} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`btn btn-icon ${viewMode === 'list' ? 'btn-secondary' : 'btn-ghost'}`}
            style={{ width: '32px', height: '32px' }}
            title="List View"
          >
            <List size={16} />
          </button>
        </div>

        {/* Dark Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="btn btn-ghost btn-icon"
          style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-md)' }}
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? <Sun size={20} color="#fbbf24" /> : <Moon size={20} color="#6366f1" />}
        </button>

        {/* User Profile */}
        <div style={{ position: 'relative' }}>
          <div
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px',
              paddingRight: '8px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              cursor: 'pointer'
            }}
          >
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
              alt="Avatar"
              style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
            />
            <ChevronDown size={14} color="var(--text-muted)" />
          </div>

          {showProfileMenu && (
            <div className="glass-panel animate-slide-up" style={{
              position: 'absolute',
              top: '48px',
              right: 0,
              width: '240px',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--modal-shadow)',
              padding: '8px',
              zIndex: 70
            }}>
              <div style={{ padding: '12px', borderBottom: '1px solid var(--border-color)' }}>
                <p style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text-primary)' }}>
                  Administrator
                </p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  admin@nurhost.app
                </p>
                <span className="badge badge-emerald" style={{ marginTop: '6px' }}>
                  15 GB Free Storage
                </span>
              </div>

              <div style={{ padding: '4px 0' }}>
                <button 
                  onClick={() => { onOpenPricing(); setShowProfileMenu(false); }}
                  className="btn btn-ghost" 
                  style={{ width: '100%', justifyContent: 'flex-start', fontSize: '13px' }}
                >
                  <Sparkles size={16} /> Upgrade Plan
                </button>
                <button 
                  onClick={() => setShowProfileMenu(false)}
                  className="btn btn-ghost" 
                  style={{ width: '100%', justifyContent: 'flex-start', fontSize: '13px' }}
                >
                  <Settings size={16} /> Settings & API
                </button>
                <button 
                  onClick={() => setShowProfileMenu(false)}
                  className="btn btn-ghost" 
                  style={{ width: '100%', justifyContent: 'flex-start', fontSize: '13px' }}
                >
                  <ShieldCheck size={16} /> Admin Dashboard
                </button>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '4px' }}>
                <button 
                  onClick={() => setShowProfileMenu(false)}
                  className="btn btn-ghost" 
                  style={{ width: '100%', justifyContent: 'flex-start', fontSize: '13px', color: 'var(--accent-pink)' }}
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
