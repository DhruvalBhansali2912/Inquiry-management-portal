# Production Deployment Guide: AlmaLinux 9 VPS (Bluehost)

This guide provides end-to-end instructions for deploying the **Inquiry Management Portal** to an **AlmaLinux 9 Bluehost VPS** with automated CI/CD using GitHub Actions.

---

## 1. Initial AlmaLinux 9 Server Setup

Log in to your Bluehost VPS via terminal SSH:

```bash
ssh root@YOUR_SERVER_IP
```

### 1.1 Update the OS and Install Core Packages
```bash
dnf update -y
dnf install -y epel-release dnf-utils git unzip curl rsync policycoreutils-python-utils
```

### 1.2 Install PHP 8.2 (Remi Repository)
AlmaLinux 9 comes with PHP 8.0 by default. Enable Remi's PHP 8.2 stream:

```bash
dnf install -y https://rpms.remirepo.net/enterprise/remi-release-9.rpm
dnf module reset php -y
dnf module enable php:remi-8.2 -y

dnf install -y php-cli php-fpm php-mysqlnd php-pdo php-mbstring php-xml \
  php-ctype php-iconv php-intl php-fileinfo php-zip php-curl php-json php-gd
```

Start and enable PHP-FPM:
```bash
systemctl enable --now php-fpm
```

### 1.3 Install Composer
```bash
php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
php composer-setup.php --install-dir=/usr/local/bin --filename=composer
php -r "unlink('composer-setup.php');"
composer --version
```

### 1.4 Install Nginx Web Server
```bash
dnf install -y nginx
systemctl enable --now nginx
```

### 1.5 Install MariaDB / MySQL Database
```bash
dnf install -y mariadb-server mariadb
systemctl enable --now mariadb

# Secure the installation and set root password
mariadb-secure-installation
```

Create the application database and user:
```bash
mariadb -u root -p
```
```sql
CREATE DATABASE inquiry_portal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'inquiry_user'@'localhost' IDENTIFIED BY 'STRONG_SECRET_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON inquiry_portal.* TO 'inquiry_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

## 2. Firewall & SELinux Configuration

### 2.1 Open Firewall Ports (firewalld)
```bash
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
firewall-cmd --permanent --add-service=ssh
firewall-cmd --reload
```

### 2.2 Configure SELinux for Nginx & PHP-FPM
AlmaLinux 9 enforces SELinux by default:

```bash
# Allow Nginx to connect to network & send mail
setsebool -P httpd_can_network_connect 1
setsebool -P httpd_can_sendmail 1

# Create project directory
mkdir -p /var/www/assessment
chown -R nginx:nginx /var/www/assessment

# Set persistent SELinux write contexts for storage and cache
semanage fcontext -a -t httpd_sys_rw_content_t "/var/www/assessment/storage(/.*)?"
semanage fcontext -a -t httpd_sys_rw_content_t "/var/www/assessment/bootstrap/cache(/.*)?"
restorecon -Rv /var/www/assessment
```

---

## 3. Web Server & PHP-FPM Configuration

### 3.1 Configure PHP-FPM User and Socket
Edit `/etc/php-fpm.d/www.conf`:
```ini
user = nginx
group = nginx
listen = /run/php-fpm/www.sock
listen.owner = nginx
listen.group = nginx
listen.mode = 0660
```
Reload PHP-FPM:
```bash
systemctl restart php-fpm
```

### 3.2 Install Nginx Virtual Host
Copy `deploy/nginx.conf` to `/etc/nginx/conf.d/inquiry.conf`:
```bash
cp /var/www/assessment/deploy/nginx.conf /etc/nginx/conf.d/inquiry.conf
```
Replace `yourdomain.com` with your domain name or server IP in `/etc/nginx/conf.d/inquiry.conf`.
Test and reload Nginx:
```bash
nginx -t
systemctl reload nginx
```

---

## 4. Install Free Let's Encrypt SSL (Certbot)

```bash
dnf install -y certbot python3-certbot-nginx
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```
Certbot automatically installs a renewal timer in AlmaLinux 9 (`systemctl enable --now certbot-renew.timer`).

---

## 5. Background Workers & Schedulers (Systemd)

Install the pre-configured systemd worker and scheduler timers:

```bash
# Queue Worker for notifications and emails
cp /var/www/assessment/deploy/inquiry-worker.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable --now inquiry-worker.service

# Scheduler Timer (replaces crontab)
cp /var/www/assessment/deploy/inquiry-scheduler.service /etc/systemd/system/
cp /var/www/assessment/deploy/inquiry-scheduler.timer /etc/systemd/system/
systemctl daemon-reload
systemctl enable --now inquiry-scheduler.timer
```

---

## 6. GitHub Actions CI/CD Secrets Setup

In your GitHub repository, navigate to **Settings > Secrets and variables > Actions > New repository secret** and add:

| Secret Name | Description | Example Value |
|---|---|---|
| `VPS_HOST` | Bluehost VPS public IP or hostname | `192.0.2.1` or `vps.yourdomain.com` |
| `VPS_USERNAME` | SSH username on VPS | `root` or `deployer` |
| `VPS_SSH_KEY` | Private SSH key for connecting to VPS | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `VPS_PORT` | SSH port (Bluehost usually uses 22) | `22` |

### Setting Up the Deployment SSH Key:
On your local machine or server:
```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/id_deploy
# Add public key ~/.ssh/id_deploy.pub to VPS: /root/.ssh/authorized_keys
# Add private key ~/.ssh/id_deploy contents to GitHub Secret: VPS_SSH_KEY
```

---

## 7. First Deployment & Environment Variables

On the VPS, create `/var/www/assessment/.env`:
```ini
APP_NAME="Inquiry Management Portal"
APP_ENV=production
APP_KEY=base64:... # Generate via php artisan key:generate --show
APP_DEBUG=false
APP_URL=https://yourdomain.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=inquiry_portal
DB_USERNAME=inquiry_user
DB_PASSWORD=YOUR_STRONG_PASSWORD

SESSION_DRIVER=database
QUEUE_CONNECTION=database
CACHE_STORE=database

MAIL_MAILER=smtp
MAIL_HOST=smtp.mailgun.org # or Bluehost SMTP: mail.yourdomain.com
MAIL_PORT=587
MAIL_USERNAME=your_smtp_user
MAIL_PASSWORD=your_smtp_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="no-reply@yourdomain.com"
MAIL_FROM_NAME="${APP_NAME}"
```

Seed initial administrative staff:
```bash
cd /var/www/assessment
php artisan migrate --force
php artisan db:seed --force
```

### Initial Credentials:
- **Admin**: `admin@inquiry.local` (Password: `Password123!`)
- **Manager**: `manager@inquiry.local` (Password: `Password123!`)
- **Agent**: `agent@inquiry.local` (Password: `Password123!`)

---

## 8. Verifying Your Deployment

1. **Public Intake Page**: Visit `https://yourdomain.com/` or `https://yourdomain.com/inquiry` and submit a test lead.
2. **Staff Portal**: Click **Staff Login** and log in to view the real-time metrics, pipeline health, status workflow, and follow-up reminders.
3. **Automated Deploys**: Any push to the `main` branch automatically triggers tests, builds frontend assets, deploys to VPS, warms caches, and reloads PHP-FPM with zero downtime.
