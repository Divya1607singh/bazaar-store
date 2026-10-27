#!/usr/bin/env bash
# Run on an Ubuntu EC2 instance:  bash deploy/deploy.sh
set -euo pipefail
SRC="$(cd "$(dirname "$0")/.." && pwd)"
sudo apt-get update -y
sudo apt-get install -y nginx
sudo mkdir -p /var/www/bazaar
sudo rm -rf /var/www/bazaar/*
sudo cp -r "$SRC"/. /var/www/bazaar/
sudo rm -rf /var/www/bazaar/deploy
sudo cp "$SRC/deploy/nginx.conf" /etc/nginx/sites-available/bazaar
sudo ln -sf /etc/nginx/sites-available/bazaar /etc/nginx/sites-enabled/bazaar
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl enable --now nginx
sudo systemctl reload nginx
echo "Live at: http://$(curl -s http://checkip.amazonaws.com)"
