# HUREX ERP - Production Deployment & Self-Hosting Manual

This document provides complete instructions for deploying, hosting, managing, and backing up the **Hurex ERP** application as a fully independent, production-grade, commercial software product.

The application operates as a standalone system with zero connection to, or dependency on, any AI development platform, builder tool, or proprietary runtime. You have full source code ownership.

---

## 🏢 Architectural Overview

Hurex ERP is built on a highly optimized **Client-Side, Local-First Single Page Application (SPA)** architecture:

*   **Frontend Framework**: React 19 + TypeScript + Vite 6
*   **Styling Engine**: Tailwind CSS 4
*   **Data Persistence**: Client-side storage engine using HTML5 LocalStorage with dedicated backup/restore export services. This provides absolute data sovereignty for the business owner—no customer, transaction, or financial records are ever sent to external third parties.
*   **Offline-First Capability**: The application runs completely in the browser sandbox. It is fully capable of processing offline sales, local inventory updates, expense entries, and affiliate logs without any internet connectivity.
*   **Production Server**: Multi-stage Dockerized Nginx Alpine image, pre-configured with secure response headers, standard Gzip compression, and SPA static routing.

---

## 🚀 Quick Start (Local Development)

To run the application locally on your machine for customization or testing:

### Prerequisites
*   [Node.js (v18 or higher)](https://nodejs.org/)
*   [NPM (v9 or higher)](https://www.npmjs.com/)

### Installation Steps
1.  **Extract the source code archive** to your working directory.
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Run the development server**:
    ```bash
    npm run dev
    ```
4.  Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Compile
To compile the static assets into optimized HTML, JS, and CSS files:
```bash
npm run build
```
The compiled files will be located in the `/dist` directory and are ready to be served by any static file server (Nginx, Apache, Netlify, Vercel, S3, etc.).

---

## 🐳 Docker Deployment (Recommended)

Docker isolates the application inside a lightweight container, making deployment consistent across VPS servers, dedicated machines, and cloud environments.

### Prerequisites
*   [Docker Engine](https://docs.docker.com/engine/install/)
*   [Docker Compose](https://docs.docker.com/compose/install/)

### One-Command Launch
We have provided a unified `docker-compose.yml` file. To build and start the application container in detached (background) mode:

```bash
docker compose up -d --build
```

### Verification
Confirm that the container is running successfully:
```bash
docker compose ps
```
The application will be accessible at [http://localhost:3000](http://localhost:3000).

---

## ☁️ VPS Deployment (Ubuntu / Debian)

This section guides you through deploying Hurex ERP on a raw virtual private server (such as DigitalOcean, Linode, AWS EC2, or Hetzner) running Ubuntu 22.04 LTS or newer.

### Step 1: Copy Files to Server
Use `rsync` or `scp` to transfer the application source directory to your VPS:
```bash
rsync -avz --exclude 'node_modules' --exclude 'dist' --exclude '.git' ./ user@your-server-ip:/var/www/hurex-erp
```

### Step 2: Run the VPS Deployer
Log into your VPS via SSH:
```bash
ssh user@your-server-ip
cd /var/www/hurex-erp
```
Make the automated deployer executable and run it as root:
```bash
chmod +x deploy.sh backup.sh restore.sh
sudo ./deploy.sh
```
This script will automatically verify dependencies, install Docker if needed, build the production image, and spin up the container.

### Step 3: Configure Domain and SSL (Reverse Proxy)
To secure your production traffic over HTTPS using a domain name, configure a host-level Nginx reverse proxy.

1.  **Install Nginx and Certbot** on your VPS:
    ```bash
    sudo apt update
    sudo apt install -y nginx certbot python3-certbot-nginx
    ```

2.  **Create an Nginx Server Block** configuration file:
    ```bash
    sudo nano /etc/nginx/sites-available/hurex-erp
    ```

    Paste the following configuration (replace `erp.yourdomain.com` with your actual domain):
    ```nginx
    server {
        listen 80;
        server_name erp.yourdomain.com;

        location / {
            proxy_pass http://127.0.0.1:3000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
    ```

3.  **Enable the configuration** and restart Nginx:
    ```bash
    sudo ln -s /etc/nginx/sites-available/hurex-erp /etc/nginx/sites-enabled/
    sudo nginx -t
    sudo systemctl restart nginx
    ```

4.  **Obtain an SSL Certificate** from Let's Encrypt:
    ```bash
    sudo certbot --nginx -d erp.yourdomain.com
    ```
    Follow the prompt to enable automatic redirection of all HTTP traffic to secure HTTPS.

---

## 💾 Absolute Data Ownership & Backups

Because Hurex ERP stores your operational data in the browser (local-first storage):
*   **No database server connection issues** are possible.
*   Your critical numbers are kept **entirely private and offline**.

### Automated Deployment Backup
To backup the current deployment files, configuration setups, and scripts on your server, run:
```bash
./backup.sh
```
This saves a timestamped tarball inside the `./backups/` directory.

### Business Data Backup (Critical)
To preserve and backup your transaction, inventory, customer, and affiliate records:
1.  Navigate to the **Backup & Restore** (Hifadhi & Rejesha) panel in the ERP sidebar.
2.  Click **Create Backup** (Tengeneza Hifadhi ya Data).
3.  The browser will compile all local tables into a single encrypted `.json` file and prompt you to download it.
4.  Store this file securely in a cloud storage service (Google Drive, Dropbox, OneDrive) or an external hard drive.

### Business Data Restoration
To migrate the ERP data to a new server, load it onto a new laptop, or restore after a browser reset:
1.  Open your deployed ERP instance on the target device.
2.  Go to the **Backup & Restore** panel.
3.  Click **Import Backup / Restore File**.
4.  Select your previously downloaded `.json` file.
5.  All records are restored and available instantly.

---

## 🔒 Production Security Hardening

For secure commercial environments, follow these additional practices:
*   **IP Whitelisting**: If accessing the ERP only from specific office locations, restrict SSH and Port 3000 access on the VPS using UFW (Uncomplicated Firewall):
    ```bash
    sudo ufw allow OpenSSH
    sudo ufw allow 'Nginx Full'
    sudo ufw enable
    ```
*   **Regular Software Updates**: Keep your server packages updated:
    ```bash
    sudo apt update && sudo apt upgrade -y
    ```
