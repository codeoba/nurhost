export const INITIAL_FOLDERS = [
  { id: 'f1', name: 'Audio Studio & Tracks', color: '#6366f1', itemsCount: 4, updatedAt: '2026-08-05T14:30:00Z', isStarred: true, parentId: null },
  { id: 'f2', name: 'Project Presentations', color: '#ec4899', itemsCount: 2, updatedAt: '2026-08-04T10:15:00Z', isStarred: false, parentId: null },
  { id: 'f3', name: 'System Backups & Configs', color: '#10b981', itemsCount: 3, updatedAt: '2026-08-03T18:45:00Z', isStarred: false, parentId: null },
  { id: 'f4', name: 'Client Assets 2026', color: '#f59e0b', itemsCount: 5, updatedAt: '2026-08-01T09:20:00Z', isStarred: true, parentId: null }
];

export const INITIAL_FILES = [
  {
    id: 'file-audio-1',
    name: 'demo-audio.mp3',
    type: 'audio',
    mimeType: 'audio/mpeg',
    size: 4852910, // ~4.6 MB
    sizeFormatted: '4.6 MB',
    url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3',
    shareCode: 'U4WQceXTvogbqFC7iJmyq9UsK80E9q',
    shareUrl: 'https://nurhost.app/drive/s/U4WQceXTvogbqFC7iJmyq9UsK80E9q',
    directUrl: 'https://nurhost.app/direct/demo-audio.mp3',
    folderId: 'f1',
    isStarred: true,
    isShared: true,
    inTrash: false,
    updatedAt: '2026-08-05T18:25:03Z',
    createdAt: '2026-08-05T18:25:03Z',
    duration: '02:45',
    bitrate: '320 kbps',
    artist: 'NurHost Beats',
    album: 'Studio Demos',
    owner: { name: 'Administrator', email: 'admin@nurhost.app', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80' },
    downloadsCount: 142,
    viewsCount: 528,
    passwordProtected: false,
    expiresAt: null
  },
  {
    id: 'file-audio-2',
    name: 'ambient_chillout_wave.mp3',
    type: 'audio',
    mimeType: 'audio/mpeg',
    size: 6120400,
    sizeFormatted: '5.8 MB',
    url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=ambient-piano-10781.mp3',
    shareCode: 'A89XkL29Zp',
    shareUrl: 'https://nurhost.app/drive/s/A89XkL29Zp',
    directUrl: 'https://nurhost.app/direct/ambient_chillout_wave.mp3',
    folderId: 'f1',
    isStarred: false,
    isShared: true,
    inTrash: false,
    updatedAt: '2026-08-04T12:00:00Z',
    createdAt: '2026-08-04T12:00:00Z',
    duration: '03:12',
    bitrate: '320 kbps',
    artist: 'NurHost Ambient',
    album: 'Relaxation Session',
    owner: { name: 'Administrator', email: 'admin@nurhost.app', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80' },
    downloadsCount: 89,
    viewsCount: 310,
    passwordProtected: false
  },
  {
    id: 'file-video-1',
    name: 'nurhost_platform_walkthrough.mp4',
    type: 'video',
    mimeType: 'video/mp4',
    size: 24500000,
    sizeFormatted: '23.4 MB',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    poster: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    shareCode: 'V82Kd91Ms',
    shareUrl: 'https://nurhost.app/drive/s/V82Kd91Ms',
    directUrl: 'https://nurhost.app/direct/nurhost_platform_walkthrough.mp4',
    folderId: 'f2',
    isStarred: true,
    isShared: true,
    inTrash: false,
    updatedAt: '2026-08-04T16:20:00Z',
    createdAt: '2026-08-04T16:20:00Z',
    duration: '00:15',
    resolution: '4K Ultra HD',
    owner: { name: 'NurHost Media Team', email: 'media@nurhost.app', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80' },
    downloadsCount: 320,
    viewsCount: 1450
  },
  {
    id: 'file-image-1',
    name: 'nurhost_dashboard_ui_mockup.png',
    type: 'image',
    mimeType: 'image/png',
    size: 3450000,
    sizeFormatted: '3.3 MB',
    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80',
    shareCode: 'Img99X2k',
    shareUrl: 'https://nurhost.app/drive/s/Img99X2k',
    directUrl: 'https://nurhost.app/direct/nurhost_dashboard_ui_mockup.png',
    folderId: 'f2',
    isStarred: false,
    isShared: false,
    inTrash: false,
    updatedAt: '2026-08-03T11:10:00Z',
    createdAt: '2026-08-03T11:10:00Z',
    dimensions: '3840 x 2160 px',
    owner: { name: 'Administrator', email: 'admin@nurhost.app', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80' },
    downloadsCount: 45,
    viewsCount: 190
  },
  {
    id: 'file-doc-1',
    name: 'nurhost_architecture_spec.pdf',
    type: 'document',
    mimeType: 'application/pdf',
    size: 1850000,
    sizeFormatted: '1.8 MB',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    shareCode: 'Pdf777Xy',
    shareUrl: 'https://nurhost.app/drive/s/Pdf777Xy',
    directUrl: 'https://nurhost.app/direct/nurhost_architecture_spec.pdf',
    folderId: null,
    isStarred: true,
    isShared: true,
    inTrash: false,
    updatedAt: '2026-08-05T09:00:00Z',
    createdAt: '2026-08-05T09:00:00Z',
    pages: 14,
    owner: { name: 'Administrator', email: 'admin@nurhost.app', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80' },
    downloadsCount: 61,
    viewsCount: 230
  },
  {
    id: 'file-archive-1',
    name: 'production_database_backup_2026.zip',
    type: 'archive',
    mimeType: 'application/zip',
    size: 145000000,
    sizeFormatted: '138.2 MB',
    url: '#',
    shareCode: 'Zip88392K',
    shareUrl: 'https://nurhost.app/drive/s/Zip88392K',
    directUrl: 'https://nurhost.app/direct/production_database_backup_2026.zip',
    folderId: 'f3',
    isStarred: false,
    isShared: false,
    inTrash: false,
    updatedAt: '2026-08-02T04:00:00Z',
    createdAt: '2026-08-02T04:00:00Z',
    compression: 'ZIP 64-bit High Compression',
    owner: { name: 'DevOps Lead', email: 'devops@nurhost.app', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80' },
    downloadsCount: 12,
    viewsCount: 34
  },
  {
    id: 'file-code-1',
    name: 'nurhost_server_config.json',
    type: 'code',
    mimeType: 'application/json',
    size: 14200,
    sizeFormatted: '14.2 KB',
    content: `{
  "app_name": "NurHost Cloud Drive",
  "version": "3.4.0",
  "environment": "production",
  "storage": {
    "provider": "S3-Compatible High Velocity",
    "region": "us-east-1",
    "bucket": "nurhost-vault-primary",
    "encryption": "AES-256-GCM",
    "chunk_size_mb": 10
  },
  "security": {
    "max_file_size_bytes": 10737418240,
    "share_links": {
      "default_expiry_days": 30,
      "allow_password": true,
      "allow_direct_download": true
    }
  }
}`,
    shareCode: 'Json1120X',
    shareUrl: 'https://nurhost.app/drive/s/Json1120X',
    directUrl: 'https://nurhost.app/direct/nurhost_server_config.json',
    folderId: 'f3',
    isStarred: false,
    isShared: false,
    inTrash: false,
    updatedAt: '2026-08-05T15:10:00Z',
    createdAt: '2026-08-05T15:10:00Z',
    owner: { name: 'Administrator', email: 'admin@nurhost.app', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80' },
    downloadsCount: 9,
    viewsCount: 42
  },
  {
    id: 'file-trash-1',
    name: 'old_draft_contract_v1.docx',
    type: 'document',
    mimeType: 'application/msword',
    size: 450000,
    sizeFormatted: '450 KB',
    url: '#',
    shareCode: 'Trash001',
    shareUrl: 'https://nurhost.app/drive/s/Trash001',
    folderId: null,
    isStarred: false,
    isShared: false,
    inTrash: true,
    updatedAt: '2026-07-28T09:00:00Z',
    createdAt: '2026-07-20T09:00:00Z',
    owner: { name: 'Administrator', email: 'admin@nurhost.app', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80' }
  }
];

export const STORAGE_STATS = {
  usedBytes: 185672310, // ~185.6 MB
  totalBytes: 16106127360, // 15 GB
  breakdown: [
    { label: 'Audio', type: 'audio', color: '#3b82f6', sizeFormatted: '10.4 MB', bytes: 10973310, percent: 5.9 },
    { label: 'Video', type: 'video', color: '#8b5cf6', sizeFormatted: '23.4 MB', bytes: 24500000, percent: 13.2 },
    { label: 'Images', type: 'image', color: '#ec4899', sizeFormatted: '3.3 MB', bytes: 3450000, percent: 1.8 },
    { label: 'Documents', type: 'document', color: '#10b981', sizeFormatted: '2.25 MB', bytes: 2300000, percent: 1.2 },
    { label: 'Archives', type: 'archive', color: '#f59e0b', sizeFormatted: '138.2 MB', bytes: 145000000, percent: 78.1 }
  ]
};

export const PRICING_PLANS = [
  {
    id: 'free',
    name: 'NurHost Starter',
    price: '$0',
    period: 'forever',
    storage: '15 GB High Speed Storage',
    popular: false,
    features: [
      '15 GB Secure Cloud Vault',
      'Shareable Public & Direct Links',
      'Audio & Video Web Previewer',
      'Password Protected Sharing',
      'Standard Download Speeds'
    ]
  },
  {
    id: 'pro',
    name: 'NurHost Pro',
    price: '$4.99',
    period: 'per month',
    storage: '100 GB High Speed Storage',
    popular: true,
    features: [
      '100 GB Encrypted Storage',
      'Unlimited Direct Streaming Links',
      'Custom Expiration Dates on Links',
      'High-Speed CDN Multi-Thread Uploads',
      'Custom Branding on Share Pages',
      'Priority 24/7 Support'
    ]
  },
  {
    id: 'business',
    name: 'NurHost Business',
    price: '$14.99',
    period: 'per month',
    storage: '2 TB High Speed Storage',
    popular: false,
    features: [
      '2,000 GB Enterprise Storage',
      'Team Workspaces & Roles',
      'Unlimited API Access & Webhooks',
      'Audit Logs & Security Control',
      'Custom Domain Support (files.yourcompany.com)',
      'Dedicated Cloud Node'
    ]
  }
];
