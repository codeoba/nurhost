# 🌐 NurHost — Cloud Storage, File Hosting & Media Vault

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white" />
  <img src="https://img.shields.io/badge/Storage-S3%20Compatible-orange?logo=amazon-s3" />
  <img src="https://img.shields.io/badge/License-MIT-green" />
</p>

NurHost ni platform ya kisasa ya kuhifadhi faili kwenye wingu (cloud storage) — yenye uwezo wa ku-stream audio/video moja kwa moja, kushiriki faili kwa links za umma, kupakua faili kutoka URL na Torrent/Magnet, na mengi zaidi.

---

## ✨ Features Kuu

| Feature | Maelezo |
|---|---|
| 📤 Multi-Upload | Pakia faili nyingi kwa wakati mmoja |
| 🌐 Remote URL Download | Pakua faili moja kwa moja kutoka URL |
| 🧲 Torrent/Magnet | Download kupitia magnet links |
| 🎵 Audio Streaming | Mchezaji wa audio ndani ya browser |
| 🎬 Video Streaming | Mchezaji wa video ndani ya browser |
| 🖼️ Image Viewer | Tazama picha bila kupakua |
| 📝 Monaco Code Editor | Hariri code moja kwa moja ndani ya app |
| 🗜️ Zip/Unzip | Fungua na tenganisha faili za ZIP |
| 🔗 Share Links | Shiriki faili kwa links za umma na password |
| 📁 Folders | Panga faili kwenye folders |
| ✏️ Rename | Badilisha majina ya faili na folders |
| 📂 Move to Folder | Sogeza faili kati ya folders |
| 🗑️ Trash & Restore | Futa na urudishe faili |
| ⏳ File Versioning | Angalia na urudishe versions za zamani |
| 📊 Storage Analytics | Grafu ya matumizi ya storage |
| ☁️ S3 Compatible | AWS S3, Contabo, Wasabi, MinIO |
| 🌙 Dark/Light Mode | Mada mbili za rangi |
| 📱 Responsive | Inafanya kazi kwenye simu na kompyuta |

---

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite 5 + Custom CSS (Glassmorphism Design)
- **Backend**: Node.js + Express
- **Database**: SQLite via Prisma 7
- **Storage**: Local disk (default) au S3-compatible (AWS, Contabo, Wasabi, MinIO)
- **Torrent**: WebTorrent
- **Code Editor**: Monaco Editor
- **Icons**: Lucide React

---

## 🚀 Kuanzisha Locally (Development)

### Mahitaji
- Node.js v18+ (recommended: v20 LTS)
- npm v9+
- Git

### Hatua za Kuanzisha

```bash
# 1. Clone repository
git clone https://github.com/codeoba/nurhost.git
cd nurhost

# 2. Install frontend dependencies
npm install

# 3. Install backend dependencies
cd server
npm install

# 4. Sanidi environment variables
cp .env.example .env
# Hariri .env kulingana na mazingira yako

# 5. Tengeneza database
npx prisma generate
npx prisma db push

# 6. Rudi kwenye root na anzisha dev servers
cd ..

# Terminal 1 — Backend (port 5000)
node server/index.js

# Terminal 2 — Frontend (port 5173)
npm run dev
```

Fungua browser: **http://localhost:5173**

---

## 🌍 Deployment kwenye aaPanel (VPS/Dedicated Server)

### Mahitaji ya Server
- Ubuntu 20.04 / 22.04 LTS
- aaPanel imewekwa
- Node.js v20+ imewekwa kupitia aaPanel
- Domain name (optional lakini inapendekezwa)

### Hatua 1 — Sakinisha Node.js kwenye aaPanel

1. Ingia aaPanel Dashboard → **App Store**
2. Tafuta **Node.js** → Install
3. Chagua toleo **v20 LTS**

### Hatua 2 — Pakia Code kutoka GitHub

```bash
# SSH kwenye server yako
ssh root@your-server-ip

# Nenda kwenye /www/wwwroot (aaPanel default)
cd /www/wwwroot

# Clone project
git clone https://github.com/codeoba/nurhost.git
cd nurhost
```

### Hatua 3 — Sakinisha Dependencies

```bash
# Frontend dependencies
npm install

# Backend dependencies
cd server
npm install

# Sanidi .env
cp .env.example .env
nano .env   # au vim .env
```

Hariri `.env`:
```env
PORT=5000
NODE_ENV=production
STORAGE_PROVIDER=local
DATABASE_URL="file:./prisma/dev.db"
FRONTEND_URL=https://yourdomain.com
```

### Hatua 4 — Tengeneza Database na Build Frontend

```bash
# Tengeneza Prisma database
cd /www/wwwroot/nurhost/server
npx prisma generate
npx prisma db push

# Rudi root na build frontend
cd /www/wwwroot/nurhost
npm run build
```

Frontend iliyoundwa itakuwa kwenye folder `dist/`

### Hatua 5 — Anzisha Backend na PM2

```bash
# Sakinisha PM2 (process manager)
npm install -g pm2

# Anzisha backend server
cd /www/wwwroot/nurhost
pm2 start server/index.js --name nurhost-backend

# Weka ianze automatically baada ya reboot
pm2 startup
pm2 save
```

### Hatua 6 — Sanidi Website kwenye aaPanel

1. aaPanel Dashboard → **Website** → **Add Site**
2. Weka domain: `yourdomain.com`
3. PHP Version: **Disable PHP** (tunatumia Node.js)
4. Bonyeza **Submit**

### Hatua 7 — Sanidi Nginx Reverse Proxy

aaPanel → Website → **yourdomain.com** → **Config**

Weka hii kwenye Nginx config:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    root /www/wwwroot/nurhost/dist;
    index index.html;

    # Serve React frontend (SPA routing)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to Node.js backend
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        client_max_body_size 500M;
    }

    # Serve uploaded files directly
    location /uploads/ {
        alias /www/wwwroot/nurhost/server/uploads/;
    }
}
```

### Hatua 8 — Weka SSL Certificate (HTTPS)

aaPanel → Website → **yourdomain.com** → **SSL** → **Let's Encrypt** → Apply

---

## 📁 Muundo wa Mradi

```
nurhost/
├── src/                    # React Frontend
│   ├── components/         # Vipande vyote vya UI
│   ├── App.jsx             # Programu kuu
│   ├── api.js              # Maombi ya API
│   ├── mockData.js         # Data za majaribio
│   └── index.css           # Mfumo wa CSS
├── server/                 # Node.js Backend
│   ├── routes/             # API endpoints
│   ├── utils/              # Zana (S3, sanitize)
│   ├── prisma/             # Database schema
│   ├── index.js            # Server kuu
│   └── .env.example        # Template ya mazingira
├── public/                 # Faili za umma
├── index.html              # HTML kuu
└── vite.config.js          # Mipangilio ya Vite
```

---

## ⚙️ Kusanidi S3 Storage (Contabo/AWS/Wasabi)

Badilisha `.env` kwa:

```env
STORAGE_PROVIDER=s3

# AWS S3
S3_ACCESS_KEY=AKIAIOSFODNN7EXAMPLE
S3_SECRET_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
S3_BUCKET=my-nurhost-bucket
S3_REGION=us-east-1

# Contabo Object Storage
# S3_ENDPOINT=https://eu2.contabostorage.com
# S3_REGION=eu2
```

---

## 🔄 Kusasisha Code (Update)

```bash
cd /www/wwwroot/nurhost
git pull origin main
npm install
npm run build
cd server && npm install && cd ..
pm2 restart nurhost-backend
```

---

## 📄 License

MIT © 2026 NurHost. Made with ❤️ for the web.
