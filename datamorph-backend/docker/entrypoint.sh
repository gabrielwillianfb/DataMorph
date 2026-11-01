#!/bin/sh
set -e

# Substitute PORT in Nginx configuration if set by Render or cloud environment
PORT="${PORT:-80}"
sed -i "s/listen 80;/listen ${PORT};/g" /etc/nginx/http.d/default.conf
sed -i "s/listen \[::\]:80;/listen [::]:${PORT};/g" /etc/nginx/http.d/default.conf

# Ensure SQLite file exists if using sqlite database driver
if [ "${DB_CONNECTION:-sqlite}" = "sqlite" ]; then
    touch /var/www/html/database/database.sqlite
    chown -R www-data:www-data /var/www/html/database
    chmod -R 775 /var/www/html/database
fi

# Run database migrations
php artisan migrate --force

# Cache routes and configuration
php artisan config:cache || true
php artisan route:cache || true

# Start PHP-FPM in background
php-fpm -D

# Start Nginx in foreground
exec nginx -g "daemon off;"
