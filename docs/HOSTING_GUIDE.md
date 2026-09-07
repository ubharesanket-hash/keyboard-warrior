# Production Hosting & Deployment Guide
## Keyboard Warrior: Stickman Typing Battle
**Student Name:** Sanket Ananta Ubhare (CS-9148)  
**Degree:** T.Y.B.Sc. Computer Science (2026–27)  
**College:** MES's The D. G. Ruparel College of Arts, Science and Commerce  

---

## 🌐 Overview of Hosting Options

The **Keyboard Warrior** game engine is architected as a decoupled full-stack application (HTML5 Canvas + Web Audio client with a Node.js/Express backend). It can be deployed using any of the following free and production-grade hosting methods:

| Method | Target Platform | Best Used For | Setup Time | Cost |
| :--- | :--- | :--- | :--- | :--- |
| **Option 1 (Recommended)** | **Render.com** | Full-Stack Node.js + Persistent Leaderboard | ~3 Mins | 100% Free |
| **Option 2** | **Railway.app** | High-performance container / Node hosting | ~2 Mins | Free Tier |
| **Option 3** | **Vercel** | Serverless edge deployment (`vercel.json`) | ~2 Mins | 100% Free |
| **Option 4** | **Instant Tunnel (`localtunnel` / `ngrok`)** | Instant public link for live viva demo | **10 Seconds** | 100% Free |
| **Option 5** | **Docker Container** | Self-hosted VPS / Cloud Run / AWS ECS | ~5 Mins | Variable |

---

## 🚀 Option 1: Deploying to Render.com (Recommended)

Render offers free web service hosting with automatic HTTPS and Git integration.

### Steps:
1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "feat: add production hosting configurations"
   git remote add origin https://github.com/<your-username>/keyboard-warrior-stickman.git
   git push -u origin master
   ```
2. Go to **[render.com](https://render.com)** and create a free account.
3. Click **New +** -> **Web Service**.
4. Connect your GitHub repository.
5. Render will automatically read `render.yaml` or you can fill in:
   - **Name:** `keyboard-warrior-stickman`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** `Free`
6. Click **Create Web Service**.
7. In ~2 minutes, your live public URL will be ready (e.g. `https://keyboard-warrior-stickman.onrender.com`).

---

## ⚡ Option 2: Deploying to Railway.app

1. Go to **[railway.app](https://railway.app)**.
2. Click **New Project** -> **Deploy from GitHub repo**.
3. Select your `keyboard-warrior` repository.
4. Railway will automatically detect the `Dockerfile` or `package.json` and deploy.
5. In **Settings** -> **Networking**, click **Generate Domain** to get your public `.up.railway.app` URL.

---

## ⚡ Option 3: Deploying to Vercel

The repository includes a ready-to-use [`vercel.json`](../vercel.json).
1. Install Vercel CLI or connect via GitHub on [vercel.com](https://vercel.com).
2. Run in terminal:
   ```bash
   npx vercel
   ```
3. Follow the CLI prompts to deploy in seconds.

---

## 🔗 Option 4: Instant Public Live Demo via Tunnel (Zero Setup)

If you need to give an examiner or friend a live public HTTPS URL **instantly from your laptop** without signing up for cloud services:

1. Make sure your local server is running:
   ```bash
   npm start
   ```
2. In a second terminal window, run:
   ```bash
   npx localtunnel --port 3000
   ```
   *Or with Cloudflare Tunnel:*
   ```bash
   npx cloudflared tunnel --url http://localhost:3000
   ```
3. The command will output a public HTTPS link (e.g., `https://brave-warrior-77.loca.lt`). Anyone anywhere in the world can open this link on their laptop or phone to play your live game!

---

## 🐳 Option 5: Running with Docker

Build and run the container locally or on any cloud server:

```bash
# 1. Build the Docker container image
docker build -t keyboard-warrior .

# 2. Run the container on port 3000
docker run -d -p 3000:3000 --name keyboard-warrior-app keyboard-warrior

# 3. View logs
docker logs -f keyboard-warrior-app
```

---

## 🛡️ Production Verification Checklist

- [x] Environment variable support (`PORT`, `NODE_ENV`).
- [x] Static asset caching enabled for production.
- [x] Security headers (`X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`).
- [x] Anti-cheat sanity bounds on score submission API.
- [x] Atomic JSON persistence for leaderboard entries.
