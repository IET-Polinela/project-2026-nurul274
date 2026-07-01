#!/bin/bash
# ============================================================
# SmartCity Deployment Script
# Jalankan di VPS sebagai root
# ============================================================
set -e

PROJECT_DIR="/root/project-2026-nurul274/server_smartcity"
BACKEND_DIR="$PROJECT_DIR"
DEPLOY_DIR="$PROJECT_DIR/deploy"

echo "========================================"
echo "🚀 SmartCity Backend Deployment Script"
echo "========================================"

# ========== 1. Update System ==========
echo ""
echo "📦 [1/8] Update system packages..."
apt update && apt upgrade -y

# ========== 2. Install Dependencies ==========
echo ""
echo "📦 [2/8] Install Python, Nginx, PostgreSQL..."
apt install -y python3 python3-pip python3-venv nginx postgresql postgresql-client

# ========== 3. Setup Virtual Environment ==========
echo ""
echo "🐍 [3/8] Setup Python virtual environment..."
cd "$BACKEND_DIR"
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
deactivate

# ========== 4. Setup Log Directory ==========
echo ""
echo "📝 [4/8] Setup log directory..."
mkdir -p /var/log/gunicorn

# ========== 5. Collect Static Files ==========
echo ""
echo "🎨 [5/8] Collect static files..."
source venv/bin/activate
python manage.py collectstatic --noinput
python manage.py migrate
deactivate

# ========== 6. Setup Gunicorn Service ==========
echo ""
echo "⚙️  [6/8] Setup Gunicorn systemd service..."
cp "$DEPLOY_DIR/gunicorn-mhs08.service" /etc/systemd/system/gunicorn-mhs08.service
systemctl daemon-reload
systemctl enable gunicorn-mhs08
systemctl start gunicorn-mhs08
systemctl status gunicorn-mhs08 --no-pager

# ========== 7. Setup Nginx ==========
echo ""
echo "🔧 [7/8] Setup Nginx configuration..."
cp "$DEPLOY_DIR/smartcity_nginx.conf" /etc/nginx/sites-available/smartcity
ln -sf /etc/nginx/sites-available/smartcity /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

# ========== 8. Final Status ==========
echo ""
echo "========================================"
echo "✅ Deployment Complete!"
echo "========================================"
echo ""
echo "📊 Service Status:"
echo "  - Gunicorn:  $(systemctl is-active gunicorn-mhs08)"
echo "  - Nginx:     $(systemctl is-active nginx)"
echo "  - PostgreSQL: $(systemctl is-active postgresql)"
echo ""
echo "🌐 Backend API: http://103.151.63.86:8008"
echo "📋 Admin Panel: http://103.151.63.86:8008/admin/"
echo ""
echo "📝 Log files:"
echo "  - Gunicorn: journalctl -u gunicorn-mhs08 -f"
echo "  - Nginx:    tail -f /var/log/nginx/error.log"
echo ""
echo "🔧 Useful commands:"
echo "  - Restart Gunicorn:  systemctl restart gunicorn-mhs08"
echo "  - Restart Nginx:     systemctl restart nginx"
echo "  - View Gunicorn log: journalctl -u gunicorn-mhs08 -f"
