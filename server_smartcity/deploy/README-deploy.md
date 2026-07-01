# 🚀 SmartCity Deployment Guide

Panduan lengkap deployment **Backend Django** + **Frontend SPA** untuk lab Smart City.

---

## 📋 Daftar Isi

1. [Arsitektur](#arsitektur)
2. [Persyaratan](#persyaratan)
3. [Deploy Backend (VPS)](#deploy-backend-vps)
4. [Deploy Frontend (GitHub Pages)](#deploy-frontend-github-pages)
5. [Verifikasi & Troubleshooting](#verifikasi--troubleshooting)
6. [Screenshot untuk Laporan](#screenshot-untuk-laporan)

---

## 🏗 Arsitektur

```
┌──────────────────────────────────────────────────┐
│                   GitHub Pages                    │
│  (Frontend SPA - smartcity_citizen_spa_24782058)  │
│          https://username.github.io/repo/          │
└──────────────────────┬───────────────────────────┘
                       │ HTTPS (fetch API)
                       ▼
┌──────────────────────────────────────────────────┐
│               VPS - 103.151.63.86:8008            │
│  ┌──────────────┐     ┌────────────────────────┐  │
│  │    Nginx     │────▶│  Gunicorn (port 8008)  │  │
│  │ (Reverse     │     │  Django WSGI           │  │
│  │  Proxy)      │     │  smartcity_app.wsgi    │  │
│  └──────────────┘     └───────────┬────────────┘  │
│                                   │                │
│                           ┌───────▼──────┐         │
│                           │  PostgreSQL  │         │
│                           │ db_mhs08     │         │
│                           └──────────────┘         │
└──────────────────────────────────────────────────┘
```

---

## ✅ Persyaratan

- **VPS** dengan Ubuntu 20.04+ (IP: `103.151.63.86`)
- **Domain/repo GitHub** untuk GitHub Pages
- **Python 3.10+**, **PostgreSQL**, **Nginx**
- **Node.js** (untuk frontend build, opsional)

---

## 🔧 Deploy Backend (VPS)

### Metode 1: Script Otomatis

SSH ke VPS, lalu jalankan:

```bash
# Clone repo
cd /root
git clone https://github.com/<username>/<repo>.git project-2026-nurul274

# Jalankan script deployment
cd project-2026-nurul274/server_smartcity
chmod +x deploy/setup_server.sh
./deploy/setup_server.sh
```

### Metode 2: Manual Step-by-Step

#### 1. Install Dependencies

```bash
apt update && apt upgrade -y
apt install -y python3 python3-pip python3-venv nginx postgresql postgresql-client
```

#### 2. Setup Python Virtual Environment

```bash
cd /root/project-2026-nurul274/server_smartcity
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

#### 3. Setup PostgreSQL Database

```bash
# Masuk ke PostgreSQL
sudo -u postgres psql

# Buat database (jika belum ada)
CREATE DATABASE db_mhs08;
CREATE USER postgres WITH PASSWORD 'amar123';
GRANT ALL PRIVILEGES ON DATABASE db_mhs08 TO postgres;
\q
```

#### 4. Migrate & Collect Static Files

```bash
source venv/bin/activate
python manage.py migrate
python manage.py collectstatic --noinput
deactivate
```

#### 5. Setup Gunicorn Service

```bash
# Buat folder log
mkdir -p /var/log/gunicorn

# Copy service file
cp deploy/gunicorn-mhs08.service /etc/systemd/system/gunicorn-mhs08.service

# Reload systemd & start service
systemctl daemon-reload
systemctl enable gunicorn-mhs08
systemctl start gunicorn-mhs08

# Cek status
systemctl status gunicorn-mhs08
```

**Hasil Screenshot (no. 2):** Terminal menunjukkan `Active: active (running)`

#### 6. Setup Nginx

```bash
# Copy konfigurasi Nginx
cp deploy/smartcity_nginx.conf /etc/nginx/sites-available/smartcity

# Enable site
ln -sf /etc/nginx/sites-available/smartcity /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test & restart
nginx -t && systemctl restart nginx
```

**Hasil Screenshot (no. 1):** Terminal menunjukkan konfigurasi Nginx & Gunicorn.

#### 7. Verify Backend

```bash
# Cek service
systemctl status gunicorn-mhs08
systemctl status nginx

# Test API
curl -s http://103.151.63.86:8008/api/
curl -s http://103.151.63.86:8008/admin/
```

---

## 🌐 Deploy Frontend (GitHub Pages)

### File yang sudah disiapkan:

📄 **`.github/workflows/deploy_pages.yml`** — Workflow GitHub Actions untuk auto-deploy.

### Cara deploy:

1. **Push ke GitHub:**
   ```bash
   git add .
   git commit -m "Deploy SPA to GitHub Pages"
   git push origin master
   ```

2. **Aktifkan GitHub Pages:**
   - Buka repo di GitHub → **Settings** → **Pages**
   - Source: **GitHub Actions**

3. **Cek Workflow:**
   - Buka tab **Actions** di GitHub
   - Lihat workflow "Deploy Frontend SPA to GitHub Pages"
   - Tunggu sampai ✅ Centang Hijau

   **Hasil Screenshot (no. 5):** Histori workflow dengan status centang hijau.

4. **Dapatkan URL GitHub Pages:**
   - Setelah deploy selesai, GitHub akan memberikan URL
   - Format: `https://<username>.github.io/<repository>/`

### Update API Base URL di Frontend

File `smartcity_citizen_spa_24782058/js/api.js` sudah menggunakan:

```javascript
const BASE_URL = 'http://103.151.63.86:8008';
```

Jika URL berubah, update di file ini.

---

## ✅ Verifikasi & Troubleshooting

### 1. Cek Backend Langsung

```bash
curl http://103.151.63.86:8008/api/
curl http://103.151.63.86:8008/admin/
```

### 2. Cek CORS dari Browser

Buka Console F12 di browser yang mengakses SPA, pastikan:
✅ Tidak ada error CORS
✅ Response API berhasil diterima
✅ Data laporan muncul

```javascript
// Test manual di Console
fetch('http://103.151.63.86:8008/api/report/')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

### 3. Cek Log Server

```bash
# Gunicorn logs
journalctl -u gunicorn-mhs08 -f

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Gunicorn access log
tail -f /var/log/gunicorn/access.log
```

### 4. Troubleshooting Umum

| Masalah | Solusi |
|---------|--------|
| `502 Bad Gateway` | Gunicorn tidak jalan: `systemctl restart gunicorn-mhs08` |
| `CORS error` | Cek `CORS_ALLOW_ALL_ORIGINS = True` di settings.py |
| `404 Not Found` | Cek URL endpoint dan Nginx config |
| `Connection refused` | Cek firewall: `ufw allow 8008` |
| `Static files 404` | Jalankan `collectstatic` lagi |

---

## 📸 Screenshot untuk Laporan Lab

Berikut daftar screenshot yang harus diambil sebagai bukti:

### Screenshot 1: Konfigurasi Nginx & Gunicorn
```bash
# Tampilkan konfigurasi
cat /etc/nginx/sites-available/smartcity
cat /etc/systemd/system/gunicorn-mhs08.service
```

### Screenshot 2: Status Service Active (Running)
```bash
systemctl status gunicorn-mhs08
```

### Screenshot 3: settings.py
- Tampilkan bagian `DATABASES`, `ALLOWED_HOSTS`, `CORS_ALLOW_ALL_ORIGINS`
- Bisa SS dari editor VS Code atau `cat smartcity_app/settings.py`

### Screenshot 4: deploy-pages.yml
- Tampilkan artifact path: `./server_smartcity/smartcity_citizen_spa_24782058`

### Screenshot 5: GitHub Actions Success ✅
- Buka repo → Actions → Workflow berhasil (centang hijau)

### Screenshot 6: Aplikasi SPA Live
- Buka URL GitHub Pages
- Tampilkan address bar browser
- Buka Console F12 → Tidak ada error CORS
- Data dari backend berhasil dimuat

---

## 📝 Catatan Penting

1. **Security:** Ganti `DEBUG = False` setelah production
2. **Secret Key:** Ganti `SECRET_KEY` dengan nilai yang aman untuk production
3. **Password:** Ganti password database untuk production
4. **CORS:** Untuk production, spesifikkan origin GitHub Pages, jangan gunakan `CORS_ALLOW_ALL_ORIGINS = True`

---

## 📂 Struktur File Deployment

```
server_smartcity/
├── deploy/
│   ├── gunicorn-mhs08.service    # Systemd service (→ /etc/systemd/system/)
│   ├── smartcity_nginx.conf       # Nginx config (→ /etc/nginx/sites-available/)
│   ├── setup_server.sh           # Script deployment otomatis
│   └── README-deploy.md          # Panduan ini
├── smartcity_citizen_spa_24782058/  # Frontend SPA (→ GitHub Pages)
├── smartcity_app/
│   └── settings.py               # Django settings (sudah dikonfigurasi)
└── .github/workflows/
    └── deploy_pages.yml          # GitHub Actions workflow
```
