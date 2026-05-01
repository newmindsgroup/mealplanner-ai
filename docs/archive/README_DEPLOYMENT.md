# Meal Plan Assistant - cPanel Deployment Guide

Complete guide for deploying Meal Plan Assistant on cPanel hosting with MySQL.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Pre-Deployment Setup](#pre-deployment-setup)
3. [Installation Steps](#installation-steps)
4. [Post-Installation Configuration](#post-installation-configuration)
5. [Running the Application](#running-the-application)
6. [Troubleshooting](#troubleshooting)
7. [Maintenance](#maintenance)

---

## Prerequisites

### Server Requirements

- **cPanel Hosting** with SSH access
- **Node.js 18+** (available in cPanel or via NodeJS Selector)
- **MySQL 5.7+** or **MariaDB 10.3+**
- **PHP 7.4+** (for installer only)
- **SSL Certificate** (recommended for production)

### What You'll Need

- Database credentials
- SSH access to your server
- Domain or subdomain configured

---

## Pre-Deployment Setup

### 1. Download & Upload Files

1. Download the Meal Plan Assistant package
2. Upload to your cPanel account via:
   - **File Manager**, or
   - **FTP/SFTP client** (FileZilla, Cyberduck, etc.), or
   - **SSH** (`scp` or `rsync`)

**Recommended location:** `/home/username/public_html/mealplan/`

### 2. Set Up Node.js

#### Option A: Using cPanel Node.js Selector

1. Log in to cPanel
2. Go to **Software** → **Setup Node.js App**
3. Click **Create Application**
4. Configure:
   - **Node.js version:** 18.x or higher
   - **Application mode:** Production
   - **Application root:** `/home/username/public_html/mealplan`
   - **Application URL:** Your domain/subdomain
   - **Application startup file:** `server/index.js`
5. Click **Create**

#### Option B: Manual Node.js Installation via SSH

```bash
# Download Node.js 18.x
wget https://nodejs.org/dist/v18.19.0/node-v18.19.0-linux-x64.tar.xz

# Extract
tar -xf node-v18.19.0-linux-x64.tar.xz

# Add to PATH (add to ~/.bashrc)
export PATH=$HOME/node-v18.19.0-linux-x64/bin:$PATH

# Verify
node --version
npm --version
```

### 3. Create MySQL Database

1. Log in to cPanel
2. Go to **Databases** → **MySQL Databases**
3. Create a new database: `username_mealplan`
4. Create a new user with a strong password
5. Add user to database with **ALL PRIVILEGES**
6. Note down:
   - Database name
   - Database user
   - Database password
   - Database host (usually `localhost`)

---

## Installation Steps

### Step 1: Access the Installer

1. Navigate to your domain/subdomain in a web browser
2. You should see: `https://yourdomain.com/install/`
3. Follow the Installation Wizard

### Step 2: Requirements Check

The installer will verify:
- ✓ PHP version & extensions
- ✓ File permissions
- ✓ Node.js & NPM availability
- ✓ MySQL connection

Fix any issues before proceeding.

### Step 3: Database Configuration

Enter your MySQL credentials:
- **Database Host:** `localhost` (or as provided by host)
- **Database Name:** Your database name
- **Username:** Your database user
- **Password:** Your database password

Click **Test Connection** to verify.

### Step 4: Admin Account

Create your administrator account:
- **Full Name**
- **Email Address**
- **Password** (minimum 6 characters)

### Step 5: Installation

The installer will:
1. Generate secure configuration files
2. Install Node.js dependencies
3. Create database tables (20+ tables)
4. Set up your admin account

This may take 3-5 minutes.

### Step 6: Completion

Once complete:
- Note your login credentials
- **Important:** Delete or rename the `install` directory for security

---

## Post-Installation Configuration

### 1. Start the Backend Server

#### Using cPanel Node.js App

1. Go to **Setup Node.js App** in cPanel
2. Click **Restart** on your application
3. Verify it's running (green status indicator)

#### Using PM2 (Recommended for advanced users)

```bash
# Install PM2 globally
npm install -g pm2

# Start the application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

#### Manual Start (for testing)

```bash
cd /home/username/public_html/mealplan/server
node index.js
```

The server should start on port 3001 (configurable in `.env`).

### 2. Configure Web Server Proxy

#### Apache (.htaccess)

Create or update `/home/username/public_html/mealplan/.htaccess`:

```apache
RewriteEngine On

# Proxy API requests to Node.js backend
RewriteCond %{REQUEST_URI} ^/api [NC]
RewriteRule ^(.*)$ http://localhost:3001/$1 [P,L]

# Serve static files
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://localhost:3001/$1 [P,L]
```

#### Nginx

If using Nginx, add to your server block:

```nginx
location /api {
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}

location / {
    try_files $uri $uri/ @nodejs;
}

location @nodejs {
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

### 3. Set Up SSL Certificate

1. Go to cPanel → **Security** → **SSL/TLS**
2. Install Let's Encrypt certificate (free) or upload your own
3. Update `.env` file:
   ```
   FRONTEND_URL=https://yourdomain.com
   ```

### 4. Configure Firewall (if applicable)

Ensure port 3001 is accessible internally but blocked externally:

```bash
# Allow localhost only
sudo ufw allow from 127.0.0.1 to any port 3001
```

### 5. Set Up Cron Jobs (Optional)

For automated tasks, add cron jobs in cPanel:

```bash
# Clean up expired tokens daily (1:00 AM)
0 1 * * * /usr/bin/node /home/username/public_html/mealplan/server/scripts/cleanup.js

# Check expiration alerts (every 6 hours)
0 */6 * * * /usr/bin/node /home/username/public_html/mealplan/server/scripts/alerts.js
```

---

## Running the Application

### Accessing the Application

Navigate to: `https://yourdomain.com`

### First Login

1. Click **Login** or **Register**
2. Use the admin credentials you created during installation
3. Complete the onboarding wizard
4. Start using the application!

### Setting Up API Keys (Optional)

Users can configure their own OpenAI or Anthropic API keys:

1. Go to **Settings** → **API Keys**
2. Enter your API key
3. Keys are encrypted and stored securely in the database

---

## Troubleshooting

### Server Not Starting

**Check Node.js is installed:**
```bash
node --version
npm --version
```

**Check server logs:**
```bash
pm2 logs mealplan-assistant
# or
tail -f /home/username/public_html/mealplan/logs/combined.log
```

**Common issues:**
- Port 3001 already in use → Change `PORT` in `.env`
- Database connection failed → Verify credentials in `.env`
- Missing dependencies → Run `npm install` in `server/` directory

### Database Connection Errors

1. Verify database exists: Log in to phpMyAdmin
2. Check user permissions: ALL PRIVILEGES required
3. Test connection:
   ```bash
   mysql -h localhost -u dbuser -p dbname
   ```

### 502 Bad Gateway

- Backend server is not running → Start it
- Proxy configuration incorrect → Check `.htaccess` or nginx config
- Firewall blocking connections → Check firewall rules

### Cannot Upload Files

1. Create upload directories:
   ```bash
   mkdir -p uploads/lab-reports uploads/labels uploads/knowledge-base
   chmod 755 uploads
   ```
2. Check permissions in cPanel File Manager

### Frontend Not Loading

1. Verify build files exist in `public/` directory
2. Rebuild frontend:
   ```bash
   npm run build
   ```
3. Check `.htaccess` rewrite rules

---

## Maintenance

### Updating the Application

1. **Backup database:**
   ```bash
   mysqldump -u dbuser -p dbname > backup_$(date +%Y%m%d).sql
   ```

2. **Backup .env file:**
   ```bash
   cp .env .env.backup
   ```

3. **Update files** (upload new version)

4. **Run migrations:**
   ```bash
   cd server
   node database/migrate.js
   ```

5. **Restart server:**
   ```bash
   pm2 restart mealplan-assistant
   ```

### Database Backup

**Manual backup:**
```bash
mysqldump -u dbuser -p dbname > backup.sql
```

**Automated backup (cron):**
```bash
# Daily at 2:00 AM
0 2 * * * mysqldump -u dbuser -p'password' dbname > /home/username/backups/mealplan_$(date +\%Y\%m\%d).sql
```

### Log Rotation

Add to cron:
```bash
# Rotate logs weekly
0 0 * * 0 cd /home/username/public_html/mealplan && pm2 flush
```

### Security Updates

1. Keep Node.js updated
2. Update npm packages regularly:
   ```bash
   cd server
   npm update
   npm audit fix
   ```
3. Monitor security advisories
4. Keep MySQL/MariaDB updated

---

## Performance Optimization

### Enable Compression

Already enabled in Express with `compression` middleware.

### Use CDN (Optional)

For static assets, consider using a CDN like Cloudflare.

### Database Optimization

```sql
-- Analyze tables periodically
ANALYZE TABLE users, meal_plans, pantry_items;

-- Optimize tables
OPTIMIZE TABLE users, meal_plans, pantry_items;
```

### Monitor Resource Usage

```bash
# Check memory usage
pm2 monit

# Check database connections
mysql -u dbuser -p -e "SHOW PROCESSLIST"
```

---

## Support & Additional Resources

### Documentation

- [User Guide](./README.md)
- [API Documentation](./API_DOCS.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)

### Getting Help

- Check server logs for errors
- Review cPanel error logs
- Test database connectivity
- Verify Node.js is running

### Common File Locations

- **Application:** `/home/username/public_html/mealplan/`
- **Configuration:** `/home/username/public_html/mealplan/.env`
- **Logs:** `/home/username/public_html/mealplan/logs/`
- **Uploads:** `/home/username/public_html/mealplan/uploads/`
- **Database Backups:** `/home/username/backups/`

---

## Security Checklist

- [ ] SSL certificate installed and working
- [ ] `install/` directory deleted or renamed
- [ ] Strong database password
- [ ] `.env` file protected (not web-accessible)
- [ ] Regular backups configured
- [ ] Firewall rules configured
- [ ] Server and dependencies up to date
- [ ] Admin account uses strong password
- [ ] File permissions set correctly (755 for dirs, 644 for files)

---

**Congratulations!** Your Meal Plan Assistant is now deployed and ready to use. 🎉

