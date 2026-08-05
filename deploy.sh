#!/bin/bash
# ============================================================
# NurHost - aaPanel Deployment Script
# Domain: nurhost.mdandu.com
# Database: sql_nurhost_mdandu_com
# ============================================================
# Endesha: bash deploy.sh
# ============================================================

set -e  # Stop on any error

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "  _   _           _   _           _   "
echo " | \ | |         | | | |         | |  "
echo " |  \| |_   _ _ __| |_| | ___  __| |_ "
echo " | . \` | | | | '__| __| |/ _ \/ __| __|"
echo " | |\  | |_| | |  | |_| | (_) \__ \ |_ "
echo " |_| \_|\__,_|_|   \__|_|\___/|___/\__|"
echo ""
echo -e "${NC}"
echo -e "${GREEN}🚀 NurHost Deployment - nurhost.mdandu.com${NC}"
echo "============================================"

# --- Variables ---
DOMAIN="nurhost.mdandu.com"
DB_NAME="sql_nurhost_mdandu_com"
APP_DIR="/www/wwwroot/nurhost"
NODE_PORT=5000

# --- Step 1: Check Node.js ---
echo -e "\n${YELLOW}[1/8] Checking Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js haipo! Sakinisha Node.js v20 kutoka aaPanel App Store kwanza.${NC}"
    exit 1
fi
NODE_VERSION=$(node --version)
echo -e "${GREEN}✅ Node.js $NODE_VERSION inapatikana${NC}"

# --- Step 2: Clone or Update ---
echo -e "\n${YELLOW}[2/8] Kupakua/Kusasisha code...${NC}"
if [ -d "$APP_DIR/.git" ]; then
    echo "Repo ipo tayari - inasasishwa..."
    cd $APP_DIR
    git pull origin master
else
    echo "Inachukua code mpya kutoka GitHub..."
    git clone https://github.com/codeoba/nurhost.git $APP_DIR
    cd $APP_DIR
fi
echo -e "${GREEN}✅ Code iko tayari${NC}"

# --- Step 3: Install Dependencies ---
echo -e "\n${YELLOW}[3/8] Sakinisha dependencies za frontend...${NC}"
cd $APP_DIR
npm install --production=false
echo -e "${GREEN}✅ Frontend dependencies zimewekwa${NC}"

echo -e "\n${YELLOW}[3b/8] Sakinisha dependencies za backend...${NC}"
cd $APP_DIR/server
npm install
echo -e "${GREEN}✅ Backend dependencies zimewekwa${NC}"

# --- Step 4: Setup .env ---
echo -e "\n${YELLOW}[4/8] Sanidi mazingira (.env)...${NC}"
cd $APP_DIR/server

if [ ! -f ".env" ]; then
    cp .env.example .env
    echo -e "${RED}⚠️  Tafadhali hariri .env na password yako ya database:${NC}"
    echo -e "${YELLOW}   nano /www/wwwroot/nurhost/server/.env${NC}"
    echo ""
    echo "   DATABASE_URL=\"mysql://sql_nurhost_mdandu_com:WEKA_PASSWORD_HAPA@127.0.0.1:3306/sql_nurhost_mdandu_com\""
    echo ""
    read -p "Je, umeweka password? Bonyeza Enter kuendelea..." confirm
else
    echo -e "${GREEN}✅ .env ipo tayari${NC}"
fi

# --- Step 5: Database Migration ---
echo -e "\n${YELLOW}[5/8] Sanidi database MySQL...${NC}"
cd $APP_DIR/server
npx prisma generate
npx prisma db push
echo -e "${GREEN}✅ Database tables zimeundwa${NC}"

# --- Step 6: Build Frontend ---
echo -e "\n${YELLOW}[6/8] Jenga frontend (React build)...${NC}"
cd $APP_DIR
npm run build
echo -e "${GREEN}✅ Frontend imejengwa - dist/ ipo tayari${NC}"

# --- Step 7: PM2 Setup ---
echo -e "\n${YELLOW}[7/8] Weka PM2 process manager...${NC}"
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
    echo -e "${GREEN}✅ PM2 imewekwa${NC}"
fi

cd $APP_DIR
# Stop existing if running
pm2 stop nurhost-backend 2>/dev/null || true
pm2 delete nurhost-backend 2>/dev/null || true

# Start with PM2
pm2 start server/index.js \
    --name nurhost-backend \
    --cwd $APP_DIR \
    --log /www/wwwlogs/nurhost-backend.log \
    --time

pm2 startup
pm2 save
echo -e "${GREEN}✅ Backend inaendesha (port $NODE_PORT)${NC}"

# --- Step 8: Nginx Config ---
echo -e "\n${YELLOW}[8/8] Nakili Nginx configuration...${NC}"
NGINX_CONF="/www/server/nginx/conf/vhost/${DOMAIN}.conf"

cat > /tmp/nurhost_nginx.conf << 'NGINX_EOF'
server {
    listen 80;
    server_name nurhost.mdandu.com www.nurhost.mdandu.com;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # React SPA frontend
    root /www/wwwroot/nurhost/dist;
    index index.html;

    # Increase upload size limit
    client_max_body_size 500M;

    # React Router - SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
        expires -1;
    }

    # Static assets caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        root /www/wwwroot/nurhost/dist;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Proxy API to Node.js backend
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        client_max_body_size 500M;
    }

    # Serve uploaded files directly (bypass Node.js)
    location /uploads/ {
        alias /www/wwwroot/nurhost/server/uploads/;
        add_header Content-Disposition "inline";
        expires 7d;
    }

    # Logs
    access_log /www/wwwlogs/nurhost.mdandu.com.log;
    error_log /www/wwwlogs/nurhost.mdandu.com.error.log;
}
NGINX_EOF

echo ""
echo -e "${YELLOW}📋 Nginx config ipo hapa: /tmp/nurhost_nginx.conf${NC}"
echo -e "${YELLOW}   Nakili kwenye aaPanel kufuata hatua hizi:${NC}"
echo ""
echo "   1. aaPanel → Website → nurhost.mdandu.com → Config"
echo "   2. Badilisha config na yaliyomo ya: /tmp/nurhost_nginx.conf"
echo "   3. Au sakinisha kwa amri hii:"
echo -e "   ${GREEN}cp /tmp/nurhost_nginx.conf $NGINX_CONF && /www/server/nginx/sbin/nginx -t && service nginx reload${NC}"
echo ""

# --- Done! ---
echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}🎉 NurHost imewekwa kikamilifu!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo -e "  🌐 Website: ${BLUE}http://nurhost.mdandu.com${NC}"
echo -e "  ⚙️  Backend API: ${BLUE}http://127.0.0.1:5000/api/health${NC}"
echo -e "  📊 PM2 Status: ${YELLOW}pm2 status${NC}"
echo -e "  📜 Logs: ${YELLOW}pm2 logs nurhost-backend${NC}"
echo ""
echo -e "${YELLOW}Hatua inayofuata:${NC}"
echo "  → Nenda aaPanel → Website → nurhost.mdandu.com → SSL → Let's Encrypt"
echo "  → Weka HTTPS certificate bure!"
echo ""
