# Perkd Merchant Portal

The web app merchants use to manage their presence on the Perkd platform — register their business, create and manage promotional offers, and track their account status.

Live at **https://lifejes.com/**

---

## What this app does

| Feature | Status |
|---|---|
| Merchant registration (multi-step wizard) | ✅ Live |
| Login / logout (Keycloak auth) | ✅ Live |
| Dashboard (stats + latest offers) | ✅ Live |
| Profile setup (logo URL, description, coordinates) | ✅ Live |
| Offer creation & editing (10 offer types) | ✅ Live |
| Offer activation / pause / delete | ✅ Live |
| Per-offer contact override | ✅ Live |
| Image file upload (logo/cover) | ❌ Not yet — URL input only |
| Consumer-facing offer tile / browse | ❌ Not yet — data model ready |
| Admin portal | ❌ Separate product, not started |

---

## Running locally

### What you need first

1. **Node.js 20 or newer** — download from https://nodejs.org (choose the LTS version)
2. **Git** — https://git-scm.com
3. **The backend running locally** — see [lifejes-be-gateway](../lifejes-be-gateway/README.md). The frontend talks to it on `http://localhost:3233`.

### Setup steps

```bash
# 1. Clone the repo (skip if you already have it)
git clone https://github.com/edwin-lifejes/perkd-merchant-portal.git
cd perkd-merchant-portal

# 2. Install dependencies
npm install

# 3. Create your local environment file
echo "VITE_API_URL=http://localhost:3233" > .env.local

# 4. Start the dev server
npm run dev
```

Open your browser at **http://localhost:5173**

The page hot-reloads whenever you save a file — no need to restart.

### Stopping

Press `Ctrl + C` in the terminal where you ran `npm run dev`.

---

## Common issues

**"Failed to load dashboard" / "500 Internal Server Error"**
The backend is not running. Start `lifejes-be-gateway` first (see its README).

**Page loads but login fails with a network error**
Check that `.env.local` exists and contains `VITE_API_URL=http://localhost:3233`. If the file is missing, run `echo "VITE_API_URL=http://localhost:3233" > .env.local` and restart the dev server.

**`npm install` fails**
Make sure you have Node.js 20+. Run `node --version` — if it says v18 or lower, update Node.js.

**Changes I made are not showing**
The dev server watches for file changes automatically. If something seems stuck, stop and restart `npm run dev`.

---

## Deploying to production

> These steps are for the person responsible for deployment. Non-technical team members do not need to do this.

Production site is served from **`138.197.149.94`** (nginx static file server), domain `lifejes.com`.

```bash
# 1. Make sure .env.local does NOT exist (it would override production settings)
rm -f .env.local

# 2. Build
npm run build

# 3. Verify no localhost in the bundle (should return nothing)
grep -r 'localhost' dist/assets/*.js || echo "Clean — no localhost found"

# 4. Upload to server
rsync -avz --delete dist/ root@138.197.149.94:/var/www/lifejes_react/

# 5. Restore local dev file
echo "VITE_API_URL=http://localhost:3233" > .env.local
```

### Pre-deployment checklist

- [ ] `.env.local` deleted before building
- [ ] `npm run build` completed with zero TypeScript errors
- [ ] No `localhost` in `dist/assets/*.js`
- [ ] All changes committed and pushed to GitHub
- [ ] Smoke-test after upload: open https://lifejes.com, log in, check Network tab for errors

### Production environment file

`VITE_API_URL` for production is set in `.env.production` (committed to the repo):

```
VITE_API_URL=https://techjesinovation.com
```

Do **not** commit `.env.local` or `.env` — both are gitignored. A pre-commit hook will block you if you accidentally stage them.

---

## Infrastructure overview

| Component | Where | Notes |
|---|---|---|
| Frontend static files | `138.197.149.94` | nginx serves `/var/www/lifejes_react/` |
| Backend API | `146.190.116.175` | Node.js on port 3233, PM2, nginx proxy |
| Keycloak auth server | `146.190.116.175` | Docker, proxied at `https://techjesinovation.com/auth/` |
| MongoDB | MongoDB Atlas | Connection string in backend `.env` |
| Image storage | DigitalOcean Spaces | `tor1` region, backend handles signed URLs |

SSH access:
- Frontend server: `ssh root@138.197.149.94`
- Backend server: `ssh root@146.190.116.175`

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | React 19 |
| Language | TypeScript |
| Build tool | Vite 8 |
| Routing | react-router-dom v7 |
| HTTP client | axios v1 |
| Icons | Google Material Symbols Outlined (font-based) |
| Styling | Plain CSS + CSS custom properties (no framework) |
| Auth | Keycloak ROPC flow via `/auth-config` → token exchange |

---

## Working with Claude Code

This repo has a `CLAUDE.md` file with full context for AI coding assistants. When starting a Claude Code session in this directory, Claude will automatically read it and understand the project state, conventions, and pending work.

To continue development with a new Claude account: open the repo folder in Claude Code — it will read `CLAUDE.md` and pick up where the previous session left off.
