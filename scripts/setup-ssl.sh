#!/bin/bash

# SSL Certificate Setup Script for APNA DECORATION
# This script sets up SSL certificates using Let's Encrypt

set -e

echo "🔒 Setting up SSL certificates for APNA DECORATION..."

# Define domains
DOMAINS=(
    "apnadecoration.com"
    "www.apnadecoration.com"
    "admin.apnadecoration.com"
    "vendor.apnadecoration.com"
    "delivery.apnadecoration.com"
)

# Email for Let's Encrypt
EMAIL="admin@apnadecoration.com"

# Install Certbot if not already installed
if ! command -v certbot &> /dev/null; then
    echo "📦 Installing Certbot..."
    sudo apt update
    sudo apt install -y certbot python3-certbot-nginx
fi

# Stop Nginx to allow certificate generation
echo "⏸️ Stopping Nginx..."
sudo systemctl stop nginx

# Obtain SSL certificates for each domain
for domain in "${DOMAINS[@]}"; do
    echo "🔐 Obtaining SSL certificate for $domain..."
    
    if [[ $domain == "apnadecoration.com" ]] || [[ $domain == "www.apnadecoration.com" ]]; then
        # Main domain with www redirect
        sudo certbot certonly --standalone \
            -d "$domain" \
            -d "www.$domain" \
            --email "$EMAIL" \
            --agree-tos \
            --non-interactive \
            --staging  # Remove --staging for production certificates
    else
        # Subdomains
        sudo certbot certonly --standalone \
            -d "$domain" \
            --email "$EMAIL" \
            --agree-tos \
            --non-interactive \
            --staging  # Remove --staging for production certificates
    fi
    
    echo "✅ Certificate obtained for $domain"
done

# Create SSL directory structure
echo "📁 Creating SSL directory structure..."
sudo mkdir -p /etc/letsencrypt/live
sudo mkdir -p /etc/letsencrypt/archive

# Test certificate renewal
echo "🧪 Testing certificate renewal..."
sudo certbot renew --dry-run

# Start Nginx
echo "▶️ Starting Nginx..."
sudo systemctl start nginx

# Setup automatic renewal
echo "⏰ Setting up automatic certificate renewal..."
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet && systemctl reload nginx") | crontab -

echo "✅ SSL setup complete!"
echo ""
echo "📋 Certificate Locations:"
for domain in "${DOMAINS[@]}"; do
    echo "  - $domain: /etc/letsencrypt/live/$domain/"
done

echo ""
echo "🔄 Auto-renewal has been scheduled via cron."
echo "🌐 Your sites are now accessible with HTTPS!"
echo ""
echo "⚠️  IMPORTANT: Remove the --staging flag from the certbot commands above to get production certificates!"
