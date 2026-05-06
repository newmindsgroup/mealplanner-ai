# NourishAI — Deployment Guide

## Architecture Overview

```
                    ┌─────────────┐
                    │   NGINX     │
                    │  (Port 80)  │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            │
     ┌────────────┐  ┌──────────┐      │
     │ Express    │  │ Static   │      │
     │ API Server │  │ Assets   │      │
     │ (Port 3001)│  │ (dist/)  │      │
     └─────┬──────┘  └──────────┘      │
           │                           │
    ┌──────┼──────┐                    │
    │      │      │                    │
    ▼      ▼      ▼                    ▼
┌──────┐ ┌────┐ ┌──────────┐   ┌──────────┐
│MySQL │ │JWT │ │ /swarm/* │──▶│ NourishAI│
│(3306)│ │Auth│ │ proxy    │   │  Swarm   │
└──────┘ └────┘ └──────────┘   │ (Port    │
                                │  8000)   │
                                └──────────┘
```

## Quick Start (Docker)

### 1. Clone and configure

```bash
git clone https://github.com/newmindsgroup/mealplanner-ai.git
cd mealplanner-ai
cp .env.example .env
```

### 2. Set required environment variables

Edit `.env` with your values:

```bash
# Required
DATABASE_PASSWORD=<strong-password>
JWT_SECRET=<64-char-hex-secret>
ENCRYPTION_KEY=<32-char-hex-key>
OPENAI_API_KEY=sk-...

# Recommended
USDA_API_KEY=<from fdc.nal.usda.gov>
SEARCH_API_KEY=<for PubMed research>

# Generate secrets:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Build and run

```bash
docker compose up -d --build
```

### 4. Verify

```bash
# App health
curl http://localhost:3001/api/health

# Swarm health
curl http://localhost:3001/api/swarm/health

# NGINX
curl http://localhost/health
```

## Manual Deployment (VPS)

### Prerequisites
- Node.js 20+
- MySQL 8.0+
- PM2 (process manager)
- NGINX

### 1. Install dependencies

```bash
# Frontend
npm ci
npm run build

# Server
cd server
npm ci --production
cd ..
```

### 2. Database setup

```bash
mysql -u root -p -e "CREATE DATABASE mealplan_assistant;"
mysql -u root -p -e "CREATE USER 'nourishai'@'localhost' IDENTIFIED BY 'your_password';"
mysql -u root -p -e "GRANT ALL ON mealplan_assistant.* TO 'nourishai'@'localhost';"
```

### 3. Start with PM2

```bash
# Uses ecosystem.config.js
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 4. Configure NGINX

```bash
sudo cp deploy/nginx.conf /etc/nginx/conf.d/nourishai.conf
# Edit server_name to your domain
sudo nginx -t
sudo systemctl reload nginx
```

### 5. SSL with Certbot

```bash
sudo certbot --nginx -d your-domain.com
```

## Environment Variables Reference

| Variable | Required | Default | Description |
|---|---|---|---|
| `NODE_ENV` | Yes | `development` | `production` for deployment |
| `PORT` | Yes | `3001` | Express server port |
| `DATABASE_HOST` | Yes | `localhost` | MySQL host |
| `DATABASE_USER` | Yes | `root` | MySQL user |
| `DATABASE_PASSWORD` | Yes | — | MySQL password |
| `DATABASE_NAME` | Yes | `mealplan_assistant` | MySQL database |
| `JWT_SECRET` | Yes | — | 64-char hex secret |
| `JWT_EXPIRY` | No | `7d` | JWT token expiry |
| `ENCRYPTION_KEY` | Yes | — | 32-char hex key |
| `OPENAI_API_KEY` | Yes | — | OpenAI API key |
| `ANTHROPIC_API_KEY` | No | — | Anthropic API key |
| `AI_PROVIDER` | No | `anthropic` | `openai` or `anthropic` |
| `NOURISH_SWARM_URL` | No | `http://localhost:8000` | Swarm sidecar URL |
| `USDA_API_KEY` | No | — | USDA FoodData Central |
| `SEARCH_API_KEY` | No | — | Web search for research |
| `GOOGLE_AI_STUDIO_KEY` | No | — | Gemini features |
| `FRONTEND_URL` | No | `http://localhost:5173` | CORS origin |

## NourishAI Swarm Setup

The swarm runs as a separate service:

```bash
git clone https://github.com/newmindsgroup/openswarm-health.git
cd openswarm-health
cp .env.example .env
# Set OPENAI_API_KEY, USDA_API_KEY, SEARCH_API_KEY
pip install -r requirements.txt
python server.py --port 8000
```

Or via Docker Compose (included in `docker-compose.yml`).

## Monitoring

### Health endpoints
- `GET /api/health` — Express server status
- `GET /api/swarm/health` — NourishAI swarm status
- `GET /health` — NGINX proxy status

### PM2 monitoring
```bash
pm2 status
pm2 logs nourishai-app
pm2 monit
```

### Docker monitoring
```bash
docker compose ps
docker compose logs -f app
docker compose logs -f swarm
```
