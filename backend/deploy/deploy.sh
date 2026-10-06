#!/bin/bash
set -e

# Configuration variables
EC2_HOST="43.204.149.247"
EC2_USER="ubuntu"
APP_DIR="/opt/keras-backend"
SSH_KEY="C:\Users\sabar\Downloads\keras-backend-key.pem"

echo "Deploying to ${EC2_USER}@${EC2_HOST}..."

# Sync files (excluding unnecessary ones like venv or local caches)
rsync -avz --exclude 'venv' \
           --exclude '__pycache__' \
           --exclude '*.pyc' \
           --exclude '.git' \
           --exclude '.env' \
           -e "ssh -i ${SSH_KEY}" ./ ${EC2_USER}@${EC2_HOST}:${APP_DIR}/

# SSH into the machine, update dependencies and restart services
ssh -i ${SSH_KEY} ${EC2_USER}@${EC2_HOST} << 'EOF'
    set -e
    cd /opt/keras-backend
    
    # Update dependencies in case requirements.txt changed
    ./venv/bin/pip install -r requirements.txt
    
    # Restart services
    sudo systemctl daemon-reload
    sudo systemctl restart keras-backend
    sudo systemctl restart nginx
    
    echo "Deployment successful."
    curl -s http://127.0.0.1/health
EOF
