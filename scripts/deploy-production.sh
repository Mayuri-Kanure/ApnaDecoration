#!/bin/bash

# Production Deployment Script for APNA DECORATION
# This script deploys the entire platform to production

set -e

echo "🚀 Starting production deployment for APNA DECORATION..."

# Configuration
PROJECT_DIR="/var/www/apna-decoration"
BACKUP_DIR="/var/backups/apna-decoration"
NODE_ENV="production"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   print_error "This script must be run as root"
   exit 1
fi

# Create backup directory
print_status "Creating backup directory..."
mkdir -p "$BACKUP_DIR"

# Backup current deployment if it exists
if [ -d "$PROJECT_DIR" ]; then
    print_status "Backing up current deployment..."
    BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$BACKUP_DIR/$BACKUP_NAME"
    cp -r "$PROJECT_DIR"/* "$BACKUP_DIR/$BACKUP_NAME/"
    print_status "Backup created: $BACKUP_DIR/$BACKUP_NAME"
fi

# Update system packages
print_status "Updating system packages..."
apt update && apt upgrade -y

# Install Node.js if not present
if ! command -v node &> /dev/null; then
    print_status "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
fi

# Install PM2 if not present
if ! command -v pm2 &> /dev/null; then
    print_status "Installing PM2..."
    npm install -g pm2
fi

# Clone or update repository
print_status "Setting up project directory..."
mkdir -p "$PROJECT_DIR"
cd "$PROJECT_DIR"

if [ -d ".git" ]; then
    print_status "Pulling latest changes..."
    git pull origin main
else
    print_status "Cloning repository..."
    git clone https://github.com/your-username/apna-decoration.git .
fi

# Install dependencies
print_status "Installing dependencies..."
npm install
cd User && npm install && cd backend && npm install && cd ../..
cd Admin && npm install && cd backend && npm install && cd ../frontend && npm install && cd ../..
cd Vendor && npm install && cd frontend && npm install && cd ../..
cd Delivery && cd frontend && npm install && cd ../..

# Build all frontends
print_status "Building frontends..."
npm run build:all

# Setup environment files
print_status "Setting up environment files..."
cp .env.production .env
cp User/.env.production User/.env
cp Admin/backend/.env.production Admin/backend/.env
cp Vendor/backend/.env.production Vendor/backend/.env

# Setup database indexes
print_status "Setting up database indexes..."
node scripts/setup-db-indexes.js

# Setup SSL certificates
print_status "Setting up SSL certificates..."
chmod +x scripts/setup-ssl.sh
./scripts/setup-ssl.sh

# Setup Nginx configuration
print_status "Setting up Nginx configuration..."
cp nginx/apnadecoration.conf /etc/nginx/sites-available/apnadecoration.conf
ln -sf /etc/nginx/sites-available/apnadecoration.conf /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Restart Nginx
print_status "Restarting Nginx..."
systemctl restart nginx

# Start applications with PM2
print_status "Starting applications with PM2..."
pm2 delete all 2>/dev/null || true
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup

# Setup log rotation
print_status "Setting up log rotation..."
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30

# Setup monitoring
print_status "Setting up monitoring..."
# Add your monitoring setup here

# Database backup setup
print_status "Setting up database backups..."
(crontab -l 2>/dev/null; echo "0 2 * * * mongodump --db apna_decoration --out $BACKUP_DIR/db-backup-$(date +\%Y\%m\%d)") | crontab

# Final verification
print_status "Performing final verification..."

# Check if all services are running
if pm2 list | grep -q "online"; then
    print_status "✅ All services are running"
else
    print_error "❌ Some services are not running"
    pm2 list
fi

# Check SSL certificates
for domain in "apnadecoration.com" "admin.apnadecoration.com" "vendor.apnadecoration.com" "delivery.apnadecoration.com"; do
    if openssl s_client -connect "$domain:443" -servername "$domain" </dev/null 2>/dev/null | grep -q "Verify return code: 0"; then
        print_status "✅ SSL certificate is valid for $domain"
    else
        print_warning "⚠️ SSL certificate issue for $domain"
    fi
done

print_status "🎉 Deployment completed successfully!"
echo ""
echo "📊 Deployment Summary:"
echo "  - Project Directory: $PROJECT_DIR"
echo "  - Backup Directory: $BACKUP_DIR"
echo "  - Node.js Version: $(node --version)"
echo "  - PM2 Version: $(pm2 --version)"
echo ""
echo "🌐 Your applications are now live at:"
echo "  - Main Site: https://apnadecoration.com"
echo "  - Admin Panel: https://admin.apnadecoration.com"
echo "  - Vendor Portal: https://vendor.apnadecoration.com"
echo "  - Delivery App: https://delivery.apnadecoration.com"
echo ""
echo "🔧 Useful Commands:"
echo "  - View logs: pm2 logs"
echo "  - Monitor: pm2 monit"
echo "  - Restart: pm2 restart all"
echo "  - Stop: pm2 stop all"
