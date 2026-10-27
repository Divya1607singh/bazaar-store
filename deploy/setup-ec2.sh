#!/usr/bin/env bash
# One-time setup on a fresh Ubuntu EC2 instance:  bash setup-ec2.sh
set -euo pipefail
sudo apt-get update -y
sudo apt-get install -y docker.io curl
sudo systemctl enable --now docker
sudo usermod -aG docker "$USER"
# Free port 80 if the old nginx-on-host setup was used
sudo systemctl disable --now nginx 2>/dev/null || true
echo "Done. Log out and log in again so the docker group applies."
