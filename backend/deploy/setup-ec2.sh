#!/bin/bash
set -e

echo "Starting EC2 setup for Keras Backend..."

# 1. Update and install dependencies
sudo apt update
sudo apt upgrade -y
# Install Python 3.12 (default on Ubuntu 24.04), venv, Nginx
sudo apt install -y python3 python3-pip python3-venv nginx curl rsync

# 2. Create application directory
sudo mkdir -p /opt/keras-backend
sudo chown ubuntu:ubuntu /opt/keras-backend

# 3. Setup virtual environment
cd /opt/keras-backend
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

# 4. Install Python dependencies
./venv/bin/pip install --upgrade pip
./venv/bin/pip install -r requirements.txt

# 5. Configure systemd service
sudo cp deploy/keras-backend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable keras-backend
sudo systemctl restart keras-backend

# 6. Configure Nginx
sudo cp deploy/nginx.conf /etc/nginx/sites-available/keras-backend
sudo ln -sf /etc/nginx/sites-available/keras-backend /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl enable nginx
sudo systemctl restart nginx

# 7. Check statuses and test locally
echo "Checking service statuses..."
sudo systemctl is-active keras-backend || echo "keras-backend failed to start"
sudo systemctl is-active nginx || echo "nginx failed to start"

echo "Testing /health endpoint locally via Uvicorn (port 5000)..."
sleep 2
curl -s http://127.0.0.1:5000/health || echo "Failed to reach port 5000"

echo "Testing /health endpoint locally via Nginx (port 80)..."
curl -s http://127.0.0.1/health || echo "Failed to reach port 80"

echo "Setup complete!"
