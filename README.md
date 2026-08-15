# 💰 Budget Master (PWA & Dockerized)

A modern, collaborative personal and team budget management application built with **React 18**, **TypeScript**, **Tailwind CSS**, **Chart.js**, and **Vite PWA**, fully containerized with **Docker** and ready for deployment on **DigitalOcean**.

![Budget Master](https://img.shields.io/badge/Currency-DKK%20(Danish%20Krone)-blue?style=for-the-badge)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![DigitalOcean](https://img.shields.io/badge/DigitalOcean-Deployable-0080FF?style=for-the-badge&logo=digitalocean&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-Installable-purple?style=for-the-badge)

---

## 🌟 Key Features

- **🇩🇰 Danish Krone (DKK - kr.) by Default**: Fully localized with Danish Krone as default, with instant support for USD ($), EUR (€), GBP (£), and Iranian Toman/Rial.
- **🌐 Bilingual & Dual Calendar (i18n)**:
  - **Default**: English LTR with Gregorian calendar.
  - **Toggle**: Persian (FA) RTL with Jalali (Solar Hijri) calendar and Vazirmatn typography.
- **👥 Collaborative Workspaces & Granular Permissions**:
  - **Owner**: Full workspace management, member invitation, role changes, and budget limits.
  - **Editor**: Can view and add/edit/delete transactions in real-time.
  - **Viewer (Read-Only)**: View-only access with disabled editing actions and visual indicator badge.
- **📊 Interactive Financial Visualizations**:
  - **Donut/Pie Chart**: Spending distribution by categories.
  - **6-Month Trend Line Chart**: Historical Income vs. Expense comparison.
  - **Budget Health Limits**: Progress bars with warning (80%) and danger (100%+) thresholds.
- **📱 PWA & Native Mobile Ready**:
  - Installable on iOS, Android, and Desktop.
  - Ready for native wrapping with **Capacitor** for App Store & Google Play.
- **🐳 Docker Architecture**:
  - Multi-stage lightweight production Docker build (`nginx:alpine`).
  - `docker-compose.yml` with PostgreSQL database and Adminer DB management UI.

---

## 🏗️ Architecture Overview

```
                        ┌─────────────────────────────────┐
                        │   DigitalOcean / Cloud Server   │
                        └────────────────┬────────────────┘
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 │                                               │
                 ▼                                               ▼
       ┌───────────────────┐                           ┌───────────────────┐
       │   budgetmaster-web│                           │ budgetmaster-db   │
       │   (Nginx + PWA)   │ ── Database Connection ── │   (PostgreSQL 16) │
       │   Port: 3000      │                           │   Port: 5432      │
       └───────────────────┘                           └─────────┬─────────┘
                                                                 │
                                                                 ▼
                                                       ┌───────────────────┐
                                                       │budgetmaster-admin │
                                                       │   (Adminer UI)    │
                                                       │   Port: 8080      │
                                                       └───────────────────┘
```

---

## 🚀 Quick Start (Local Development)

### 1. Standard Node.js

```bash
# Clone repository
git clone <your-github-repo-url>
cd BudgetApp

# Install dependencies
npm install

# Start development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🐳 Docker Deployment

### Run with Docker Compose

```bash
# 1. Copy environment template
cp .env.example .env

# 2. Build and launch containers
docker compose up -d --build

# 3. Check running services
docker compose ps
```

- **App Web Interface**: `http://localhost:3000`
- **Database Admin UI (Adminer)**: `http://localhost:8080`
- **PostgreSQL Database**: `localhost:5432`

---

## 🌊 DigitalOcean Deployment Guide

### Option A: DigitalOcean Droplet (Docker Compose)

1. **Create a Droplet**:
   - Select **Ubuntu 24.04** or **Docker on Ubuntu** from DigitalOcean Marketplace.
2. **Connect via SSH**:
   ```bash
   ssh root@<your-droplet-ip>
   ```
3. **Clone & Launch**:
   ```bash
   git clone <your-github-repo-url> /opt/budgetapp
   cd /opt/budgetapp
   cp .env.example .env
   # Edit .env with your custom secure password
   nano .env
   docker compose up -d --build
   ```
4. **Setup Domain & SSL (Optional Certbot)**:
   ```bash
   apt install -y certbot
   certbot certonly --standalone -d budget.yourdomain.com
   ```

### Option B: DigitalOcean App Platform

1. Connect your **GitHub Repository** to DigitalOcean App Platform.
2. Select **Dockerfile** as the build mechanism.
3. Add a **Managed PostgreSQL Database** component directly from the dashboard.
4. Deploy with zero configuration!

---

## 🛠️ Tech Stack

- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 + Lucide Icons + Custom Glassmorphism
- **Charts**: Chart.js + React-Chartjs-2
- **Localization**: English (Gregorian) & Persian (Jalaali Solar Calendar)
- **Container**: Docker + Nginx Alpine + PostgreSQL 16
- **CI/CD**: GitHub Actions

---

## 📄 License

MIT License. Designed with excellence.
