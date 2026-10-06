# EC2 Deployment Guide for KerasLab Backend

This guide outlines the steps to deploy the FastAPI Keras backend to an AWS EC2 instance. The application will be served by Uvicorn (running as a systemd service) and proxied through Nginx on port 80.

### Step 1: Create the EC2 instance
1. Log in to the AWS Management Console.
2. Go to the EC2 Dashboard and click **Launch Instance**.
3. Provide a name for the instance (e.g., `keraslab-backend`).

### Step 2: Choose Instance Architecture
- **Recommended instance type**: `t3.medium` or `t3.large`. The ML model inference requires sufficient memory.
- **Architecture**: `x86_64` (Standard) is recommended for maximum pre-compiled TensorFlow wheel compatibility.

### Step 3: Choose OS (Ubuntu)
- Under **Application and OS Images (Amazon Machine Image)**, select **Ubuntu**.
- Choose **Ubuntu Server 24.04 LTS (HVM)** or **22.04 LTS**.
- Select an existing key pair or create a new one to allow SSH access.

### Step 4: Configure the Security Group
Under **Network settings**, create or select a security group with the following inbound rules:
- **SSH (TCP 22)**: Allow from **My IP only** (for your own access).
- **HTTP (TCP 80)**: Allow from **0.0.0.0/0** (Anywhere, for the API access).
- **HTTPS (TCP 443)**: Allow from **0.0.0.0/0** (Anywhere, if you plan to configure SSL later).
- **Important**: Do **NOT** open port 5000 to the internet. Nginx will securely reverse proxy requests to it.

### Step 5: Connect using SSH
Connect to your EC2 instance from your local machine using the SSH key:
```bash
ssh -i /path/to/your-key.pem ubuntu@<EC2_PUBLIC_IP>
```

### Step 6: Upload the backend
From your local project's `backend` directory, run the provided deployment script.
First, update `deploy.sh` with your EC2 details:
```bash
# In backend/deploy/deploy.sh
EC2_HOST="<EC2_PUBLIC_IP>"
EC2_USER="ubuntu"
SSH_KEY="/path/to/your-key.pem"
```
Run the deployment script:
```bash
./deploy/deploy.sh
```

*(Alternatively, you can manually use `rsync` or `scp` to copy the backend folder to `/opt/keras-backend` on the EC2 instance.)*

### Step 7: Create the Python virtual environment
If this is your first time deploying and you haven't run `deploy.sh` (or if you just uploaded files manually), log into the EC2 instance and run the setup script:
```bash
cd /opt/keras-backend
sudo ./deploy/setup-ec2.sh
```
This script automatically:
- Installs Python, pip, Nginx, and required system dependencies.
- Creates the Python virtual environment (`venv`).

### Step 8: Install dependencies
The `setup-ec2.sh` script (or `deploy.sh` on updates) automatically installs the dependencies.
```bash
./venv/bin/pip install -r requirements.txt
```

### Step 9: Configure systemd
The `setup-ec2.sh` script automatically configures `keras-backend.service` using `deploy/keras-backend.service`.
To manually check the status:
```bash
sudo systemctl status keras-backend
```

### Step 10: Configure Nginx
The `setup-ec2.sh` script configures Nginx using `deploy/nginx.conf`.
To manually test the Nginx configuration:
```bash
sudo nginx -t
```
To check Nginx status:
```bash
sudo systemctl status nginx
```

### Step 11: Start the backend
The services are started automatically by the setup script. If you need to restart them manually:
```bash
sudo systemctl restart keras-backend
sudo systemctl restart nginx
```

### Step 12: Test `/health`
Test the API endpoint locally from the EC2 instance:
```bash
curl http://127.0.0.1/health
```
You should see: `{"status":"ok","model_loaded":true}`

### Step 13: Test the actual ML API endpoint
From your local machine or another network, use the public IP of your EC2 instance:
```bash
curl http://<EC2_PUBLIC_IP>/health
```
Once verified, update your frontend's environment variable to point to the new backend:
```env
FRONTEND_URL=http://<YOUR_FRONTEND_DOMAIN>
# On the frontend, point the API to http://<EC2_PUBLIC_IP>
```
Remember to add your frontend URL to the backend's `CORS_ORIGINS` inside `/opt/keras-backend/.env` on the EC2 instance!

### Step 14: Find logs
If something goes wrong, you can inspect the logs:
- **FastAPI / Uvicorn Logs:**
  ```bash
  sudo journalctl -u keras-backend -f
  ```
- **Nginx Access Logs:**
  ```bash
  sudo tail -f /var/log/nginx/access.log
  ```
- **Nginx Error Logs:**
  ```bash
  sudo tail -f /var/log/nginx/error.log
  ```

---
### HTTPS Configuration (Optional but Recommended)
To secure your API, point a domain name (e.g., `api.yourdomain.com`) to your EC2 instance's IP address. Then use Certbot to automatically configure SSL:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```
Certbot will automatically modify your Nginx configuration to support HTTPS.
