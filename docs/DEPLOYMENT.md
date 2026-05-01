# Deployment Guide

## Option 1: cPanel (Shared Hosting)

### Quick Deploy
```bash
./deploy-to-cpanel.sh
```
This builds the frontend and creates `meal-plan-assistant-cpanel.zip`.

### Steps
1. Upload ZIP to cPanel File Manager → `public_html`
2. Extract the ZIP
3. Rename `config.example.js` → `config.js`
4. Add your API key to `config.js`
5. Set `.htaccess` permissions to 644
6. Visit your domain

### For Full-Stack on cPanel
1. Upload all files including `server/`
2. Set up MySQL database in cPanel
3. Run `server/database/schema.sql` via phpMyAdmin
4. Configure Node.js app in cPanel or use PM2
5. Access installer at `https://yourdomain.com/install/`

## Option 2: VPS / Dedicated Server

```bash
# Build frontend
npm run build

# Start with PM2
pm2 start ecosystem.config.js

# Or start manually
cd server && NODE_ENV=production node index.js
```

### PM2 Config (`ecosystem.config.js`)
- App name: `mealplan-assistant`
- Script: `./server/index.js`
- Auto-restart: enabled
- Max memory: 1GB
- Log files in `./logs/`

## Option 3: Development Only

```bash
npm run dev      # Frontend on :5173
cd server && npm run dev  # Backend on :3001
```

## Environment Checklist

- [ ] `.env` configured with all required values
- [ ] MySQL database created and schema imported
- [ ] At least one AI API key configured
- [ ] SSL certificate installed (production)
- [ ] File permissions set (644 files, 755 dirs)
- [ ] `uploads/` directory created and writable
