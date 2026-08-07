export const INITIAL_FOLDERS = [
  { id: 'f1', name: 'Audio Studio & Tracks', color: '#6366f1', itemsCount: 4, updatedAt: '2026-08-05T14:30:00Z', isStarred: true, parentId: null },
  { id: 'f2', name: 'Project Presentations', color: '#ec4899', itemsCount: 2, updatedAt: '2026-08-04T10:15:00Z', isStarred: false, parentId: null },
  { id: 'f3', name: 'System Backups & Configs', color: '#10b981', itemsCount: 3, updatedAt: '2026-08-03T18:45:00Z', isStarred: false, parentId: null },
  { id: 'f4', name: 'Client Assets 2026', color: '#f59e0b', itemsCount: 5, updatedAt: '2026-08-01T09:20:00Z', isStarred: true, parentId: null }
];

export const INITIAL_FILES = [];

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
