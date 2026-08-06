#!/bin/bash
# ============================================================
# NurHost - aaPanel Deployment Script
# Domain  : nurhost.mdandu.com
# Database: sql_nurhost_mdandu_com
# ============================================================
# Endesha: bash deploy.sh
# ============================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
echo "  _   _           _   _           _   "
echo " | \ | |         | | | |         | |  "
echo " |  \| |_   _ _ __| |_| | ___  __| |_ "
echo " | . \` | | | | '__| __| |/ _ \/ __| __|"
echo " | |\  | |_| | |  | |_| | (_) \__ \ |_ "
echo " |_| \_|\__,_|_|   \__|_|\___/|___/\__|"
echo ""
echo -e "${NC}"
echo -e "${GREEN}🚀 NurHost Deployment — nurhost.mdandu.com${NC}"
echo "============================================"

APP_DIR="/www/wwwroot/nurhost"
NODE_PORT=5050

# --- Step 1: Check Node.js ---
echo -e "\n${YELLOW}[1/7] Checking Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js haipo! Sakinisha Node.js v20 kutoka aaPanel → App Store kwanza.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js $(node --version) inapatikana${NC}"

# --- Step 2: Clone or Update ---
echo -e "\n${YELLOW}[2/7] Kupakua code kutoka GitHub...${NC}"
if [ -d "$APP_DIR/.git" ]; then
    echo "Repo ipo — inasasishwa..."
    cd $APP_DIR
    git pull origin master
else
    echo "Inachukua code mpya..."
    git clone https://github.com/codeoba/nurhost.git $APP_DIR
    cd $APP_DIR
fi
echo -e "${GREEN}✅ Code ipo tayari${NC}"

# --- Step 3: Create uploads directory ---
echo -e "\n${YELLOW}[3/7] Kuunda directories na kuweka permissions...${NC}"
mkdir -p $APP_DIR/server/uploads
chmod -R 777 $APP_DIR/server/uploads
echo -e "${GREEN}✅ Directories zimeundwa na kupewa ruhusa${NC}"

# --- Step 4: Write .env automatically ---
echo -e "\n${YELLOW}[4/7] Kuandika .env file...${NC}"
cat > $APP_DIR/server/.env << 'ENV_EOF'
PORT=5050
NODE_ENV=production
STORAGE_PROVIDER=local
DATABASE_URL="mysql://sql_nurhost_mdandu_com:b31b1b7540a87@127.0.0.1:3306/sql_nurhost_mdandu_com"
FRONTEND_URL=https://nurhost.mdandu.com
ENV_EOF
echo -e "${GREEN}✅ .env imeandikwa${NC}"

# --- Step 5: Install dependencies ---
echo -e "\n${YELLOW}[5/7] Sakinisha dependencies...${NC}"
cd $APP_DIR
npm install --production=false
cd $APP_DIR/server
npm install
echo -e "${GREEN}✅ Dependencies zimewekwa${NC}"

# --- Step 6: Database + Build ---
echo -e "\n${YELLOW}[6/7] Sanidi database na jenga frontend...${NC}"
cd $APP_DIR/server
npx prisma generate
npx prisma db push --accept-data-loss
echo -e "${GREEN}✅ Database tables zimeundwa${NC}"

cd $APP_DIR
# aaPanel inaweka .user.ini kwenye dist/ inayolinda faili - iondoe kwanza
echo -e "${YELLOW}   Kuondoa aaPanel .user.ini lock...${NC}"
chattr -i $APP_DIR/dist/.user.ini 2>/dev/null || true
rm -f $APP_DIR/dist/.user.ini 2>/dev/null || true

npm run build
echo -e "${GREEN}✅ Frontend imejengwa (dist/)${NC}"


# --- Step 7: PM2 ---
echo -e "\n${YELLOW}[7/7] Anzisha backend na PM2...${NC}"
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi

pm2 stop nurhost-backend 2>/dev/null || true
pm2 delete nurhost-backend 2>/dev/null || true

pm2 start server/index.js \
    --name nurhost-backend \
    --cwd $APP_DIR \
    --log /www/wwwlogs/nurhost-backend.log \
    --time

pm2 startup
pm2 save

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  🎉 NurHost imewekwa kikamilifu!         ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════╝${NC}"
echo ""
echo -e "  🌐 Website  : ${BLUE}http://nurhost.mdandu.com${NC}"
echo -e "  ⚙️  API Health: ${BLUE}http://127.0.0.1:5050/api/health${NC}"
echo -e "  📊 PM2 logs : ${YELLOW}pm2 logs nurhost-backend${NC}"
echo ""
echo -e "${YELLOW}━━ Hatua Inayofuata ━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "  1. Sanidi Nginx (tazama maelekezo hapa chini)"
echo "  2. aaPanel → Website → nurhost.mdandu.com → SSL → Let's Encrypt"
echo ""
echo -e "${YELLOW}━━ Nginx Config (Nakili kwenye aaPanel) ━━━━━${NC}"
cat << 'NGINX_EOF'

server {
    listen 80;
    server_name nurhost.mdandu.com www.nurhost.mdandu.com;
    root /www/wwwroot/nurhost/dist;
    index index.html;
    client_max_body_size 500M;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:5050;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        client_max_body_size 500M;
    }

    location /uploads/ {
        alias /www/wwwroot/nurhost/server/uploads/;
    }

    access_log  /www/wwwlogs/nurhost.mdandu.com.log;
    error_log   /www/wwwlogs/nurhost.mdandu.com.error.log;
}

NGINX_EOF

