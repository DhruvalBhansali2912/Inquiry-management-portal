#!/usr/bin/env bash
# ==============================================================================
# Inquiry Management Portal - Production Deployment Script
# Target OS: AlmaLinux 9 / RHEL 9 (Bluehost VPS)
# ==============================================================================

set -e

APP_DIR="/var/www/inquiryportal.inventkid.com"
WEB_USER="nginx"
WEB_GROUP="nginx"

echo "🚀 [1/8] Starting Deployment at $(date)..."
cd "$APP_DIR"

# Ensure .env exists
if [ ! -f "$APP_DIR/.env" ]; then
    echo "⚠️ .env file not found! Copying from .env.example..."
    cp "$APP_DIR/.env.example" "$APP_DIR/.env"
    php artisan key:generate --force
fi

echo "📦 [2/8] Installing production PHP dependencies via Composer..."
export COMPOSER_ALLOW_SUPERUSER=1
composer install --no-dev --prefer-dist --optimize-autoloader --no-interaction --no-progress

echo "🔒 [3/8] Entering temporary maintenance mode..."
php artisan down --render="errors::503" --retry=30 || true

echo "🗄️ [4/8] Running database migrations..."
php artisan migrate --force

echo "🔗 [5/8] Ensuring storage symlinks exist..."
php artisan storage:link || true

echo "⚡ [6/8] Clearing and warming up caches for performance..."
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan event:clear

php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

echo "🛡️ [7/8] Enforcing AlmaLinux 9 permissions and SELinux contexts..."
# Ensure storage and bootstrap directories exist
mkdir -p storage/framework/{sessions,views,cache} storage/logs bootstrap/cache storage/app/inquiry_attachments

# Set proper ownership for Nginx & PHP-FPM
chown -R $WEB_USER:$WEB_GROUP storage bootstrap/cache
chmod -R 775 storage bootstrap/cache

# Apply SELinux contexts if SELinux is active (standard on AlmaLinux 9)
if command -v getenforce >/dev/null 2>&1 && [ "$(getenforce)" != "Disabled" ]; then
    echo "Applying SELinux contexts for httpd/nginx write access..."
    semanage fcontext -a -t httpd_sys_rw_content_t "$APP_DIR/storage(/.*)?" 2>/dev/null || true
    semanage fcontext -a -t httpd_sys_rw_content_t "$APP_DIR/bootstrap/cache(/.*)?" 2>/dev/null || true
    restorecon -Rv "$APP_DIR/storage" "$APP_DIR/bootstrap/cache" >/dev/null 2>&1 || true
fi

echo "🟢 [8/8] Exiting maintenance mode and restarting PHP-FPM / Workers..."
php artisan up

# Reload PHP-FPM service (AlmaLinux 9 uses php-fpm)
if systemctl is-active --quiet php-fpm; then
    sudo systemctl reload php-fpm
fi

# Restart queue worker if registered
if systemctl list-unit-files | grep -q "inquiry-worker.service"; then
    sudo systemctl restart inquiry-worker.service || true
fi

echo "✅ Deployment finished successfully at $(date)!"
