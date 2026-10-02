# Production Deployment Guide: inquiryportal.inventkid.com
### OS: AlmaLinux 9 VPS (Bluehost) | CI/CD: GitHub Actions

This guide provides end-to-end instructions for deploying the **Inquiry Management Portal** to your Bluehost AlmaLinux 9 VPS under the subdomain **`inquiryportal.inventkid.com`**, backed by automated CI/CD using GitHub Actions connected to your repository **`DhruvalBhansali2912/Inquiry-management-portal`**.

---

## 1. Local Machine: Push Code to GitHub

First, make sure all code is committed and pushed to your GitHub repository:

```bash
cd /path/to/assessment

# Verify remote is set to your GitHub repo
git remote -v
# If needed, set origin:
# git remote set-url origin https://github.com/DhruvalBhansali2912/Inquiry-management-portal.git

# Ensure current branch is main
git branch -M main

# Push code to GitHub
git push -u origin main
```

---

## 2. DNS Record Setup (Domain Registrar / cPanel / Cloudflare)

Before configuring SSL or Nginx on your VPS, create the DNS **A Record** pointing `inquiryportal.inventkid.com` to your VPS IP:

| Type | Name / Host | Value / Target | TTL |
|---|---|---|---|
| **A** | `inquiryportal` | `YOUR_BLUEHOST_VPS_IP` | 300 / Auto |

*Note: Allow 5-15 minutes for DNS propagation.* You can verify using `dig inquiryportal.inventkid.com +short` or `nslookup inquiryportal.inventkid.com`.

---

## 3. VPS Terminal: Initial Server Setup (One-time)

SSH into your Bluehost AlmaLinux 9 VPS as `root` (or sudoer):

```bash
ssh root@YOUR_BLUEHOST_VPS_IP
```

### 3.1 Update OS & Install Base Tools
```bash
dnf update -y
dnf install -y epel-release dnf-utils git unzip curl rsync policycoreutils-python-utils
```

### 3.2 Install PHP 8.2 (Remi Repository)
AlmaLinux 9 defaults to PHP 8.0. Enable Remi's PHP 8.2 stream:

```bash
dnf install -y https://rpms.remirepo.net/enterprise/remi-release-9.rpm
dnf module reset php -y
dnf module enable php:remi-8.2 -y

dnf install -y php-cli php-fpm php-mysqlnd php-pdo php-mbstring php-xml \
  php-ctype php-iconv php-intl php-fileinfo php-zip php-curl php-json php-gd
```

Verify PHP version:
```bash
php -v # Should display PHP 8.2.x
```

Start and enable PHP-FPM:
```bash
systemctl enable --now php-fpm
```

### 3.3 Install Composer
```bash
php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
php composer-setup.php --install-dir=/usr/local/bin --filename=composer
php -r "unlink('composer-setup.php');"
composer --version
```

### 3.4 Install Nginx
```bash
dnf install -y nginx
systemctl enable --now nginx
```

### 3.5 Install MariaDB Database
```bash
dnf install -y mariadb-server mariadb
systemctl enable --now mariadb

# Run security setup
mariadb-secure-installation
```

Log in and create the database and user:
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

## 4. Firewall & SELinux Configuration

### 4.1 Open Firewall Ports (firewalld)
```bash
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
firewall-cmd --permanent --add-service=ssh
firewall-cmd --reload
```

### 4.2 Configure SELinux & Project Directory
```bash
# Allow Nginx to connect to network & send mail
setsebool -P httpd_can_network_connect 1
setsebool -P httpd_can_sendmail 1

# Create web root directory
mkdir -p /var/www/inquiryportal.inventkid.com
chown -R nginx:nginx /var/www/inquiryportal.inventkid.com

# Configure SELinux contexts for storage and cache
semanage fcontext -a -t httpd_sys_rw_content_t "/var/www/inquiryportal.inventkid.com/storage(/.*)?"
semanage fcontext -a -t httpd_sys_rw_content_t "/var/www/inquiryportal.inventkid.com/bootstrap/cache(/.*)?"
restorecon -Rv /var/www/inquiryportal.inventkid.com
```

---

## 5. PHP-FPM & Nginx Virtual Host Setup

### 5.1 Configure PHP-FPM Pool
Edit `/etc/php-fpm.d/www.conf`:
```bash
nano /etc/php-fpm.d/www.conf
```
Ensure these directives match:
```ini
user = nginx
group = nginx
listen = /run/php-fpm/www.sock
listen.owner = nginx
listen.group = nginx
listen.mode = 0660
```
Restart PHP-FPM:
```bash
systemctl restart php-fpm
```

### 5.2 Initial Clone on VPS (To populate deploy files)
```bash
cd /var/www
git clone https://github.com/DhruvalBhansali2912/Inquiry-management-portal.git inquiryportal.inventkid.com
cd /var/www/inquiryportal.inventkid.com
```

### 5.3 Copy Nginx Virtual Host
```bash
cp /var/www/inquiryportal.inventkid.com/deploy/nginx.conf /etc/nginx/conf.d/inquiryportal.inventkid.com.conf
nginx -t
systemctl reload nginx
```

---

## 6. SSL Certificate with Let's Encrypt (Certbot)

Install Certbot for Nginx on AlmaLinux 9:
```bash
dnf install -y certbot python3-certbot-nginx
certbot --nginx -d inquiryportal.inventkid.com
```
Follow prompts to enter your email and agree to terms. Certbot will automatically update `/etc/nginx/conf.d/inquiryportal.inventkid.com.conf` with SSL certificates and HTTP-to-HTTPS redirect.

Enable automatic SSL renewal timer:
```bash
systemctl enable --now certbot-renew.timer
```

---

## 7. Production `.env` and First-Time DB Setup on VPS

On the VPS, create `/var/www/inquiryportal.inventkid.com/.env`:
```bash
cp .env.example .env
nano .env
```

Configure production values:
```ini
APP_NAME="Inquiry Management Portal"
APP_ENV=production
APP_KEY= # Generate using: php artisan key:generate --show
APP_DEBUG=false
APP_URL=https://inquiryportal.inventkid.com

LOG_CHANNEL=stack
LOG_LEVEL=error

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=inquiry_portal
DB_USERNAME=inquiry_user
DB_PASSWORD=STRONG_SECRET_PASSWORD_HERE

SESSION_DRIVER=database
QUEUE_CONNECTION=database
CACHE_STORE=database

MAIL_MAILER=smtp
MAIL_HOST=mail.inventkid.com # Or smtp.sendgrid.net / mailgun
MAIL_PORT=587
MAIL_USERNAME=notifications@inventkid.com
MAIL_PASSWORD=your_email_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="notifications@inventkid.com"
MAIL_FROM_NAME="InventKid Inquiry Team"
ADMIN_NOTIFICATION_EMAIL="admin@inventkid.com"
```

Generate the key and run the initial migration & seeder:
```bash
php artisan key:generate --force
php artisan migrate --force
php artisan db:seed --force
php artisan storage:link || true
```

Set correct permissions:
```bash
chown -R nginx:nginx /var/www/inquiryportal.inventkid.com
chmod -R 775 storage bootstrap/cache
```

---

## 8. Systemd Queue Worker & Scheduler

Enable background queue worker for email notifications and background tasks:
```bash
cp /var/www/inquiryportal.inventkid.com/deploy/inquiry-worker.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable --now inquiry-worker.service

# Enable Laravel schedule timer (runs schedule:run every minute)
cp /var/www/inquiryportal.inventkid.com/deploy/inquiry-scheduler.service /etc/systemd/system/
cp /var/www/inquiryportal.inventkid.com/deploy/inquiry-scheduler.timer /etc/systemd/system/
systemctl daemon-reload
systemctl enable --now inquiry-scheduler.timer
```

---

## 9. GitHub Actions CI/CD Setup

To enable automated zero-downtime deployment every time you push to `main`:

### 9.1 Generate a Dedicated SSH Key Pair
On your VPS terminal (or your local computer):
```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_deploy -N ""
```

Add the public key to authorized keys on the VPS:
```bash
cat ~/.ssh/github_deploy.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

Display the private key:
```bash
cat ~/.ssh/github_deploy
```
*(Copy the entire output, including `-----BEGIN OPENSSH PRIVATE KEY-----` and `-----END OPENSSH PRIVATE KEY-----`)*

### 9.2 Add Secrets in GitHub
Go to your repository:
**`https://github.com/DhruvalBhansali2912/Inquiry-management-portal/settings/secrets/actions`**

Click **"New repository secret"** and add:

| Secret Name | Value |
|---|---|
| `VPS_HOST` | Your Bluehost VPS IP or server hostname |
| `VPS_USERNAME` | `root` (or deployment user with sudo privileges) |
| `VPS_SSH_KEY` | Paste the private key from `~/.ssh/github_deploy` |
| `VPS_PORT` | `22` (or your custom SSH port if changed) |

---

## 10. Automated Deployment Test

Now, anytime you push code:
```bash
git add .
git commit -m "update"
git push origin main
```

1. GitHub Actions will:
   - Run PHPUnit tests and Vite frontend build.
   - Rsync changed application files to `/var/www/inquiryportal.inventkid.com/`.
   - Run `deploy/deploy-vps.sh` on the VPS to migrate DB, clear & warm caches, and reload PHP-FPM.
2. Visit **`https://inquiryportal.inventkid.com`** to verify your live production site!
