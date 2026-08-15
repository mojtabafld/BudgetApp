# 💰 Budget Master (PWA & Dockerized)

A modern, collaborative personal and team budget management application built with **React 18**, **TypeScript**, **Tailwind CSS**, **Chart.js**, and **Vite PWA**, fully containerized with **Docker** and pre-configured for automatic deployment on **DigitalOcean App Platform** with managed **PostgreSQL**.

[![Deploy to DO](https://www.deploytodo.com/do-btn-blue.svg)](https://cloud.digitalocean.com/apps/new?repo=https://github.com/mojtabafld/BudgetApp/tree/main)
![Currency](https://img.shields.io/badge/Default%20Currency-DKK%20(Danish%20Krone)-blue?style=for-the-badge)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![DigitalOcean](https://img.shields.io/badge/DigitalOcean-App%20Platform%20Auto--Provisioned-0080FF?style=for-the-badge&logo=digitalocean&logoColor=white)
![iOS PWA](https://img.shields.io/badge/iOS-Native%20Home%20Screen%20Ready-black?style=for-the-badge&logo=apple&logoColor=white)

---

## 🌟 Key Highlights

- **🌊 One-Click DigitalOcean App Platform Auto-Detection (`.do/app.yaml`)**:
  - Automatically provisions the **Web App (Docker)** and **Managed PostgreSQL 16 Database** simultaneously.
  - Automatically binds `DATABASE_URL` runtime environment variable.
- **📱 iOS Native Home Screen Web Clip (iPhone & iPad)**:
  - High-resolution `apple-touch-icon.png` (180x180), `black-translucent` status bar, and `standalone` full-screen display without browser address bar.
  - Built-in smart **iOS Add to Home Screen** guide dialog with step-by-step instructions.
- **🇩🇰 Danish Krone (DKK - kr.) by Default**:
  - Default currency across all accounts and workspaces, with instant toggle for USD ($), EUR (€), GBP (£), and Iranian Toman/Rial.
- **🌐 Dual Language & Multi-Calendar (i18n)**:
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

---

## 🌊 DigitalOcean App Platform (Automatic Provisioning)

Because of the included [`.do/app.yaml`](.do/app.yaml) specification:

1. Go to **[DigitalOcean App Platform](https://cloud.digitalocean.com/apps/new)**.
2. Select your repository: `mojtabafld/BudgetApp` (Branch: `main`).
3. **DigitalOcean will automatically detect `.do/app.yaml`** and automatically configure:
   - ✅ **Web Service**: Multi-stage Dockerfile on Port 80
   - ✅ **Database**: PostgreSQL 16 database attached automatically
   - ✅ **Environment Variables**: Injected automatically
4. Click **Create Resources** to launch!

---

## 📱 How to Install on iOS (iPhone / iPad)

1. Open the app in **Safari** on your iPhone or iPad.
2. Tap the **Share** button `[⎋]` at the bottom of the screen.
3. Scroll down and tap **"Add to Home Screen"** (`افزودن به صفحه اصلی`).
4. Tap **"Add"** in the top-right corner.
5. Launch **BudgetMaster** from your Home Screen for a 100% full-screen native app experience!

---

## 🐳 Docker Deployment (Droplet / Local)

```bash
# 1. Clone repository
git clone https://github.com/mojtabafld/BudgetApp.git
cd BudgetApp

# 2. Copy environment template
cp .env.example .env

# 3. Build and launch containers
docker compose up -d --build
```

- **App Web Interface**: `http://localhost:3000`
- **Database Admin UI (Adminer)**: `http://localhost:8080`
- **PostgreSQL Database**: `localhost:5432`

---

## 📄 License

MIT License. Designed with excellence for collaborative financial freedom.
